/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger: When a post is sold
 * - Removes the post from all user carts
 * - Updates related conversations with isActive = true
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
    //console.log(`Post ${postId} marked as sold.`);
  }
});
