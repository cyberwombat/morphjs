const { isArray, isString, isObject, isFunction, isEmpty, forIn, forOwn, each } = require('lodash')
const moment = require('moment')

let item = {}
const rekeys = {
  '_id': 'id'
}

// Format an object/collection according to schema structure
const applyMask = (data, schema) => {
  if (isArray(data)) {
    let a = []

    a = data.map(d => {
      item = d
      return processElement(schema)
    })
    return a
  } else {
    item = data

    return processElement(schema)
  }
}

// Fetch a deep object path by string
const getPath = (el) => {
  let path = el
  let fallback = null
  if (isString(el)) {
    const bits = el.toString().split(/\s*\|\|\s*/)
    path = bits[0]
    fallback = bits[1] || null
  }

  if (!isString(path)) return path
  let obj = item
  let exists = true

  if (!path.match(/^#|@/)) {
    obj = path
  } else {
    let count = path.slice(0, 1) === '#'

    path = path.slice(1).split('.')
    each(path, piece => {
      exists = true
      const m = piece.match(/(\w+)\[(\d+)\]/)
      const segment = m ? m[1] : piece

      if (!isObject(obj)) return fallback

      if (isArray(obj)) {
        let t = []
        forIn(obj, (v, k) => {
          if (v[segment]) t.push(v[segment])
          else exists = false
        })
        obj = t
      } else {
        obj = m ? obj[segment][m[2]] : obj[segment]
      }
    })
    if (count) obj = obj.length
  }

  if (obj instanceof Date) {
    return moment(obj).toISOString()
  }
  if (!exists || typeof obj === 'undefined' || obj === null) {
    return fallback
  }

  // Buffer and IDs
  if (Buffer.isBuffer(obj) || obj.toString().match(/^[0-9a-fA-F]{24}$/)) {
    obj = obj.toString()
  }

  return obj
}

const reKey = (o) => {
  if (!isObject(o)) return o

  let build = {}
  each(o, key => {
    // Get the destination key
    const dest = rekeys[key] || key

    // Get the value
    let value = o[key]

    // If this is an object, recurse
    if (isObject(o)) {
      value = reKey(value)
    }

    // Set it on the result using the destination key
    build[dest] = value
  })

  return build
}

// Private function to process path segment
const processSegment = (value) => {
  if (isFunction(value)) {
    return value(item)
  }
  if (isObject(value)) {
    return processElement(value)
  }
  return getPath(value)
}

// Recursively process each schema element
const processElement = (obj) => {
  let ret

  if (isFunction(obj)) {
    return obj(item)
  } else if (isObject(obj)) {
    if (isEmpty(obj)) {
      return obj
    }
    if (isArray(obj)) {
      ret = []
      forIn(obj, (value, key) => {
        ret.push(processSegment(value))
      })
    } else {
      ret = {}
      forOwn(obj, (prop, key) => {
        ret[getPath(key)] = processSegment(prop)
      })
    }
  } else {
    ret = getPath(obj)
  }
  return ret
}

exports.applyMask = applyMask
