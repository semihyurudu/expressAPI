const jwt = require("jsonwebtoken");
const fs = require('fs')

module.exports = {
  authenticateJWT: (req, res, next) => {

    let token = req.header('Authorization')

    if (!token) {
      res.status(403).json({
        status: false,
        message: "Doğrulama kodu bulunamadı. Lütfen giriş yapın."
      })
    }

    token = token.replace('Bearer ', '')

    jwt.verify(token, fs.readFileSync('./public.pem'), {
      algorithms: ['RS256'],
    }, (err, user) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: "Oturumunuz sonlandırıldı, lütfen tekrar giriş yapın."
        })
      } else {
        if(!jwt.decode(token)['user_id']) {
          return res.status(401).json({
            status: false,
            message: "Kullanıcı bulunamadı. Lütfen giriş yapın."
          })
        }
      }

      req.user = user;
      next();
    });

  }
}