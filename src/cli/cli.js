var util        = require('util'),
    events      = require('events'),
    commander   = require('commander'),
    manifest    = require('../../package.json'),
    string      = require('underscore.string')

var Emitter = events.EventEmitter
var Command = commander.Command

var usage =
`
  Usage:
`

function help() {
  console.log(usage)
}

var program = new Command(manifest.name)
    .version(manifest.version)
    .description(manifest.description)

program.on('--help', help)

function CLI(argv) {
  var self = this

  self.cwd = process.cwd()

  Emitter.call(self)
}

function log() {
  if(!this.silent && !this.quiet){
    this.stdout.apply(this.stdout, arguments)
  }
}

function stdout() {
  console.log.apply(console, arguments)
}

function stderr() {
  console.error.apply(console, arguments)
}

function usage() {
  return program.outputHelp()
}

util.inherits(CLI, Emitter)

CLI.prototype.stdout = stdout
CLI.prototype.stderr = stderr
CLI.prototype.log = log
CLI.prototype.usage = usage

module.exports = CLI
