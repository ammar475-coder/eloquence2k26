const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const adminController = require('../controllers/adminController');

// Public Routes
router.get('/health', apiController.getHealth);
router.get('/status', apiController.getStatus);
router.post('/register', apiController.registerEvent);
router.get('/registrations', apiController.getRegistrations);
router.get('/registrations/:id', apiController.getRegistrationById);
router.get('/events', apiController.getPublicEvents);

// Admin Routes
router.post('/admin/login', adminController.login);
router.get('/admin/dashboard', adminController.verifyToken, adminController.getDashboardData);
router.get('/admin/users', adminController.verifyToken, adminController.getUsers);
router.post('/admin/users', adminController.verifyToken, adminController.createUser);
router.put('/admin/users/:id', adminController.verifyToken, adminController.updateUser);
router.delete('/admin/users/:id', adminController.verifyToken, adminController.deleteUser);
router.get('/admin/roles', adminController.verifyToken, adminController.getRoles);
router.post('/admin/roles', adminController.verifyToken, adminController.createRole);
router.put('/admin/roles/:id', adminController.verifyToken, adminController.updateRole);
router.delete('/admin/roles/:id', adminController.verifyToken, adminController.deleteRole);
router.get('/admin/events', adminController.verifyToken, adminController.getEvents);
router.put('/admin/events/:id', adminController.verifyToken, adminController.updateEvent);

module.exports = router;
