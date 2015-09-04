---
type: project
title: Brief
subheading: The Active Writing Framework
status: active
---

# Brief
## The Active Writing Framework

Brief lets people build applications on top of their writing.  Whether
you are a chef who is writing recipes for the kitchen, or you are a
system administrator writing chef recipes to automate your servers,
Brief lets you use your natural communication and writing in powerful
ways.

## Briefcases.

Briefcases are collections of relevant documents.  These documents can
be of varying types.  Each type of Document can be backed by a Model
class.

### Documents

A Brief Document is a markdown document with YAML Frontmatter.  The
content of the document is completely up to the writer, however the
power of this application really shines when we define different types
of Documents and provide some information about how they should be
structured.

### Models

Models are guidelines for the structure of Brief Documents.  They define
things like the expected metadata attributes that will be found in the
YAML frontmatter.  They also define things like section headings, and
what we should expect to see in the subheadings which are nested underneath
them.  

Brief Models provide a way for parsing the document structure and
creating a set of data attributes which enhance the metadata that is
present. 

The Model System allows you to generate reports, visualizations, or
develop integrations between the different instances of models and
various APIs that you can work with from within Javascript.
