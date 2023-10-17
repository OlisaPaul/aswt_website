// This auth property is used to check if a client is authorized to carry out a function or not.
// It expects a token to be sent as an header in the request sent by the client.
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async function (req, res, next) {
  // Checks to see if the token is present, in the x-auth-token header property.
  const token = req.params.token;
  if (!token)
    return res
      .status(401)
      .send({ success: false, message: "Access Denied. No token provided" });

  try {
    // If the token is present in the request, this verifies the request.
    // It sets the req.user property with the decoded token, if the token is valid
    const decoded = jwt.verify(token, process.env.jwtPrivateKey);
    req.user = decoded;

    if (!req.user.customerCanCreate)
      return res
        .status(400)
        .send({ success: false, message: "Invalid Web Token" });
    next();
  } catch (ex) {
    console.log(ex);
    // it throws an error which is caught and sent to the client as response.
    res.status(400).send({ success: false, message: "Invalid Web Token" });
  }
};
