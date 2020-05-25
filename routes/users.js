var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
var User = require("../models/User");
var fs = require('fs')
var config = require('../config')
var authentication = require('../helper/authentication')
var bcrypt = require('bcryptjs')

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if(!email || !password) {
    res.status(500).json({
      status: false,
      message: "Lütfen tüm zorunlu alanları doldurun."
    });
    return false
  }

  User.findOne({ email })
    .then(user => {

      bcrypt.compare(password, user.password, function(err, isMatch){

        if (err) {
          res.status(500).json({
            status: false,
            message: "Bir sorun oluştu lütfen tekrar deneyin."
          });
          return false;
        }

        if(!isMatch){
          res.status(500).json({
            status: false,
            message: "Kullanıcı adı veya şifre yanlış."
          });
          return false
        }

        const payLoad = { email, user_id: user._id };
        const token = jwt.sign(payLoad, {
          key: fs.readFileSync('./private.pem'),
          passphrase: config.pass
        }, {
          algorithm: 'RS256',
          expiresIn: '60m' /* minutes */
        })

        res.json({
          status: true,
          email: user.email,
          uid: user.id,
          token
        });
      });

    })
    .catch(() => {
      res.status(500).json({
        status: false,
        message: 'Kullanıcı bulunamadı.'
      });
    });
});

router.get("/refresh-token", authentication.authenticateJWT, (req, res) => {

  const token = req.header('Authorization').replace('Bearer ', '')
  jwt.verify(token, fs.readFileSync('./public.pem'), {
    algorithms: ['RS256'],
  }, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: err
      });
    }

    const newToken = jwt.sign({
      email: user.email,
      user_id: user.user_id
    }, {
      key: fs.readFileSync('./private.pem'),
      passphrase: config.pass
    }, {
      algorithm: 'RS256',
      expiresIn: '60m' /* minutes */
    })

    res.json({
      token: newToken
    })

  });

});


router.post("/create", (req, res, next) => {
  const email = req.body.email;

  User.findOne({ email })
    .then((user) => {

      if(user) {
        res.status(500).json({
          status: false,
          message: "Bu e-posta adresi ile daha önce kayıt olunmuş."
        })
      } else {

        bcrypt.hash(req.body.password, 10, function(err, hash){
          if (err) {
            res.status(500).json({
              status: false,
              message: "Bir sorun oluştu lütfen tekrar deneyin."
            });
            return false;
          }

          new User({
            username: req.body.username,
            email: req.body.email,
            password: hash
          }).save().then((userDetail) => {

            User.findOne({ _id: userDetail._id })
              .then(() => {
                res.json({
                  status: true,
                  id: userDetail.id,
                  message: "Kullanıcı başarıyla oluşturuldu."
                });
              })

          }).catch((err) => {
            res.status(500).json({
              status: false,
              message: "Kullanıcı oluşturulamadı."
            });
          });
        });

      }

    })

});

module.exports = router;
