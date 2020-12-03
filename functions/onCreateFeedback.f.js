const nodemailer = require("nodemailer");
const gmailAcc = require("./gmailCredentials");
const admin = require("./fb-admin");
const db = admin.firestore();

// Configure the email transport using the default SMTP transport and a GMail account.
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailAcc.credentials.email,
    pass: gmailAcc.credentials.password
  }
});

// Sends an email confirmation when a user creates an event.
exports.handler = (snap, context) => {
  // Get an object representing the document
  // e.g. {'name': 'Marie', 'age': 66}
  const newEvent = snap.data();
  const { uid } = context.params;
  const { message, userEmail, userName } = newEvent

  const mailOptions = {
    from: userEmail,
    to: "test.app@gmail.com"
  };
  // Building Email message.
  mailOptions.subject = `Feedback from  ${userName}`;
  mailOptions.text = message;

  return mailTransport
    .sendMail(mailOptions)
    .then(() => setEmailDeliveredFlag(uid))
    .catch(error => console.error("There was an error while sending the email:", error));
};

const setEmailDeliveredFlag = (uid) => {
  db.collection("userFeedbacks")
      .doc(uid)
      .update({emailDeliveredFlag: true})
      .then( () => console.log('emailDeliveredFlag on userFeedbacks set was successfully'))
      .catch( err => console.log(err))
}
