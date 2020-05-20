var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var User = require("../models/User");
var fs = require('fs')
var config = require('../config')
const cors = require('cors')

router.post("/getToken", (req, res, next) => {
  const { username, password } = req.body;
  User.findOne({ username })
    .then(user => {
      console.log('user', user, user.password, password)
      //Girilen username değerinde bir kayıt varsa burası çalışacaktır.

      bcrypt.compare(password, user.password)
        .then(data => {

          //Veritabanındaki şifrelenmiş password ile kullanıcıdan alınan password birbirlerini doğruluyorsa eğer data değeri true gelecektir. Aksi taktirde false değeri gelecektir.
          if (data)
            res.json({
              status: false,
              "message": "Kullanıcı adı veya şifre yanlış..."
            });
          else {
            //Eğer data parametresi true değerinde geldiyse token oluşturulacaktır.
            const payLoad = { username };

            const token = jwt.sign(payLoad, { key: fs.readFileSync('./private.pem'), passphrase: config.pass }, { algorithm: 'RS256' })

            /*try {
              const verify = jwt.verify(token, fs.readFileSync('./public.pem'), { algorithms: ['RS256'] })
              console.log('verify', verify)
            } catch(err) {
              res.send('başarısız')
            }*/

            // const token = jwt.sign(payLoad, req.app.get("api_secret_key"));
            res.json({
              status: true,
              username,
              token
            });

          }
        });
    })
    .catch(error => {
      res.json({
        status: false,
        "message": error
      });
      console.log("Beklenmeyen bir hatayla karşılaşıldı...")
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
  console.log('body', req.body)
  const username = req.body.username;
  new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  }).save().then(() => {

    User.findOne({ username })
      .then((user) => {
        res.json({
          status: true,
          id: user._id,
          message: "Kullanıcı başarıyla oluşturuldu."
        });
      })

  }).catch((err) => {
    res.json({
      status: false,
      message: "Kullanıcı oluşturulamadı."
    });
  });
});

module.exports = router;
