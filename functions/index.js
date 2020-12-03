const functions = require("firebase-functions");
const sendEmailOnCreateEvent = require("./onEventCreate.f");
const createUserNotifications = require("./onPublishCreateUserNotification.f");
const sendEmailOnCreateFeedback = require("./onCreateFeedback.f");

exports.sendEmailOnCreateEvent = functions.firestore
  .document("/events/{uid}")
  .onCreate(sendEmailOnCreateEvent.handler);

exports.createUserNotificationsDailyPubSub = functions.pubsub
  .topic("create-user-notifications")
  .onPublish(createUserNotifications.handler);

exports.sendEmailOnCreateFeedBack = functions.firestore
  .document("/userFeedbacks/{uid}")
  .onCreate(sendEmailOnCreateFeedback.handler);
