
var colors = require("colors"),
    _ = require("underscore"),
    path = require("path"),
    examplePath = path.join(__dirname,'example')

var brief = require("../index"),
    briefcase = brief.create(examplePath)

var red = function(msg){
  console.log(colors.red(msg))
}

var green = function(msg){
  console.log(colors.green(msg))
}

global.utils = {
  empty: _.isEmpty,
  examplePath: examplePath,
  brief: brief,
  briefcase: function(){
    return briefcase
  }
}

global.describe = function(context, bodyFn){
  console.log("= " + context)
  bodyFn()
}


global.it = function(description, testFn){
  try {
    testFn()
    green('  - ' + description)
  } catch(e){
    red('  * ' + description + '... Failed')
    red(e.message)
  }
}

global.assert = require('assert')

require("./case-spec")
require("./document-spec")
require("./example-model-spec")
