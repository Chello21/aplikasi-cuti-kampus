const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  createParentAccount, 
  getParentAccount, 
  getPendingParents, 
  verifyParentAccount 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

// Parent routes
router.post('/parent', authenticate, createParentAccount);
router.get('/parent', authenticate, getParentAccount);
router.get('/parent/pending', authenticate, getPendingParents);
router.put('/parent/:id/verify', authenticate, verifyParentAccount);

module.exports = router;
