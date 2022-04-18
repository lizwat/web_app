# random-mobile

> Generate a random (U.S.) mobile phone number.

[![MIT License](https://img.shields.io/badge/license-MIT_License-green.svg?style=flat-square)](https://github.com/mock-end/random-mobile/blob/master/LICENSE)

[![build:?](https://img.shields.io/travis/mock-end/random-mobile/master.svg?style=flat-square)](https://travis-ci.org/mock-end/random-mobile)
[![coverage:?](https://img.shields.io/coveralls/mock-end/random-mobile/master.svg?style=flat-square)](https://coveralls.io/github/mock-end/random-mobile)


## Install

```
$ npm install --save random-mobile
```

## Usage

```js
var randomMobile = require('random-cn-mobile');

// API
// - randomMobile([options]);

// options
// - formatted

randomMobile();
// => '2617613391'

randomMobile({ formatted: true });
// => '267 456-1002'
```

## Related

- [random-areacode](https://github.com/mock-end/random-areacode) - Generate a random (U.S.) area code.
- [random-zipcode](https://github.com/mock-end/random-zipcode) - Generate a random (U.S.) zip code.


## Contributing

Pull requests and stars are highly welcome.

For bugs and feature requests, please [create an issue](https://github.com/mock-end/random-mobile/issues/new).
