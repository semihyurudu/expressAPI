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


router.post("/create", (req, res, next) => {
  const {name, uid} = req.body;
  const user_id = req.header('Authorization') ? (jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']) : (uid)

  if(!name) {
    res.status(500).json({
      status: false,
      message: "Lütfen liste adı giriniz."
    })
    return false
  } else if(!user_id) {
    res.status(500).json({
      status: false,
      message: "Kullanıcı bilgisi bulunamadı."
    })
    return false
  }

  List.findOne({ name, user_id })
    .then((list) => {

      if(list) {
        res.status(500).json({
          status: false,
          message: "Bu isim ile daha önce oluşturulmuş bir listeniz bulunmaktadır."
        })
      } else {

        new List({
          name,
          user_id,
          items: []
        }).save().then((listDetail) => {

          List.findOne({ _id: listDetail._id, user_id })
            .then(() => {

              res.json({
                message: "Liste başarıyla oluşturuldu.",
                id: listDetail._id,
                name: listDetail.name,
                items: listDetail.items,
                user_id
              });

              /*res.json({
                id: listDetail._id,
                items: listDetail.items,
                name: listDetail.name,
                user_id,
                message: "Liste başarıyla oluşturuldu."
              });*/
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


router.get('/', authentication.authenticateJWT, (req, res) => {
  List.find({user_id: jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']}).then((lists) => {
    res.json(lists)
  }).catch((err) => {
    res.json(err);
  });
});




module.exports = router;