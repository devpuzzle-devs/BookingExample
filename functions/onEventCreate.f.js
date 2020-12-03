const nodemailer = require("nodemailer");
const moment = require("moment-timezone");

const gmailAcc = require("./gmailCredentials");

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

  const {
    name,
    organizer,
    location,
    tags,
    frequency,
    recommendAge,
    price,
    phoneNumber,
    email,
    weburl,
    about,
    startDateTime,
    endDateTime,
    createEventInfo
  } = newEvent;

  const { createEventUserName } = createEventInfo;
  if (createEventUserName === "crawler") {
    return null;
  }

  const mailOptions = {
    from: '"Test App" <test.app@gmail.com>',
    to: "test.app@gmail.com"
  };

  // Building Email message.
  mailOptions.subject = `Event ${name} created`;
  mailOptions.text = `
    Event ${name} has been created. 

    Event details: 
    Event Name: ${name}
    Organizer: ${organizer} 
    Location: ${location.venueName || location.address} 
    Description: ${about} 
    Tags: ${tags.join(", ")} 
    Frequency: ${frequency} 
    Start Date & Time: ${moment(startDateTime.toDate())
      .tz("America/Los_Angeles")
      .format("MM/DD/YY hh:mm A")}
    End Date & Time: ${moment(endDateTime.toDate())
      .tz("America/Los_Angeles")
      .format("MM/DD/YY hh:mm A")}
    Age: ${recommendAge.min} to ${recommendAge.max} 
    price: $${price.min} to $${price.max} 
    Phone: ${phoneNumber} 
    Email: ${email} 
    Website: ${weburl} 
    `;

  return mailTransport
    .sendMail(mailOptions)
    .then(() => console.log(`New confirmation email sent to:`, mailOptions.to))
    .catch(error =>
      console.error("There was an error while sending the email:", error)
    );
};
