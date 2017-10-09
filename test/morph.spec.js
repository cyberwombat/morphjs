const assert = require('assert')
const { applyMask } = require('../lib/index.js')

// Object ID stub
class ObjectID {
  toString () {
    return '507f191e810c19729de860ea'
  }
}

const input = {
  _id: new ObjectID(),
  code: '123',
  items: [{
    cost: 45,
    name: 'An item'
  }, {
    cost: 10,
    name: 'Another item'
  }],
  recipient: {
    email: 'me@example.org',
    first: 'Sponge',
    last: 'Bob'
  }
}

const schema = {
  id: '@_id',
  company: 'My company',
  email: '@recipient.email',
  name: function (doc) {
    return doc.recipient.first + ' ' + doc.recipient.last
  },
  items: '@items',
  count: '#items'
}

const expected = {
  id: '507f191e810c19729de860ea',
  company: 'My company',
  email: 'me@example.org',
  name: 'Sponge Bob',
  items: [{
    cost: 45,
    name: 'An item'
  }, {
    cost: 10,
    name: 'Another item'
  }],
  count: 2
}
const result = applyMask(input, schema)

assert.deepEqual(result, expected)
