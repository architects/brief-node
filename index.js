/**
* @author Jonathan Soeder
* @copyright 2015 Jonathan Soeder
* @license MIT
* @module brief
* @fileoverview database applications powered by written words
*/

var Case = require("./lib/case.js"),
    Document = require("./lib/document.js")

module.exports = {
  "create": function(root, options){
    options = options || {}
    return Case.load(root, options)
  }
}
