#!/usr/bin/env node
const launch = require('../../launch.js');

function launchApp () {
  return launch('https://aframe.io/aframe/examples/showcase/spheres-and-fog/', null, null, process.argv);
}

module.exports = launchApp;

if (!module.parent) {
  launchApp();
}
