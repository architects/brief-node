export default class DocumentSection {
  constructor (name, modelDefinition, options = {}) {
    this.name = name
    this.options = options
    this.aliases = []
    this.children = {}
  }
  
  /**
   * identifies the way the child items in the section
   * can be referenced. also specifies the attributes that
   * should be extracted from the subsection
  */
  hasMany (relationshipName, options = {}) {
    options.relationshipType = "hasMany"
    this.children[relationshipName] = options
    return this
  }
  
  /**
   * sets an alias for the section, which allows
   * for different values to be used as the main
   * anchor heading
  */
  aka (...aliases) {
    this.aliases = this.aliases.concat(aliases)
    return this
  }
}
