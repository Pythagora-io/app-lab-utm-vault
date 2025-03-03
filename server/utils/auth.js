const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
    role: user.role,
    organization: user.organization
  }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({
    id: user._id,
    email: user.email,
    role: user.role,
    organization: user.organization
  }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};