const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const signingOptions = { expiresIn: '5h' }

module.exports.login = async ( req, res ) => {
  // Todo: do some sanitization
  const { password, email } = req.body
  let user = await User.findOne({
    email
  })

  if (user) {
    // check that password matches
    const matches = bcrypt.compareSync(password, user.password)
    if (matches) {
      // create a signin token
      const payload = {
        name: user.name,
        email
      }
      const token = jwt.sign(payload, process.env.SECRET_KEY, signingOptions)
      res.send({
        message: `Welcome back ${user.name}`,
        token
      })
    } else {
      console.log('password no match')
      res.status(400).send({ message: 'Invalid username or password' })
    }
  } else {
    console.log('user not found')
    res.status(400).send({ message: 'Invalid username or password' })
  }
}

module.exports.signup = async ( req, res ) => {

  try {
    
    //Todo: Do some sanitization
    const { username, name, email, password } = req.body
    let found = await User.findOne({ email})
  
    if (found) {
      res.status(401).send({
        message: 'Sorry, an account already exists with that email'
      })
    } else {
      // proceed to save user
  
      // hash the password
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(password, salt)
      const user = new User({
        name,
        email,
        password: hash,
        provider: 'local',
        emailVerified: false
      })
  
      await user.save()

      // create a signin token
      const payload = {
        name,
        email
      }
      
      const token = jwt.sign(payload, process.env.SECRET_KEY, signingOptions)
  
      res.send({
        message: 'Account created successfully',
        token: token
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: 'Something went wrong'
    })
  }
}


module.exports.loginWithGoogle = async ( req, res ) => {
  // log a user in using her Google account after authorizing
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
        email: data.payload.email,
        emailVerified: data.payload.email_verified,
        photo: data.payload.picture
      }

      const u = await User.findOne({
        email: data.payload.email,
        provider: 'google'
      })
      console.log(u)
      if (u) {
        let token = jwt.sign(d, process.env.SECRET_KEY, signingOptions)
        res.send({
          message: `Welcome ${d.name}`,
          token: token
        })
      } else {
        let user = new User({
          ...d,
          provider: 'google'
        })
        await user.save()
        let token = jwt.sign(d, process.env.SECRET_KEY, signingOptions)
        console.log(token)
        res.send({
          message: `Welcome ${d.name}`,
          token: token
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
