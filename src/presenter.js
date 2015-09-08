import string from 'underscore.string'

export default class Presenter {
	static present (document, options={}) {
		return new Presenter(document, options)
	}

	static loadFromDisk (repositoryFolder, options={}) {

	}

	constructor (document, options = {}) {
		this.document = document
		this.options = options
	}

	children (){
		this.document.getChildren()
	}
	
	viewHeadings (){
		let base = ""
		let indentation = ""
		let headings = this.document.getHeadings()
		let report = []

		headings.forEach(heading => {
			indentation = (heading.depth - 1) * 2
			report.push(string.repeat(' ', indentation) + heading.children[0].value)
		})
	}
}
