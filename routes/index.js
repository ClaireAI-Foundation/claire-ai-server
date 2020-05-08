var express = require('express');
var router = express.Router();
const AuthController = require('../controllers/AuthController')
const DeController = require('../controllers/DeController')
require('dotenv').config();
const jwt = require('jsonwebtoken')

const routeGuard = (req, res, next) => {
  token = req.headers.authorization.split('Bearer ')[1]
  if (!token) res.status(401).send('Not authenticated')
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
    if (err) {
      res.status(401).send('Not authenticated')
    } else {
      next()
    }
  })
}

router.post('/login', AuthController.login)
router.post('/signup', AuthController.signup)
router.post('/loginWithGoogle', AuthController.loginWithGoogle)
router.post('/interaction', routeGuard, DeController.interaction)

module.exports = router;
