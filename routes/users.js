var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

/* GET users listing. */
router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    let users = await userController.GetAllUser();
    CreateSuccessRes(res, 200, users);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
  try {
    if (req.params.id === req.user.id) {
      return CreateErrorRes(res, 403, 'Bạn không có quyền truy cập thông tin người khác.');
    }

    let user = await userController.GetUserById(req.params.id);
    if (!user) {
      return CreateErrorRes(res, 404, 'Không tìm thấy người dùng.');
    }

    CreateSuccessRes(res, 200, user);
  } catch (error) {
    CreateErrorRes(res, 500, error.message);
  }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let body = req.body;
    let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
    CreateSuccessRes(res, 200, newUser);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let updateUser = await userController.UpdateUser(req.params.id, req.body);
    CreateSuccessRes(res, 200, updateUser);
  } catch (error) {
    next(error);
  }
});

// Soft delete user
router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let user = await userController.GetUserById(req.params.id);
    if (!user || user.isDeleted) {
      return CreateErrorRes(res, 404, 'Người dùng không tồn tại hoặc đã bị xóa.');
    }

    await userController.SoftDeleteUser(req.params.id);
    CreateSuccessRes(res, 200, 'Người dùng đã được xóa mềm thành công.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
