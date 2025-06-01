import * as admin from 'firebase-admin';
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

const db = admin.firestore();

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

  if (before?.isActive && !after?.isActive) {
    // Remove from user carts using a transaction per cart
    const cartsSnap = await db.collection('carts').get();
    const cartRemovals = cartsSnap.docs.map(async (cartDoc) => {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(cartDoc.ref);
        const data = snap.data();
        if (!data?.items?.length) return;

        const filteredItems = data.items.filter((item: any) => item.postId !== postId);
        if (filteredItems.length !== data.items.length) {
          tx.update(cartDoc.ref, { items: filteredItems });
        }
      });
    });

    // Remove from seller's active posts
    const userId = after?.user?.userId;
    if (userId) {
      const activePostRef = db
        .collection('users')
        .doc(userId)
        .collection('activePosts')
        .doc(postId);
      await activePostRef.delete().catch(console.error);
    }

    // Update conversations where post title matches
    const conversationsSnap = await db.collection('conversations')
      .where('relatedPost.title', '==', after?.title)
      .get();

    const convoUpdates = conversationsSnap.docs.map(doc =>
      doc.ref.update({
        'relatedPost.isActive': false,
        lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    );

    // Wait for all updates to complete
    await Promise.all([...cartRemovals, ...convoUpdates]);
  }

  /* if (before?.isActive && !(after?.isActive)) { 
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
  } */
});