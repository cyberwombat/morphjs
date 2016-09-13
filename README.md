# Morph

Transform JS object literals using schema for output purposes such as database result to api output.


### Example schema

const schema = { id: '@id' }

Given an collection of document it will return something like: [{ id: '123' }, { id: '234' }].

If just one doc is provided then the result will be a single object instead of an array.

Basically the value parameter is a string - if it starts with '@' it will look for that value in the fields. If '@' is ommitted then it will just return a string as is.

One can also pass a function which is given then entire original collection/document and the function can return whatever  is needed to be inserted in that place.

We can also prepend with '#' which will return the count of that field.



