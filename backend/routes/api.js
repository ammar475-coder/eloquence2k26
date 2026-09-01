const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const adminController = require('../controllers/adminController');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.get('/health', apiController.getHealth);
router.get('/status', apiController.getStatus);
router.post('/register', apiController.registerEvent);
router.get('/registrations', apiController.getRegistrations);
router.get('/registrations/:id', apiController.getRegistrationById);

// Public Sponsors & Coordinators
router.get('/sponsors', apiController.getActiveSponsors);
router.get('/sponsors/:id', apiController.getPublicSponsorById);
router.get('/coordinators', apiController.getActiveCoordinators);
router.get('/coordinators/event/:eventId', apiController.getCoordinatorsByEvent);

// ── Admin Auth & Dashboard ───────────────────────────────────────────────────
router.post('/admin/login', adminController.login);
router.get('/admin/dashboard', adminController.verifyToken, adminController.getDashboardData);

// ── Admin User Management ────────────────────────────────────────────────────
router.get('/admin/users', adminController.verifyToken, adminController.getUsers);
router.post('/admin/users', adminController.verifyToken, adminController.createUser);
router.put('/admin/users/:id', adminController.verifyToken, adminController.updateUser);
router.delete('/admin/users/:id', adminController.verifyToken, adminController.deleteUser);

// ── Admin Role Management ────────────────────────────────────────────────────
router.get('/admin/roles', adminController.verifyToken, adminController.getRoles);
router.post('/admin/roles', adminController.verifyToken, adminController.createRole);
router.put('/admin/roles/:id', adminController.verifyToken, adminController.updateRole);
router.delete('/admin/roles/:id', adminController.verifyToken, adminController.deleteRole);

// ── Admin Sponsor Management ─────────────────────────────────────────────────
router.get('/admin/sponsors', adminController.verifyToken, adminController.getSponsors);
router.get('/admin/sponsors/:id', adminController.verifyToken, adminController.getSponsorById);
router.post('/admin/sponsors', adminController.verifyToken, adminController.createSponsor);
router.put('/admin/sponsors/:id', adminController.verifyToken, adminController.updateSponsor);
router.patch('/admin/sponsors/:id/toggle', adminController.verifyToken, adminController.toggleSponsorStatus);
router.delete('/admin/sponsors/:id', adminController.verifyToken, adminController.deleteSponsor);
router.post('/admin/upload', adminController.verifyToken, adminController.uploadLogo);

// ── Admin Coordinator Management ─────────────────────────────────────────────
router.get('/admin/coordinators', adminController.verifyToken, adminController.getCoordinators);
router.get('/admin/coordinators/:id', adminController.verifyToken, adminController.getCoordinatorById);
router.post('/admin/coordinators', adminController.verifyToken, adminController.createCoordinator);
router.put('/admin/coordinators/:id', adminController.verifyToken, adminController.updateCoordinator);
router.patch('/admin/coordinators/:id/toggle', adminController.verifyToken, adminController.toggleCoordinatorStatus);
router.delete('/admin/coordinators/:id', adminController.verifyToken, adminController.deleteCoordinator);

module.exports = router;
