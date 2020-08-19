import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();

admin.initializeApp();
const settings = { timestampsInSnapshots: true };
const db = admin.firestore();
db.settings(settings);

exports.pushNotification = functions.firestore.document('/docs/demo1')
    .onUpdate(async(change, context) => {
      const messages = [];
      messages.push({
        to: '<token>',
        title: 'updated',
        body: change.after.data().text,
      });

      let chunks = expo.chunkPushNotifications(messages);
      let tickets = [];
      (async () => {
        for (let chunk of chunks) {
          try {
            let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
          } catch (error) {
            functions.logger.log(error);
          }
        }
      })();
    });
