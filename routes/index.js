var express = require('express');
var router = express.Router();
const MainController = require('../controllers/MainController')
const AuthController = require('../controllers/AuthController')
require('dotenv').config();
const jwt = require('jsonwebtoken')

const routeGuard = (req, res, next) => {
  // jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
  //   if (err) {
  //     res.status(401).send({
  //       message: 'Unauthorized'
  //     })
  //   } else {
  //     next()
  //   }
  // })
  next()
  
}
router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)
router.post('/loginWithGoogle', AuthController.loginWithGoogle)
router.post('/interaction', MainController.interaction)

module.exports = router;
