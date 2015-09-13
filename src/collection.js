import inflect from 'i'
import _ from 'underscore'

const inflections = inflect()

export default function collection(fetch, definition){
  let models = fetch()

  let object = _(models)

  definition.attributeNames().forEach(attribute => {
    let finder = inflections.camelize("find_by_" + attribute, false)    

    object[finder] = function(needle){
      return object.detect(item => {
        return item[attribute] === needle
      })
    }
  })

  return object
}
