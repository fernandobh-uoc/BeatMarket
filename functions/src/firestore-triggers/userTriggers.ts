import * as admin from 'firebase-admin';
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

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