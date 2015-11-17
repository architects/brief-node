import mdast from 'mdast'
import yaml from 'mdast-yaml'
import html from 'mdast-html'
import fs from 'fs'
import squeeze from 'mdast-squeeze-paragraphs'
import normalize from 'mdast-normalize-headings' 
import visit from 'unist-util-visit'
import cheerio from 'cheerio'
import {clone,slugify,extend} from './util'
import strings from 'underscore.string'

const processor = mdast.use([yaml,squeeze,normalize,html])

/** Note
*   This needs to be optimized as there are turning out to be
*   way to many passes over the ast.
*/

// Plugins should be able to tap into this
let pipelines = {
  get processing(){
    return [
      resolveLinks,
      nestElements,
      processCodeBlocks,
      removeNodes
    ] 
  },
  
  get structuring(){
    return [
      collapseSections,
      applyWrapper
    ]
  },

  get rendering(){
    return [
      processLinks,
      renderVisualizations
    ]
  }
}

/* if any of the nodes have been marked for delete this will remove them and make sure they
* don't get rendered in the output */
function removeNodes(document, briefcase){
  visit(document.ast, node => {
    if(node.children){ node.children = node.children.filter(child => !child.markForDelete) }
  })
}

/* if code block nodes have been tagged visualizations we need to generate html for their content */
function renderVisualizations(document, briefcase){
  visit(document.ast, 'unknown', node => {
    if(node.visualization){
      let visualization = require(briefcase.config.views_path + '/' + node.visualization)
      let data = node.yaml || {}
      let html = visualization(data, document, briefcase)
      let id = node.data.htmlAttributes.id

      node.children[0].value = strings.unescapeHTML(html)
    }
  })
}

/**
* process a brief document. this involves manipulating 
* the ast from mdast so that our rendered output is nested
* in a hierarchy of main, section, article html tags.
*
* other functions are performed during this operation to
* assist in extracting data from the writing, generating
* links to other documents in the briefcase, and more.
*
*/
export function process(document, briefcase) {

  document.ast = parse(document)
  document.runHook("documentWillRender", document.ast)
 
  // these are broken up because it is easier to transform
  // certain nodes when they aren't deeply nested in the sections
  // we need
  pipelines.processing.forEach(fn => fn(document, briefcase))
  
  // these are responsible for nesting the flat markdown elements
  // in a more hierarchal structure based on the heading levels and titles
  pipelines.structuring.forEach(fn => fn(document, briefcase))

  Object.defineProperty(document, 'html', {
    configurable: true,
    get: function(){
      pipelines.rendering.forEach(fn => fn(document, briefcase))

      let html = stringify(document.ast)

      return html
    }
  })

  document.$ = function(selector){
    return cheerio.load(document.html)(selector)
  }

  document.runHook("documentDidRender", document)

  return document
}

export function markdown(){
  return processor
}

/** 
* parses a brief document and extracts
* the yaml frontmatter as `document.data`
*
*/
export function parse(document) {
  let parsed = processor.parse(document.content),
      nodes  = parsed.children
  
  if(nodes[0] && nodes[0].yaml){
    document.data = nodes.shift().yaml
  }
  
  let ast = processor.run(parsed)

  document.runHook("documentDidParse", ast)

  return ast 
}


export function fragment(ast, options={}) {
  return stringify({
    type: 'root',
    children: [ast]
  })
}

export function stringify(ast, options={}) {
  return processor.stringify(ast, options)
}

export function readPath(path) {
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

      if(child.type == "heading"){
        let text = child.children[0] && child.children[0].value
        let slug = slugify(text) 
        data.htmlAttributes['data-heading'] = slug
        wrapped.slug = slug
        wrapped.heading = text
        child.heading = text
      }

      previous = children[index] = wrapped

		} else if(previous) {
			previous.children.push(clone(child))
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
      child.debug = true
      child.section = true
    }

    if(previous && name === "article"){
      let cloned = clone(child)
      cloned.parent = previous.slug
      previous.children.push(cloned)
      child.markForDelete = true
    }
  })

  document.ast.children = children.filter(child => !child.markForDelete)
}

function applyWrapper (document) {
  document.ast.children = [{ 
    type: "unknown",
    id: document.slug,
    data:{
      htmlName: "main",
      id: document.slug,
      htmlAttributes:{
        "class": "brief-document",
        "id": document.slug
      }
    },
    children: document.ast.children
  }]
}

function resolveLinks(document, briefcase){
  if(!briefcase){ return }

  visit(document.ast, 'link', function(node){
    let pathAlias = node.href

    let children = node.children || []
    let textNode = node.children.find(node => node.type === 'text')

    if(textNode && textNode.value.match(/link\:/)){
      node.href = briefcase.resolveLink(pathAlias)
      node.htmlAttributes = node.htmlAttributes || {}
      node.htmlAttributes['data-link-to'] = pathAlias
    }

    if(textNode && textNode.value.match(/embed\:/)){
      let asset = briefcase.assets.at(node.href)

      if(asset){
        node.type = "unknown"
        node.data = {
          htmlAttributes:{
            name: "div"
          }
        }
        node.children = [{
          type: "text",
          value: strings.unescapeHTML(asset.content)
        }]
      }
    }
  })
}

function processLinks(document, briefcase){
  visit(document.ast, 'link', function(node){
    if(node.htmlAttributes && node.htmlAttributes['data-link-to']){
      let linkedDocument = briefcase.at(node.htmlAttributes['data-link-to'])
      let textNode = node.children.find(node => node.type === 'text')

      if(textNode && textNode.value.match(/link\:/)){
        textNode.value = strings.strip(textNode.value.replace(/link\:/,''))

        if(linkedDocument && textNode.value === 'title'){
          textNode.value = linkedDocument.title
        }
      }
    }
  })
}

function processCodeBlocks(document, briefcase){
  let index = 0

  let parser

  visit(document.ast, 'code', function(node){
    let data = node.data = node.data || {}
    let attrs = node.data.htmlAttributes = node.data.htmlAttributes || {}
    
    attrs.id = attrs.id || "block-" + index

    if(node.lang === 'yaml' || node.lang === 'yml' || node.lang === 'data'){
      parser = parser || require('js-yaml')
            
      if(node.value && !node.yaml){
        try {
          node.yaml = parser.safeLoad(node.value)
        } catch(e){
          document.log("Error parsing yaml", e.message)
        }
      }

      if(node.lang === 'data' && node.yaml){
        let key = node.yaml.key
        
        if(key){
          delete(node.yaml.key)

          Object.defineProperty(document.data, key, {
            value: node.yaml
          })

          node.yaml.key = key
          node.markForDelete = true
        } else {
          document.log("Can't process a data yaml block without a key property")
        }
      }
      
      // TBD whether we require visualization or view as the key
      if(node.yaml && (node.yaml.visualization || node.view)){
        node.visualization = (node.yaml.visualization || node.view)
        node.type = 'unknown'
        node.children = [{type:'text',value:'VISUALIZATION'}]
      }

      node.lang = 'yaml'
    }

    index = index + 1
  })
}
