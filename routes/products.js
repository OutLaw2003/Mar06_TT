var express = require('express');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
var router = express.Router();
let productModel = require('../schemas/product');

function buildQuery(obj) {
  console.log(obj);
  let result = {};
  
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }

  if (obj.price && typeof obj.price === 'object') {
    result.price = {};
    
    if (obj.price.$gte && typeof obj.price.$gte === 'number') {
      result.price.$gte = obj.price.$gte;
    }

    if (obj.price.$lte && typeof obj.price.$lte === 'number') {
      result.price.$lte = obj.price.$lte;
    }

    if (Object.keys(result.price).length === 0) {
      delete result.price;
    }
  }
  
  return result;
}



router.get('/', async function(req, res, next) {
  let products = await productModel.find(buildQuery(req.query));
  res.status(200).send({
    success: true,
    data: products
  });
});


router.get('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let product = await productModel.findById(id);
    res.status(200).send({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "khong co id phu hop"
    });
  }
});

router.post('/', async function(req, res, next) {
  if (typeof req.body.price !== 'number' || isNaN(req.body.price)) {  
    return res.status(400).send({
      success: false,
      message: "Giá sản phẩm phải là một số hợp lệ"
    });
  }

  try {
    let newProduct = new productModel({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: req.body.category,
      isDeleted: false
    });

    await newProduct.save();

    return res.status(200).send({  
      success: true,
      data: newProduct
    });

  } catch (error) {
    return res.status(404).send({  
      success: false,
      message: error.message
    });
  }
});


router.put('/:id', async function(req, res, next) {
  if (typeof req.body.price !== 'number' || isNaN(req.body.price)) {  
    return res.status(400).send({
      success: false,
      message: "Giá sản phẩm phải là một số hợp lệ"
    });
  }

  try {
    let id = req.params.id;
    let updatedProduct = await productModel.findByIdAndUpdate(id, req.body, { new: true });

    return res.status(200).send({
      success: true,
      data: updatedProduct
    });

  } catch (error) {
    return res.status(404).send({
      success: false,
      message: "khong the cap nhat san pham"
    });
  }
});


router.delete('/:id', async function(req, res, next) {
  try {
    let id = req.params.id;
    let deletedProduct = await productModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    res.status(200).send({
      success: true,
      message: "San pham da duoc xoa mem",
      data: deletedProduct
    });
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "khong the xoa san pham"
    });
  }
});

module.exports = router;
