var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');


function buildQuery(obj) {
  let result = { isDeleted: false };
  if (obj.name) {
    result.name = new RegExp(obj.name, 'i');
  }
  result.price = {};
  if (obj.price) {
    result.price.$gte = obj.price.$gte || 0;
    result.price.$lte = obj.price.$lte || 10000;
  } else {
    result.price.$gte = 0;
    result.price.$lte = 10000;
  }
  return result;
}


router.get('/', async function (req, res) {
  try {
    let products = await productModel.find(buildQuery(req.query)).populate('category');
    res.status(200).send({ success: true, data: products });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});


router.get('/:id', async function (req, res) {
  try {
    let product = await productModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!product) return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại hoặc đã bị xóa' });
    res.status(200).send({ success: true, data: product });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});


router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
  try {
    let cate = await CategoryModel.findOne({ name: req.body.category });
    if (!cate) return res.status(404).send({ success: false, message: 'Danh mục không tồn tại' });

    let newProduct = new productModel({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      category: cate._id
    });
    await newProduct.save();
    res.status(200).send({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});


router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
  try {
    let updateObj = req.body;
    if (updateObj.category) {
      let cate = await CategoryModel.findOne({ name: updateObj.category });
      if (!cate) return res.status(404).send({ success: false, message: 'Danh mục không tồn tại' });
      updateObj.category = cate._id;
    }

    let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, updateObj, { new: true });
    res.status(200).send({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product || product.isDeleted) return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại hoặc đã bị xóa' });

    product.isDeleted = true;
    await product.save();
    res.status(200).send({ success: true, message: 'Sản phẩm đã được xóa mềm thành công' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});


router.put('/restore/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res) {
  try {
    let product = await productModel.findById(req.params.id);
    if (!product || !product.isDeleted) return res.status(404).send({ success: false, message: 'Sản phẩm không tồn tại hoặc chưa bị xóa' });

    product.isDeleted = false;
    await product.save();
    res.status(200).send({ success: true, message: 'Sản phẩm đã được khôi phục thành công' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
