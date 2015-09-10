var chalk = require('chalk')
var CLI = require('./cli')

function engine(argv, done){
  let cli = new CLI(argv)
  
  done(undefined, false)
}

module.exports = engine
