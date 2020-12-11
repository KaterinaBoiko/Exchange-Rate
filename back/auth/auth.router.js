const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);
router.delete('/delete/:id', authController.deleteById);

module.exports = router;