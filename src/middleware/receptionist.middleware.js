// This middleware checks if the user is an receptionist.
// The isAdmin property is only given at the database level for authencity
module.exports = function (req, res, next) {
  if (req.user.role != "receptionist")
    return res.status(403).send({ success: false, message: "Access denied" });

  next();
};
