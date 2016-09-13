import assert from 'assert'
import { applyMask } from '../src/index.js'

// Object ID stub
class objectID {
  toString () {
    return '507f191e810c19729de860ea'
  }
}
const o = new objectID()

describe('Morph', () => {
  it('transforms data', () => {
    const input = {
      _id: new objectID(),
      code: '123',
      items: [{
        cost: 45,
        name: 'An item'
      }, {
        cost: 10,
        name: 'Another item'
      }],
      recipient: {
        email: 'me@example.org'
      }
    }
    const schema = {
      id: '@_id',
      email: '@recipient.email',
      items: '@items'
    }

    const expected = {
      id: '507f191e810c19729de860ea',
      email: 'me@example.org',
      items: [{
        cost: 45,
        name: 'An item'
      }, {
        cost: 10,
        name: 'Another item'
      }]
    }
    const result = applyMask(input, schema)

    assert.deepEqual(result, expected)
  })
})
