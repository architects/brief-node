---
type: epic
title: Model Definition DSL
project: Brief
---

# Model Definition DSL

The Model Definition DSL allows the writer to define the model classes which power the documents she writes.

## Features

### A User can describe the metadata schema

Models are generally useful when they all share similar attributes.  For
example you might have a status for every project.  So define that as a
metadata attribute.

### A User can describe the document structure

Models can define sections which have specific meaning, and which
usually will contain a predictable, repeatable set of elements.  A
Section would be defined by an h2 heading, with several h3 headings each
representing similar categories of items which belong to the h2.

### A User can define attributes using CSS selectors

Using css selectors against the rendered content, we can extract text
values and assign them to data attributes.  This allows us to extract
metadata from the writing itself.  For example we might consider the
title of a document to be the value of the first h1 heading.
