# The Active Writing Framework

Brief provides you with a set of tools to create "Reactive Documents"
with markdown and javascript.

Reactive Documents are written in markdown and brought to life through
the use of flexible, programmable model classes which do things like
define the structure of the documents and different metadata attributes.

### Briefcases

A Briefcase is the parent project owns all of the different assets,
documents, data sources, visualizations, and what ever else.  Briefcases
package up all of these things and wrap them up in a javascript bundle
that can be `required()` like any other npm package or module.

Briefcases can rely on plugins to define reusable sets of models with 
relationships between them.  Maybe it is a cookbook, a software project
management wiki, an interactive style guide for a website. Brief
provides the ultimate level of flexibility and customization to writers.

### Documents

Documents are markdown files with YAML frontmatter.  Documents are
expected to follow a consistent structure based on the type of model
that you intend to power with that writing, if any.  A Document's
relationship to the model classes you define is based on the `type`
parameter defined in YAML, or the name of the folder the document
resides in relative to the Briefcase's `config.docs_path`

### Models

Models can be defined to represent different types of documents. Models
can have relationships with other models.  You can do things with
models.  Models are given attributes based on the content of the
document, and the data it contains.

### Assets

A Briefcase project can include `svg, png, jpg, gif, html, css, js`
files in an assets folder.  These assets will be bundled with the
project when it gets exported as a single JSON structure.  These
documents can be embedded directly in the rendered HTML by using special 
link tag syntax such as:

```markdown
[embed:asset](folder/asset-name)
```

This will embed the asset in `briefcase.config.assets_path + 'folder/asset-name.svg`

### Data Sources

A Briefcase project can include `json, yaml, csv` file types in the data
folder.  These will get treated as data sources and bundled with the
project when it gets exported as a single JSON structure. 

Data sources are useful ways of powering visualizations that get
embedded in your document.

### Visualizations

A Briefcase can include javascript files in `briefcase.config.views_path`.

These javascript files are expected to export a function and return some HTML.

In your documents, you include a YAML block like:

```yaml
visualization: my_custom_visualization
data: whatever
```

The content of this block will be replaced with whatever gets returned from the javascript function.

This is a great way to embed visualizations, charts, interactive components, or whatever else you want inside of your writing.

### Plugins

Brief's behavior can be extended through a simple plugin system.  Plugins can bundle up re-usable model definitions that help automate repetitive scenarios that require a lot of writing.  In practice, we use it to automate the project management and specifications documents for our software development business.

Some of the plugins we maintain:

- [https://github.com/architects/brief-plugins-blueprint](Blueprint) is
  used to write about software projects and the software development
  lifecycle.  We use this plugin to power our domain driven design
  consulting practice.

- [https://github.com/architects/brief-plugins-retext](Retext) this
  plugin provides us with the ability to do language and keyword
  analysis on large collections of written documents.  

### Acknowledgements

- Titus Woormer (@wooorm) for his work on MDast
