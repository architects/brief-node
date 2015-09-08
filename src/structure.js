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

const slice = Array.prototype.slice
const splice = Array.prototype.splice

export default function attacher (mdast, options) {
  let MarkdownCompiler = mdast.Compiler
  
  MarkdownCompiler.prototype.div = divRenderer
  MarkdownCompiler.prototype.section = sectionRenderer
  MarkdownCompiler.prototype.article = articleRenderer

  return function transformer (ast) {
    let headingIndex = 0
    
    let headings = ast.children.filter(child => child.type === "heading")
    
    let previousHeading, parentHeading

    ast.children.forEach(child => {
      if(child.type === "heading"){
        child.headingIndex = ++headingIndex
        child.attributes = child.attributes || {}
        child.attributes['data-line-number'] = child.position.start.line
      }
      
      if(previousHeading) {
        child.p
      }

      if(child.type === "heading"){
        previousHeading = child
      }
    })
  }
}
