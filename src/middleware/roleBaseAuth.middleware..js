module.exports = (ids) => {
  return function (req, res, next) {
    if (!Array.isArray(ids)) {
      return badReqResponse(res, "ids must be an array");
    }

    if (!ids.includes(req.user.role))
      return res.status(403).send({ success: false, message: "Access denied" });

    next();
  };
};
