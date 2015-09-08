/**
* @author Jonathan Soeder
* @copyright 2015 Jonathan Soeder
* @license MIT
* @module brief
* @fileoverview database applications powered by written words
*/

var brief;

if(process.env.DEV_MODE){
  require('babel/register')
  brief = require("./src/index")
} else {
  brief = require("./lib/index")
}

module.exports = brief
