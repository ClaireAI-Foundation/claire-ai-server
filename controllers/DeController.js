const { spawn } = require('child_process');
const scriptPath = './Claire_Decision_Engine.py'

// const testData = {
//   "Fever": "yes",
//   "Cough": "yes",
//   "Shortness of breath": "yes",
//   "Trouble breathing": "yes",
//   "New confusion or inability to arouse": "yes",
//   "Bluish lips or face": "no"
//   }

const runScript = function (data) {
  return new Promise(function(resolve, reject) {
    const process = spawn('python',[scriptPath, JSON.stringify(data)])

    process.stdout.on('data', function(data) {

        resolve(data)
    })

    process.stderr.on('data', (data) => {

        reject(data)
    })
  })
}

// runScript(testData).then(d => {
//   console.log(d.toString())
// }).catch(err => {
//   console.log(err.toString())
// })


module.exports.interaction = function (req, res) {
  // console.log(req.headers)
  runScript(req.body)
  .then(d => {
    res.send(d.toString())
  }).catch(err => {
    console.log(err.toString())
    res.status(500).send('Sorry, something went wrong.')
  })
}