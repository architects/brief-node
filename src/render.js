import mdast from 'mdast'
import yaml from 'mdast-yaml'
import html from 'mdast-html'
import fs from 'fs'
import squeeze from 'mdast-squeeze-paragraphs'
import normalize from 'mdast-normalize-headings' 
import _ from 'underscore'
import visit from 'mdast-util-visit'
import inflections from 'underscore.string'
import cheerio from 'cheerio'

const processor = mdast.use([yaml,squeeze,normalize,html])
const clone = _.clone

export function parse(document) {
  let parsed = processor.parse(document.content),
      nodes  = parsed.children
  
  if(nodes[0] && nodes[0].yaml){
    document.data = nodes.splice(0,1)[0].yaml
  }
  
  let ast = processor.run(parsed)

  document.runHook("documentDidParse", ast)

  return ast 
}

export function process(document) {
  document.content = readPath(document.path)

  document.ast = parse(document)
  document.runHook("documentWillRender", document.ast)
  
  nestElements(document)
  collapseSections(document)
  applyWrapper(document)

  document.html = stringify(document)
  document.$ = cheerio.load(document.html)

  document.runHook("documentDidRender", document.html)

  return document
}

function stringify(document, options={}) {
  return processor.stringify(document.ast, options)
}

function readPath(path) {
  return fs.readFileSync(path).toString()
}

function nestElements(document) {
  let children = document.ast.children
  let headings = document.ast.children.filter(c => c.type === "heading")
	
	let index = 0
	let previous
  let top

	children.forEach(child => {
		let data = child.data 
    
		if(child.type === "heading"){
			delete(child.data)
      top = false
      data = data || {}
      data.htmlName = "section"
      data.htmlAttributes = data.htmlAttributes || {}
      
      if(child.depth == 1 && !top){
        top = true
        data.htmlAttributes['data-top'] = true
      }
        
      if(child.depth >= 3){
        data.htmlName = "article"
      }
      
      child.data = {}

			let wrapped = {
				type: data.htmlName,
        depth: child.depth,
				container: true,
				data: data,
				children: [child]
			}
      
      wrapped[data.htmlName] = true 

      if(top){
        wrapped.top = top
      }

      let text = child.children[0] && child.children[0].value
      let slug

      if(text){
        slug = inflections.dasherize(text.toLowerCase())
        data.htmlAttributes['data-heading'] = slug
        wrapped.slug = slug
      }

      previous = children[index] = wrapped

		} else if(previous) {
			previous.children.push(_.clone(child))
			child.markForRemoval = true
		}

		index = index + 1
	})
  
  document.ast.wrapped = true
	document.ast.children = children.filter(child => !child.markForRemoval)
}

function collapseSections (document){
  let children = document.ast.children
  let previous

  children.forEach(child => {
    let name = child.data && child.data.htmlName
    if(name === "section"){
      previous = child
      child.section = true
    }

    if(previous && name === "article"){
      previous.children.push(clone(child))
      child.markForDelete = true
    }
  })

  document.ast.children = children.filter(child => !child.markForDelete)
}

function applyWrapper (document) {
  document.ast.children = [{ 
    type: "unknown",
    data:{
      htmlName: "main",
      htmlAttributes:{
        "class": "brief-document"
      }
    },
    children: document.ast.children
  }]
}
