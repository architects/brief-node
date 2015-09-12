import inflections from 'underscore.string'
import _ from 'underscore'

/**
* clone an object
*
*/
export function clone (base) {
  return JSON.parse(JSON.stringify(base))
}

export function slugify (string) {
  return inflections.dasherize(string.toLowerCase())
}
