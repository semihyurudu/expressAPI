const jwt = require("jsonwebtoken");
const fs = require('fs')

module.exports = {
  authenticateJWT: (req, res, next) => {
    const authHeader = req.headers.authorization.split(' ');

    if (authHeader.length > 1) {
      const token = authHeader[1];

      jwt.verify(token, fs.readFileSync('./public.pem'), {
        algorithms: ['RS256'],
      }, (err, user) => {
        if (err) {
          console.log('err', err)
          return res.sendStatus(403);
        }

        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
  }
}