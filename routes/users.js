var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var User = require("../models/User");
var fs = require('fs')
var config = require('../config')
const cors = require('cors')
var bodyParser = require('body-parser')

router.post("/login", cors(), (req, res, next) => {
  const { username, email, password } = req.body;

  if(!email || !password) {
    res.status(500).json({
      status: false,
      message: "Lütfen tüm zorunlu alanları doldurun."
    });
  }

  User.findOne({ email })
    .then(user => {

      if(password !== user.password) {
        res.status(500).json({
          status: false,
          message: "Kullanıcı adı veya şifre yanlış."
        });
      }

      const payLoad = { email };
      const token = jwt.sign(payLoad, { key: fs.readFileSync('./private.pem'), passphrase: config.pass }, { algorithm: 'RS256', expiresIn: '1m' /* minutes */ })

      /*try {
        const verify = jwt.verify(token, fs.readFileSync('./public.pem'), { algorithms: ['RS256'] })
        console.log('verify', verify)
      } catch(err) {
        res.send('başarısız')
      }*/

      res.json({
        status: true,
        email: user.email,
        password: user.password,
        uid: user._id,
        token
      });

      /*bcrypt.compare(password, user.password)
        .then(data => {

          if (!data)
            res.json({
              status: false,
              message: "Kullanıcı adı veya şifre yanlış."
            });
          else {
            //şifre doğru
          }
        });*/

    })
    .catch(() => {
      res.status(500).json({
        status: false,
        message: 'Kullanıcı bulunamadı.'
      });
    });
});

router.get('/', (req, res, next) => {
  User.find().then((users) => {
    res.json(users);
  }).catch((err) => {
    res.json(err);
  });
});

router.post("/create", cors(), (req, res, next) => {
  const email = req.body.email;

  console.log('email', email)

  User.findOne({ email })
    .then((user) => {

      if(user) {
        res.status(500).json({
          status: false,
          message: "Bu e-posta adresi ile daha önce kayıt olunmuş."
        })
      } else {

        new User({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password
        }).save().then(() => {

          User.findOne({ email })
            .then((user) => {
              res.json({
                status: true,
                id: user._id,
                message: "Kullanıcı başarıyla oluşturuldu."
              });
            })

        }).catch((err) => {
          res.status(500).json({
            status: false,
            message: "Kullanıcı oluşturulamadı."
          });
        });

      }

    })

});

module.exports = router;
