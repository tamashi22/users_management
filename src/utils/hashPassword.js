const bcrypt = require('bcryptjs');
/**
 * Hash the password using bcrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(password, salt);
};

module.exports = { hashPassword };
