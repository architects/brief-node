---
type: page
title: Visualization Example
---

# Visualizations

Visualizations can be used by writing a YAML block which includes
the visualization key.  This will be a path that we require from 
the briefcase's view path.

Visualizations are, for example:

```javascript
// data is the yaml from your block
module.exports = function(data = {}, document, briefcase){ 
  return('some content, html if you like')
}
```

Here is an example:

```yaml
visualization: visualization
myArgs: whatever
really: i mean whatever
```

This provides a lot of flexibility for incorporating the assets, data
sources, and the collected data and documents in the rest of the
briefcase, in interesting ways.
