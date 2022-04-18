'use strict';

var randomNatural = require('random-natural');

module.exports = function () {
  return randomNatural({ min: 2, max: 9, inspected: true }).toString()
    + randomNatural({ min: 0, max: 8, inspected: true }).toString()
    + randomNatural({ min: 0, max: 9, inspected: true }).toString();
};
