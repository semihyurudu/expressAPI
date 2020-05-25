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
var helper = require('../helper/helper')
var {ObjectID} = require('mongodb')

router.get('/', authentication.authenticateJWT, (req, res) => {
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']

  List.find({user_id}).then((lists) => {
    res.json(lists)
  }).catch((err) => {
    res.status(500).json(err);
  });
});


router.post('/remove', authentication.authenticateJWT, (req, res) => {
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']
  const { list_id } = req.body

  if(!list_id) {
    res.status(500).json({
      status: false,
      message: "Silinecek liste bulunamadı."
    })
    return false
  }

  if(!helper.checkObjectId(list_id)) {
    res.status(500).json({
      status: false,
      message: "Geçersiz ID."
    })
    return false
  }


  List.findOne({user_id, _id: ObjectID(list_id)}).then((list) => {
    if(list) {

      List.deleteOne({user_id, _id: ObjectID(list_id)}).then((removed) => {

        if(removed.ok) {
          res.json({
            status: true,
            message: "Liste başarıyla silindi."
          })
        } else {
          res.status(500).json({
            status: true,
            message: "Liste silinirken bir sorun oluştu."
          })
        }

      }).catch((err) => {
        res.status(500).json(err);
      });

    } else {
      res.status(500).json({
        status: false,
        message: "Bu liste zaten silinmiş."
      })
    }
  })

});


router.post("/create", (req, res, next) => {
  const {name, uid} = req.body;
  const user_id = req.header('Authorization') ? (jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']) : (uid)

  if(!name) {
    res.status(500).json({
      status: false,
      message: "Lütfen liste adı giriniz."
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
                id: listDetail.id,
                name: listDetail.name,
                items: listDetail.items,
                user_id
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