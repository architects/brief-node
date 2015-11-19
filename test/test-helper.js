var Logger = require('bunyan')

global.brief = require('../src/index')
global.briefcase = require('./example')(brief)
global.briefcase.logger = new Logger({
  name: "example-briefcase",
  streams:[{
    path: __dirname + '/../log/test.log',
    level: 'info'
  }]
})

global.briefcase.resolver.forLinks(function(pathAlias){
  return "http://blueprint.io/" + pathAlias
})
