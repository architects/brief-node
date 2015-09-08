var load = function(mod, options){
  mod = mod || require('brief-node')
  options = options || {}
  return mod.load(__dirname, options)
}

module.exports = load
