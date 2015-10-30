define("Outline")

attributes("title")

extract.the.first("main h1").as("title")

section("Table of Contents")
  .hasMany("Sections", {
    title: "h3"
  })

/**
* Generate briefcase documents from single outline file.
*
* @example
*
* # Blueprint.io 
* 
* The blueprint.io project is great.
*
* ## Table Of Contents
*
* ### Projects
* - Website
* - API
* - Automation Tools
*
* ### Personas
* - Architect
* - Product Owner
* - UX Designer
*/
action("generate documents", function(params) {
  var outline = this,
      briefcase = this.getBriefcase(),
      tableOfContents = outline.sections.tableOfContents
  
  tableOfContents.sections.forEach(function(section){
    var documentTitle = section.title,
        fileName = util.parameterize(documentTitle)

    var modelClass = briefcase.getModelDefinition(section)
     
    briefcase.createDocument(modelClass, {title: documentTitle})
  })
})
