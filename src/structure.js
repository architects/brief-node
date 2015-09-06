import visit from 'mdast-util-visit'
import h from '../node_modules/mdast-html/lib/h'

const divRenderer = function(node){
  return h(this, node, 'div', this.all(node).join('\n'), true);
}

const sectionRenderer = function(node){
  return h(this, node, 'section', this.all(node).join('\n'), true);
}

const articleRenderer = function(node){
  return h(this, node, 'article', this.all(node).join('\n'), true);
}

export default function attacher (mdast, options) {
  let MarkdownCompiler = mdast.Compiler
  
  MarkdownCompiler.prototype.div = divRenderer

  return function transformer (ast) {
    visit(ast, 'heading', (node)=>{
      node.attributes = {'data-start': node.position.start.line}
    })
    
    let children = ast.children,
        length = children.length,
        first = children[0],
        wrapped = []
    
    if(first && first.type === "yaml"){
      ast.children = children.slice(0,1)
      ast.children.push({
        type: "div",
        children: children.slice(1, length),
        attributes: {
          class: "wrapper"
        }
      })
    }
  }
}
