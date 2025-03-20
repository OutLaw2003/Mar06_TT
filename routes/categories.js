var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');


router.get('/', async function(req, res) {
  let categories = await categoryModel.find({ isDeleted: false });
  res.status(200).send({ success: true, data: categories });
});


router.get('/:id', async function(req, res) {
  try {
    let category = await categoryModel.findOne({ _id: req.params.id, isDeleted: false });
    if (!category) return res.status(404).send({ success: false, message: 'Không có danh mục phù hợp' });
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function(req, res) {
  try {
    let newCategory = new categoryModel({ name: req.body.name });
    await newCategory.save();
    res.status(200).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});


router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function(req, res) {
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    if (!updatedCategory) return res.status(404).send({ success: false, message: 'Không tìm thấy danh mục' });
    res.status(200).send({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category || category.isDeleted) return res.status(404).send({ success: false, message: 'Danh mục không tồn tại hoặc đã bị xóa' });

    category.isDeleted = true;
    await category.save();
    res.status(200).send({ success: true, message: 'Danh mục đã được xóa mềm thành công' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

router.put('/restore/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function(req, res) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category || !category.isDeleted) return res.status(404).send({ success: false, message: 'Danh mục không tồn tại hoặc chưa bị xóa' });

    category.isDeleted = false;
    await category.save();
    res.status(200).send({ success: true, message: 'Danh mục đã được khôi phục thành công' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

module.exports = router;
