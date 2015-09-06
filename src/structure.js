import visit from 'mdast-util-visit'
import _ from 'underscore' 

export default function () {
  return function (original) {
    var ast;
    
    ast = visit(original, 'heading', function(node){ 
      let attributes = {}
      let startPosition = (node.position && node.position.start) || {}

      attributes['data-line-number'] = startPosition.begin
      
      node.attributes = attributes
    })
    
    return ast
  }
}
