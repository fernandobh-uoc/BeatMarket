import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger: When a user is updated
 *  - If the username and/or profile picture changes, update all their posts user info
 *  - If the username and/or profile picture changes, update them in all conversations where the user is a participant 
 *  - Do not updated the sales where the user is a buyer or a seller, these are meant to be a snapshot (the sale lookups are made by user id, that never changes)
 */
export const onUserUpdated = onDocumentUpdated('users/{userId}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const userId = event.params.userId;

  if (!before || !after) return;

  const usernameChanged = before.username !== after.username;
  const profileChanged = before.profilePictureURL !== after.profilePictureURL;

  if (!usernameChanged && !profileChanged) return;

  const batch = db.batch();

  const newUserData = {
    username: after.username,
    profilePictureURL: after.profilePictureURL
  };

  // Update posts
  const postSnap = await db.collection('posts').where('user.userId', '==', userId).get();
  postSnap.forEach(doc => {
    batch.update(doc.ref, {
      user: {
        userId,
        ...newUserData
      }
    });
  });

  // Update conversations where user is the buyer
  const convBuyerSnap = await db.collection('conversations').where('participants.buyer.userId', '==', userId).get();
  convBuyerSnap.forEach(doc => {
    batch.update(doc.ref, {
      'participants.buyer.username': newUserData.username,
      'participants.buyer.profilePictureURL': newUserData.profilePictureURL
    });
  });

  // Update conversations where user is the seller
  const convSellerSnap = await db.collection('conversations').where('participants.seller.userId', '==', userId).get();
  convSellerSnap.forEach(doc => {
    batch.update(doc.ref, {
      'participants.seller.username': newUserData.username,
      'participants.seller.profilePictureURL': newUserData.profilePictureURL
    });
  });

  await batch.commit();
})

/**
 * Trigger: When a sale is created
 *  - Mark related post as inactive
 *  - Set post finished date to current date
 */
export const onSaleCreated = onDocumentCreated('sales/{saleId}', async (event) => {
  const saleData = event.data?.data();

  const postId = saleData?.postData?.postId;
  const postRef = db.collection('posts').doc(postId);
  try {
    await postRef.update({ 
      isActive: false,
      finishedAt: FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error(`Failed to mark post ${postId} as inactive: ${error}`);
  }
});

/**
 * Trigger: When a post is marked as inactive
 *  - Removes the post from all user carts
 *  - Removes the post from seller's active posts
 *  - Updates related conversations with isActive = true
 */
export const onPostStatusChange = onDocumentUpdated('posts/{postId}', async (event) => {
  const before = event.data?.before?.data();
  const after = event.data?.after?.data();
  const postId = event.params.postId;

  if (before?.isActive && !(after?.isActive)) { 
    const batch = db.batch();

    // Remove from carts
    const cartsSnap = await db.collection('carts').get();
    cartsSnap.forEach(doc => {
      const cart = doc.data();
      const filtered = (cart.items || []).filter(
        (item: any) => item.postId !== postId
      );
      if (filtered.length !== cart.items.length) {
        batch.update(doc.ref, { items: filtered });
      }
    });

    // Remove from seller's active posts
    const userId = after?.user?.userId;
    if (userId) {
      const activePostRef = db
        .collection('users')
        .doc(userId)
        .collection('activePosts')
        .doc(postId);

      batch.delete(activePostRef);
    }

    // Update conversations
    const conversationsSnap = await db.collection('conversations')
      .where('relatedPost.title', '==', after?.title)
      .get();

    conversationsSnap.forEach(doc => {
      batch.update(doc.ref, {
        'relatedPost.isActive': false,
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
  }
});

/**
 * Trigger: When a sale is created
 *  - Sends a push notification to the seller
 */
export const notifySale = onDocumentCreated('sales/{saleId}', async (event) => {
  const saleData = event.data?.data();

  const sellerId = saleData?.sellerData?.userId;
  if (!sellerId) return;

  const sellerUser = await db.collection('users').doc(sellerId).get();
  if (!sellerUser.exists) return;

  const fcmToken = sellerUser.data()?.fcmToken;
  if (!fcmToken) return;

  // Notify seller
  const postId = saleData?.postData?.postId;
  const postTitle = saleData?.postData?.title;
  const payload = {
    token: fcmToken,
    notification: {
      title: `¡Tu artículo se ha vendido!`,
      body: `El artículo ${postTitle} se ha vendido.`
    },
    data: {
      postId: postId,
      type: 'sale'
    }
  }
  
  try {
    await admin.messaging().send(payload);
    console.log(`Notification sent to seller ${sellerId}`);
  } catch (error) {
    console.error(`Error sending notificaiton to seller: ${error}`);
  }
});

export const notifyMessageReceived = onDocumentCreated('conversations/{conversationId}/messages/{messageId}', async (event) => {
  const messageData = event.data?.data();
  
  const recipientId = messageData?.recipientId;
  if (!recipientId) return;
  const recipientUser = await db.collection('users').doc(recipientId).get();
  if (!recipientUser.exists) return;

  const senderId = messageData?.senderId;
  if (!senderId) return;
  const senderUser = await db.collection('users').doc(senderId).get();
  if (!senderUser.exists) return;

  const conversationId = event.params.conversationId;
  const conversationData = await db.collection('conversations').doc(conversationId).get();
  if (!conversationData.exists) return;

  const fcmToken = recipientUser.data()?.fcmToken;
  if (!fcmToken) return;

  // Notify recipient
  const payload = {
    token: fcmToken,
    notification: {
      title: `¡Mensaje recibido!`,
      body: `${senderUser.data()?.username} te ha enviado un mensaje en relación al anuncio ${conversationData.data()?.relatedPost.title}`
    },
    data: {
      conversationId: conversationId,
      type: 'message'
    }
  }
  
  try {
    await admin.messaging().send(payload);
    console.log(`Notification sent to recipient ${recipientId}`);
  } catch (error) {
    console.error(`Error sending notificaiton to recipient: ${error}`);
  }
});