global.brief = require('../src/index')
global.briefcase = require('./example')(brief)

global.doc = -> briefcase.epics.first().document
global.model = -> briefcase.epics.first()
global.exit = process.exit

