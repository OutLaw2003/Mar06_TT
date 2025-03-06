var express = require('express');
var router = express.Router();
let categoryModel = require('../schemas/category');

// Lấy danh sách category (có thể lọc theo name)
router.get('/', async function(req, res, next) {
  try {
    let query = {};
    if (req.query.name) {
      query.name = new RegExp(req.query.name, 'i'); // Tìm kiếm không phân biệt hoa thường
    }

    let categories = await categoryModel.find(query);
    res.status(200).send({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Lỗi khi lấy danh sách categories"
    });
  }
});

// Lấy chi tiết category theo ID
router.get('/:id', async function(req, res, next) {
  try {
    let category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({ success: false, message: "Không tìm thấy category" });
    }
    res.status(200).send({ success: true, data: category });
  } catch (error) {
    res.status(400).send({ success: false, message: "ID không hợp lệ" });
  }
});

// Tạo category mới
router.post('/', async function(req, res, next) {
  try {
    let newCategory = new categoryModel({
      name: req.body.name,
      description: req.body.description || "",
    });

    await newCategory.save();
    res.status(201).send({ success: true, data: newCategory });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// Cập nhật category theo ID
router.put('/:id', async function(req, res, next) {
  try {
    let updatedCategory = await categoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCategory) {
      return res.status(404).send({ success: false, message: "Không tìm thấy category để cập nhật" });
    }
    res.status(200).send({ success: true, data: updatedCategory });
  } catch (error) {
    res.status(400).send({ success: false, message: "Lỗi khi cập nhật category" });
  }
});

// Xóa mềm category theo ID
router.delete('/:id', async function(req, res, next) {
  try {
    let deletedCategory = await categoryModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!deletedCategory) {
      return res.status(404).send({ success: false, message: "Không tìm thấy category để xóa" });
    }
    res.status(200).send({ success: true, message: "Category đã được xóa mềm", data: deletedCategory });
  } catch (error) {
    res.status(400).send({ success: false, message: "Lỗi khi xóa category" });
  }
});

module.exports = router;
