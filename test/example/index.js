var load = function(mod, options){
  mod = mod || require('brief-node')
  options = options || {}

  mod.resolveLinksWith(function(p){
    return "#" + p
  })

  return mod.load(__dirname, options)
}

module.exports = load
