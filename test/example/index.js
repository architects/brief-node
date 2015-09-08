module.exports = {
  load: function(b, options){
    //b = b || require('brief-js')
    return b.Case.load(__dirname, options)
  }
}
