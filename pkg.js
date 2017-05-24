#!/usr/bin/env node
const path = require('path');
const childExec = require('child_process').exec;

const fs = require('fs-extra');
const opn = require('opn');
const promisify = require('micro-promisify');

const argv = process.argv.slice(2);
const exec = promisify(childExec);

function pkgApp(url, outputDir) {
  url = url || argv[0];

  if (!url) {
    throw new Error('A web-app URL must be provided');
    process.exit(1);
  }

  outputDir = outputDir || argv[1] || 'releases';

  const outputDirAbsolute = path.resolve(process.cwd(), outputDir);

  process.env.QBRT_URL = process.env.QBRT_URL || process.env.URL || url;

  return fs.ensureDir(outputDirAbsolute)
  .then(
    exec(`${path.join(__dirname, 'node_modules', '.bin', 'pkg')} ${path.join(__dirname, 'launch.js')} --out-dir ${outputDirAbsolute}`)
  )
  .then(() => {
    console.log(`Generated binaries to "${outputDir || process.cwd()}" directory`);
    const openedDir = opn(outputDir);

    // TODO: Exit when binaries have fully completed being written to disk.
    setTimeout(function () {
      process.exit(0);
    }, 5000);

    return openedDir;
  })
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = pkgApp;

if (!module.parent) {
  pkgApp();
}
