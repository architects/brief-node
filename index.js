/**
* @author Jonathan Soeder
* @copyright 2015 Jonathan Soeder
* @license MIT
* @module brief
* @fileoverview database applications powered by written words
*/

if(process.env.DEV_MODE){
  require('babel/register')
  module.exports = require("./src/index")
} else {
  module.exports = require("./lib/index")
}
