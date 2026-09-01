const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const adminController = require('../controllers/adminController');

// Public Routes
router.get('/status', apiController.getStatus);
router.post('/register', apiController.registerEvent);

// Admin Routes
router.post('/admin/login', adminController.login);
router.get('/admin/dashboard', adminController.verifyToken, adminController.getDashboardData);
router.get('/admin/users', adminController.verifyToken, adminController.getUsers);
router.post('/admin/users', adminController.verifyToken, adminController.createUser);
router.put('/admin/users/:id', adminController.verifyToken, adminController.updateUser);
router.delete('/admin/users/:id', adminController.verifyToken, adminController.deleteUser);
router.get('/admin/roles', adminController.verifyToken, adminController.getRoles);
router.post('/admin/roles', adminController.verifyToken, adminController.createRole);

module.exports = router;
