import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';

const db = admin.firestore();

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