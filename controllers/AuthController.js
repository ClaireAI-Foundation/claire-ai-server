const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const signingOptions = { algorithm: 'RS256', expiresIn: '5h' }

module.exports.login = async ( req, res ) => {
  // Todo: do some sanitization
  const { username, password, email } = req.body
  let user = await User.findOne({
    username
  })

  if (user) {
    // check that password matches
    const matches = bcrypt.compareSync(password, user.password)
    if (matches) {
      // sign token
      const token = jwt.sign(payload, process.env.SECRET_KEY, signingOptions)
      res.send({
        message: `Welcome back ${user.name}`,
        token
      })
    } else {
      res.status(400).send({ message: 'Invalid username or password' })
    }
  } else {
    res.status(400).send({ message: 'Invalid username or password' })
  }
}

module.exports.signup = async ( req, res ) => {

  try {
    
    //Todo: Do some sanitization
    const { username, name, email, password } = req.body
    let found = await User.findOne({ username: username })
  
    if (found) {
      res.status(401).send({
        message: 'That username already exists'
      })
    } else {
      // proceed to save user
  
      // hash the password
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(password, salt)
      const user = new User({
        name,
        username,
        email,
        password: hash
      })
  
      await user.save()

      // create a signin token
      const payload = {
        username,
        name,
        email
      }
      
      const token = jwt.sign(payload, process.env.SECRET_KEY, signingOptions)
  
      res.send({
        message: 'Account created successfully',
        data: token
      })
    }
  } catch (error) {
    res.status(400).send({
      message: 'Something went wrong'
    })
  }
}


module.exports.loginWithGoogle = async ( req, res ) => {
  // log a user in using social accounts after authorizing
  // the app in the frontend

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const { OAuth2Client } = require('google-auth-library')
  const client = new OAuth2Client(CLIENT_ID)

  async function verify() {
    const ticket = await client.verifyIdToken({
        idToken: req.body.token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userid = payload['sub']
    return { payload, userid }
  }

  verify()
    .then( async data => {
      // token verified
      // check that user is not already in the db
      let d = {
        name: data.payload.name,
        username: data.payload.email,
        email: data.payload.email
      }
      const u = await User.findById(data.payload.email)
      if (u) {
        let token = jwt.sign(d, process.env.SECRET_KEY, signingOptions)
        res.send({
          message: `Welcome ${d.name}`,
          data: token
        })
      } else {
        let user = new User({
          _id: d.email
        })
        await user.save()
        let token = jwt.sign(d, process.env.SECRET_KEY, signingOptions)
        res.send({
          message: `Welcome ${d.name}`,
          data: token
        })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(400).send({
        message: 'Something went wrong, try again'
      })
    });
}
