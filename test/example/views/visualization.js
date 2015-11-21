function view(params, document, briefcase){
  return '<h1>look i rendered your node into arbitrary html<span>!!</span></h1>'
}

module.exports = view

view.label = "visualization"
view.natural = "an example visualization"
