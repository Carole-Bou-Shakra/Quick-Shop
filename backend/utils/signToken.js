const jwt = require('jsonwebtoken');

const signToken = (user) => {
    let token = jwt.sign({ ...user.toObject(), password: '' },  process.env.JWT_Secret);
   
    return token;
}
module.exports = signToken;