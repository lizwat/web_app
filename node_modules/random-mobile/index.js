'use strict';

var randomNatural  = require('random-natural');
var randomAreaCode = require('random-areacode');

module.exports = function (options) {

  var areaCode = randomAreaCode();
  var exchange = randomNatural({ min: 2, max: 9, inspected: true }).toString()
    + randomNatural({ min: 0, max: 9, inspected: true }).toString()
    + randomNatural({ min: 0, max: 9, inspected: true }).toString();

  var subscriber = randomNatural({
    min: 1000,
    max: 9999,
    inspected: true
  }).toString();

  return options && options.formatted
    ? areaCode + ' ' + exchange + '-' + subscriber
    : areaCode + exchange + subscriber;
};
