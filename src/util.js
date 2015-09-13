import inflect from 'i'
import _ from 'underscore'

const inflections = inflect()

/**
* clone an object
*
*/
export function clone (base) {
  return JSON.parse(JSON.stringify(base))
}

export function slugify (string) {
  string = string.replace(/\s/,'_')
  return inflections.dasherize(string.toLowerCase())
}

export function flatten (array) {
  return _.flatten(array)
}

export function singularize (string) {
  return inflections.singularize(string)
}
