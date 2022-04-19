const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController')

router.get("/", authController.createpost_get);
router.post('/', authController.createpost_post);

module.exports = router;