#!/usr/bin/env node
const childExec = require('child_process').exec;
const path = require('path');

const chalk = require('chalk');
const cli = require('cli');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const initSkeleton = require('init-skeleton');
const promisify = require('micro-promisify');

const exec = promisify(childExec);

const fallbackAppURL = 'https://example.com/';

const run = module.exports = (url, forceRefresh=null, verboseMode=null, cliArgs=process.argv) => {
  cliArgs = cliArgs || [];
  const argv = cliArgs[0] && cliArgs[0].endsWith('node') ? process.argv.slice(2) : cliArgs;

  url = url || getAppURL(argv, fallbackAppURL);

  if (forceRefresh === null) {
    forceRefresh = argv.includes('--force') || argv.includes('-f') ||
                   argv.includes('--refresh') || argv.includes('--rebuild') ||
                   argv.includes('-r');
  }

  if (verboseMode === null) {
    verboseMode = argv.includes('--verbose') || argv.includes('-v') ||
                  argv.includes('--debug') || argv.includes('-d');
  }

  return fetch('https://api.github.com/repos/mozilla/qbrt/commits', {
    headers: {
      Accept: 'application/vnd.github.preview'
    }
  })
  .then(res => {
    if (res.status !== 200) {
      logError(`Non-200 response code from GitHub: ${res.status}`);
      return null;
    }
    return res.json();
  })
  .then(data => {
    if (!data || !data.length) {
      return;
    }
    const shaLatest = data[0].sha;
    return shaLatest;
  }).then(shaLatest => {
    const tmpDir = `/tmp/.qbrt/versions/${shaLatest}/`;
    return qbrtBuild(tmpDir, forceRefresh);
  }).catch(err => {
    logError(err);
    const tmpDir = '/tmp/.qbrt/versions/master';
    return qbrtBuild(tmpDir, forceRefresh);
  });

  function logError(msg) {
    if (!msg) {
      return;
    }
    const err = typeof msg === 'string' ? new Error(msg) : msg;
    if (verboseMode) {
      console.error(`[💥 Error] ${err.message}`, err.stack ? '\n' + err : '');
    }
    return err;
  }

  function logWarning(msg) {
    if (!msg) {
      return;
    }
    const err = typeof msg === 'string' ? new Error(msg) : msg;
    if (verboseMode) {
      console.info(`[⚠️ Warning] ${err.message}`, err.stack ? '\n' + err : '');
    }
    return err;
  }

  function getAppURL(argv=[], fallbackURL) {
    let appURL = process.QBRT_URL || process.URL || '';
    if (appURL) {
      return appURL;
    }
    for (var idx = 0; idx < argv.length; idx++) {
      let arg = (argv[idx] || '').trim();
      if (arg.startsWith('http:') || arg.startsWith('https:')) {
        appURL = arg;
        break;
      }
    }
    return appURL || fallbackURL;
  }

  function qbrtBuild(tmpDir, forceRefresh) {
    if (forceRefresh) {
      return fs.remove(tmpDir)
      .then(() => qbrtBuild(tmpDir, false));
    }

    return fs.pathExists(tmpDir)
    .then(exists => {
      if (!exists || forceRefresh) {
        return qbrtClone();
      }
    }, err => {
      logError(err);
      return qbrtClone();
    })
    .then(qbrtRun)
    .catch(err => {
      logError(err);
    });

    function qbrtClone() {
      return fs.ensureDir(tmpDir)
      .then(() => {
        return initSkeleton.init('https://github.com/mozilla/qbrt', {
          rootPath: tmpDir
        });
      })
      .then(repoDir => {
        return Promise.resolve(repoDir);
      })
      .catch(err => {
        if (err && err.code === 'ALREADY_NPM_PROJECT') {
          return Promise.resolve(err);
        }
        logError(err);
      });
    }

    function qbrtUpdate() {
      cli.spinner('  Updating runtime …');
      return exec(`node ${path.join(tmpDir, 'bin', 'postinstall.js')}`, {
        stdio: 'inherit'
      })
      .then(() => {
        cli.spinner(chalk.green.bold('✓ ') + 'Updating runtime … done!', true);
      })
      .catch(err => {
        cli.spinner(chalk.red.bold('✗ ') + 'Updating runtime … failed!', true);
        logError(err);
        process.exit(1);
      });
    }

    function qbrtRun() {
      return exec(`node ${path.join(tmpDir, 'bin', 'cli.js')} run ${url}`, {
        stdio: 'inherit'
      });
    }
  }
}

if (!module.parent) {
  run(null, null, null, process.argv);
}
