const jwt = require("jsonwebtoken");

function signToken(
  user_id,
  user_name,
  user_email
) {
  let token = jwt.sign(
    { id: user_id, name: user_name, email: user_email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
}
module.exports = signToken;