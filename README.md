# Morph

MorphJS transforms object literals into different structures using a simple schema such as formatting database results into a format suitable for an API output. 

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
      name: (doc) => {
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

### Rules

#### Path reference
Values prefixed with `@` are used to traverse the input object. 

Ex:

`name: @recipient.name.first` 

will look for the name field in:

````
{
    recipient: {
        name: {
            first: 'Sponge'
        }
    }
}
````

#### Strings
A quoted string will be used as is. 
Ex: 
    
    version: '1.0'

#### Counts
Array lengths count can be obtained by prefixing value with `@`.

Ex:

    total: '@items'

#### Functions

If more functionality is necessary you can also use a function. This function is given the input document as a parameter.

Ex:

    name: doc => doc.recipient.first + ' ' +  doc.recipient.last

#### Buffer, Dates and Mongo ObjectID

If a Buffer or Date instance or an Mongo ObjectID is provided it will be coerced into a string. 

Ex:

````
// Input
_id: new objectID('28d64ae8122ab883bbc167ef'),

// Schema
id: _id

// Output
id: '28d64ae8122ab883bbc167ef'
````





