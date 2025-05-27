import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';

const db = admin.firestore();

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