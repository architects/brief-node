---
type: page
title: View Example
---

# Views

Views can be used by writing a YAML block which includes
the view key.  This will be a path that we require from 
the briefcase's view path.

Views are, for example:

```javascript
// data is the yaml from your block
module.exports = function(data = {}, document, briefcase){ 
  return('some content, html if you like')
}
```

Here is an example:

```yaml
view: visualization
myArgs: whatever
really: i mean whatever
```

This provides a lot of flexibility for incorporating the assets, data
sources, and the collected data and documents in the rest of the
briefcase as custom HTML content in your document 
