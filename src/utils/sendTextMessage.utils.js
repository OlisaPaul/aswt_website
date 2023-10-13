require("dotenv").config();

const authToken = process.env.twilloAuthToken;
const accountSid = process.env.twilloAccountSid;
const twilloNumber = process.env.twilloNumber;

const client = require("twilio")(accountSid, authToken, {
  autoRetry: true,
  maxRetries: 3,
});

module.exports = function (customerNumber, body) {
  if (customerNumber.startsWith("0")) {
    customerNumber = customerNumber.substring(1);
  }

  client.messages
    .create({
      body,
      to: `${customerNumber}`, // Text your number
      from: twilloNumber, // From a valid Twilio number
    })
    .then((message) => console.log(message.sid))
    .catch((err) => console.log(err));
};
