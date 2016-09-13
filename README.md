# Morph

Transform JS object literals using schema for output purposes such as database result to api output.

### Install

    npm i morphjs

### Example

Original input:

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
        email: 'me@example.org',
        first: 'Sponge',
        last: 'Bob'
      }
    }

Transformation schema:

    const schema = {
      id: '@_id',
      company: 'My company',
      email: '@recipient.email',
      name: function(doc) {
        return doc.recipient.first + ' ' +  doc.recipient.last
      },
      items: '@items',
      count: '#items'
    }

Apply:

    const result = applyMask(input, schema)

Output:

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


Basically the value parameter is a string - if it starts with '@' it will look for that value in the fields. If '@' is ommitted then it will just return a string as is.

One can also pass a function which is given then entire original collection/document and the function can return whatever is needed to be inserted in that place.

We can also prepend with '#' which will return the count of that field.



