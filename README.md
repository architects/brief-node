# Brief: The Active Writing Framework

Markdown is great for writers who want to present their writing in
a neatly formatted way. Brief builds on top of Markdown's usefulness
as a presentation format and communication tool, by providing an easy way to 
build database applications and custom functionality on top of collections 
of markdown documents.

Brief lets you use YAML frontmatter, and a simple system for defining
attributes as CSS selectors to add a queryable data object layer on top
of these collections.  It also lets you treat individual documents as
objects, with a set of attributes that you can change in code.  These
updates will get saved in your markdown.

This lets you render the document as simple HTML as you might normally
do, but also as JSON so that you can treat the content as data as well. 

## Getting Started

```
npm install brief-node
brief use sample project
```

This will create a sample project.  Our example will use a cookbook.

```
- assets
  - images
    - breakfast.svg
    - syrup.jpg
- docs
  - cookbooks
    - breakfast.md
  - ingredients
    - artisinal-butter.md
    - small-batch-syrup.md
  - recipes
    - french-toast.md
- models
  - recipe.js
  - ingredient.js
  - cookbook.js
- index.js
```

## Interacting via the CLI tool

```
cd sample
brief write recipe # => Opens in $EDITOR
brief publish recipe # => Publishes the recipe somewhere 
```

## Interacting via JSON 

```javascript
var cookbook = require('./path/to/cookbook')()

var syrup = cookbook.ingredients.find_by_name('Artisinal Butter')

if(syrup.inStock < 5) { grocery_store_api.place_order(syrup) }

var menu = new Menu()

cookbook.recipes.forEach(recipe => {
  menu.addItem(recipe)
})

menu.saveAsPDF()
menu.publishToMyWebsite()
```

This lets a chef use markdown files that contain writing and notes about his recipes and ingredients to a) generate menu PDFs b) publish the menu to his website c) order ingredients which are almost out of stock.

## Briefcases.

Briefcases are collections of related documents.  These documents can
be of varying types.  Each type of Document will be backed by a Model
class which allows you to do things to the document such as update
attributes about it, generate reports, or use the content and data in
that document to interact with different APIs. 

### Documents

A Brief Document is a markdown document with YAML Frontmatter.  The
content of the document is completely up to the writer, however the
power of this application really shines when we define different types
of Documents and provide some information about how they should be
structured and how they may relate to each other.

We do this using models.  

Given the following markdown content:

```markdown
---
type: recipe
title: French Toast
---

# French Toast

Delicious.

## Ingredients

- Bread
- Eggs
```

we would expect to see a model called `Recipe` which defines the things
we can do with this writing.

### Models

Models are guidelines for the structure of Brief Documents.  They define
things like the expected metadata attributes that will be found in the
YAML frontmatter.  

They also define things like section headings, and what we should expect
to see in the subheadings which are nested underneath them.  

Brief Models provide a way for parsing the document structure and
creating a set of data attributes which enhance the metadata that is
present. 

The Model System allows you to generate reports, visualizations, or
develop integrations between the different instances of models and
various APIs that you can work with from within Javascript.

### Assets

A Briefcase project can include `svg, png, jpg, gif, html, css, js`
files in an assets folder.  These assets will be bundled with the
project when it gets exported as a single JSON structure.

### Data Sources

A Briefcase project can include `json, yaml, csv` file types in the data
folder.  These will get treated as data sources and bundled with the
project when it gets exported as a single JSON structure.

### Special Markdown Syntax Elements

Link tags, and Fenced code blocks can implement special syntax that
gives you fine grained control over how assets and data sources for
example, can be incorporated to embed visualizations in the rendered
markdown output.

An example of how you might link to other documents:

```markdown

# My Heading

Here is a link:

[link:title](projects/brief)
```

This link tag will create a link to the `projects/brief` document, using
its title as the text for the link.

What value is used for the href of this link can be configured by
supplying your own link resolver function.

```es6
let brief = require('brief-node')
let briefcase = brief.example()

briefcase.resolver.forLinks(function(id){
  return "http://architects.io" + id
})
```

### Acknowledgements

- Titus Woormer (@wooorm) for his work on MDast
