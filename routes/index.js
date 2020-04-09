var express = require('express');
var router = express.Router();
const MainController = require('../controllers/MainController')
const AuthController = require('../controllers/AuthController')
require('dotenv').config();

const routeGuard = (req, res, next) => {
  next()
}
router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)
router.post('/interaction', MainController.interaction)

module.exports = router;
