#!/usr/bin/env node
const launch = require('../../launch.js');

function launchApp () {
  return launch('https://example.com/', null, null, process.argv);
}

module.exports = launchApp;

if (!module.parent) {
  launchApp();
}
