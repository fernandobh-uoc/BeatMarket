import * as admin from 'firebase-admin';
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

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