var spawn = require("child_process").spawn;
var process = spawn('python',["./Claire_Decision_Engine.py", 
    'str1', 
    'str2'] );

process.stdout.on('data', function(data) { 
  res.send(data.toString()); 
})