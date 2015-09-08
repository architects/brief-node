import visit from 'mdast-util-visit'

export default function attacher (mdast, options) {
  return function transformer (ast) {
    let headingIndex = 0
    let headings = ast.children.filter(c => c.type === "heading")

    headings.forEach(c => {
      let htmlAttributes = {}
      
      htmlAttributes['data-line-number'] = c.position.start.line

      c.data = c.data || {}
      c.data.htmlAttributes = htmlAttributes

      c.headingIndex = ++headingIndex
    })
  }
}
