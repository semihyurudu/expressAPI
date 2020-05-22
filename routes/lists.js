var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var List = require("../models/List");
var fs = require('fs')
var config = require('../config')
const cors = require('cors')
var bodyParser = require('body-parser')
var authentication = require('../helper/authentication')

router.get('/', authentication.authenticateJWT, (req, res, next) => {
  List.find().then((users) => {
    res.json(users);
  }).catch((err) => {
    res.json(err);
  });
});


router.post("/create", authentication.authenticateJWT, (req, res, next) => {
  const name = req.body.email;

  console.log('name', name)

  List.findOne({ name })
    .then((list) => {

      console.log('list', list)

      if(list) {
        res.status(500).json({
          status: false,
          message: "Bu isim ile daha önce oluşturulmuş bir listeniz bulunmaktadır."
        })
      } else {

        new List({
          name,
          user_id: req.header('Authorization')['user_id'],
          items: []
        }).save().then((listDetail) => {

          List.findOne({ _id: listDetail._id })
            .then(() => {
              res.json({
                id: listDetail._id,
                items: listDetail.items,
                name: listDetail.name,
                user_id: req.header('Authorization')['user_id'],
                message: "Liste başarıyla oluşturuldu."
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