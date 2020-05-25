var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
var List = require("../models/List");
var Item = require("../models/Item");
var authentication = require('../helper/authentication')
var helper = require('../helper/helper')
var {ObjectID} = require('mongodb')

router.get('/', authentication.authenticateJWT, (req, res) => {
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']

  Item.find({user_id}).then((items) => {
    res.json(items)
  }).catch((err) => {
    res.status(500).json(err);
  });
});


router.post("/add", authentication.authenticateJWT, (req, res, next) => {

  const {list_id, data} = req.body;
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']

  if(!list_id) {
    res.status(500).json({
      status: false,
      message: "Liste bulunamadı"
    })
  }

  Item.findOne({list_id, user_id, 'data.id': data.id }).then((item) => {

    const currentDate = new Date()

    if(item) {
      res.status(500).json({
        status: false,
        message: "Bu içerik zaten listede bulunmaktadır."
      })
    } else {

      new Item({
        data,
        createdOn: currentDate,
        list_id,
        user_id
      }).save().then((newItem) => {
        res.json(newItem)
      })

    }
  })
});



router.post('/remove', authentication.authenticateJWT, (req, res) => {
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']
  const { list_id, id } = req.body

  if(!list_id) {
    res.status(500).json({
      status: false,
      message: "İçeriği silmek istediğiniz liste ID'si gereklidir."
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

      if(id) {

        if(!helper.checkObjectId(id)) {
          res.status(500).json({
            status: false,
            message: "Geçersiz ID."
          })
          return false
        }

        Item.findOne({user_id, list_id, _id: ObjectID(id)}).then((item) => {

          if(item) {

            Item.deleteOne({user_id, list_id, _id: ObjectID(id)}).then((removed) => {
              if(removed.ok) {
                res.json({
                  status: true,
                  message: "İçerik başarıyla silindi."
                })
              } else {
                res.status(500).json({
                  status: true,
                  message: "İçerik silinirken bir sorun oluştu."
                })
              }
            })

          } else {
            res.json({
              status: true,
              message: "Silinecek içerik bulunamadı."
            })
          }

        }).catch((err) => {
          res.status(500).json(err);
        });
      } else {
        Item.deleteMany({user_id, list_id}).then((removed) => {
          if(removed.ok) {
            res.json({
              status: true,
              message: "Listedeki içerikler başarıyla temizlendi."
            })
          } else {
            res.status(500).json({
              status: true,
              message: "İçerik silinirken bir sorun oluştu."
            })
          }
        })
      }

    } else {
      res.status(500).json({
        status: false,
        message: "İçeriği silmek istediğiniz liste bulunamadı."
      })
    }
  })

});


module.exports = router;