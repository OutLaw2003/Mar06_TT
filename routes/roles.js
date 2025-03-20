var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');


router.get('/', async function (req, res, next) {
  let users = await roleController.GetAllRole();
  CreateSuccessRes(res, 200, users);
});

router.get('/:id', async function (req, res, next) {
  try {
    let user = await roleController.GetRoleById(req.params.id);
    CreateSuccessRes(res, 200, user);
  } catch (error) {
    next(error);
  }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let newRole = await roleController.CreateRole(req.body.name);
    CreateSuccessRes(res, 200, newRole);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let updatedRole = await roleController.UpdateRole(req.params.id, req.body);
    CreateSuccessRes(res, 200, updatedRole);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
  try {
    let role = await roleController.GetRoleById(req.params.id);
    if (!role || role.isDeleted) {
      return CreateErrorRes(res, 404, 'Vai trò không tồn tại hoặc đã bị xóa.');
    }

    await roleController.SoftDeleteRole(req.params.id);
    CreateSuccessRes(res, 200, 'Vai trò đã được xóa mềm thành công.');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
