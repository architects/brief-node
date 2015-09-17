import string from 'underscore.string'
import html from 'html'

export default class Presenter {
	static present (document, options={}) {
		return new Presenter(document, options)
	}

	static loadFromDisk (repositoryFolder, options={}) {

	}

	constructor (document, options = {}) {
		this.document = document
		this.options = options
    this.output = options.output || "console"
	}

	children (){
		this.document.getChildren()
	}
  
  /**
   * find the heading you want by its relative
   * positional index within the document
  */
  getHeadingByIndex (index){
    return this.document.getHeadingNodes().find(node => node.headingIndex == index)
  }

  getNextHeading (from) {
    let index = from.headingIndex
    let nextHeading = this.getHeadingByIndex(index + 1)

    if(nextHeading)
      return nextHeading
  }
  
  prettified () {
    let pretty = require('html').prettyPrint(this.document.render())

    if(this.output === "console"){
      console.log(pretty)
    } else {
      return(pretty)
    }
  }

	viewHeadings () {
		let base = ""
		let indentation = ""
		let headings = this.document.getHeadingNodes()
		let report = []

		headings.forEach(heading => {
			indentation = (heading.depth - 1) * 2
      let value = heading.children[0].value
      value = heading.headingIndex + ' ' + value
			report.push(string.repeat(' ', indentation) + value)
		})
    
    if(this.output === "console"){
      console.log(report.join("\n"))
    }

    return report
	}
}
