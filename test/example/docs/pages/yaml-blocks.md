---
type: page
title: YAML Blocks
---

# YAML Blocks

Yaml blocks can be extracted as data from the markdown document and not
displayed. This opens up some possibilities.

We could use YAML Blocks like this:

```yaml
deserialized: true
cool: yes
```

We could also treat YAML blocks as hidden data like this:

```data
key: settings
note: this will not be rendered
```

This will extract this data and store it on the document.
