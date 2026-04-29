const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.status === 'restricted') {
      return res.status(403).json({ message: "Account restricted" });
    }

    req.user = decoded; // attaches user id to request

    next();

  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};