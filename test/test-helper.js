global.brief = require('../src/index')
global.briefcase = require('./example')(brief)

global.briefcase.resolver.forLinks(function(pathAlias){
  return "http://blueprint.io/" + pathAlias
})
