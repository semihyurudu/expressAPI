var express = require('express');
var router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var List = require("../models/List");
var Item = require("../models/Item");
var fs = require('fs')
var config = require('../config')
const cors = require('cors')
var bodyParser = require('body-parser')
var authentication = require('../helper/authentication')
var {ObjectID} = require('mongodb')


router.post("/add", authentication.authenticateJWT, (req, res, next) => {

  const {list_id, data} = req.body;
  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']

  if(!list_id) {
    res.status(500).json({
      status: false,
      message: "Liste bulunamadı"
    })
  }

  Item.findOne({list_id, user_id}).then((item) => {
    if(item) {
      res.status(500).json({
        status: false,
        message: "Bu içerik zaten listede bulunmaktadır."
      })
    } else {

      new Item({
        data,
        createdOn: new Date(),
        list_id,
        user_id
      }).save().then((newItem) => {

        console.log('newItem', newItem)

        res.json({
          status: true,
          message: "İçerik eklendi"
        })

      })

    }
  })
});

router.get('/', authentication.authenticateJWT, (req, res) => {

  const user_id = jwt.decode(req.header('Authorization').replace('Bearer ', ''))['user_id']

  Item.find({user_id}).then((items) => {
    res.json(items)
  }).catch((err) => {
    res.json(err);
  });
});




function addItemToList(res, list_id, data_id) {
  List.updateOne(
    { _id: ObjectID(list_id) },
    { $push: { items: data_id } },
    { upsert: true }
  ).then((item) => {
    if(item.ok) {
      res.json({
        status: true,
        message: "İçerik listeye eklendi."
      })
    }
  })
}

module.exports = router;