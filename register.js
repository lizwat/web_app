const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController')
User = require("../models/user");

router.get("/", authController.register_get);
router.post("/", authController.register_post);

module.exports = router;