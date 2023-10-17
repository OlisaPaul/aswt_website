const sendText = require("../utils/sendTextMessage.utils");

module.exports = function (agenda) {
  agenda.define("sms reminder", async (job) => {
    const customerNumber = job.attrs.data.customerNumber;
    const body = job.attrs.data.body;

    sendText(customerNumber, body);
  });
};
