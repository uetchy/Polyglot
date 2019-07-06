#!/usr/bin/env node

const path = require('path')
const fs = require('fs')
const assert = require('assert')
const { execSync } = require('child_process')
const plist = require('plist')

const targetVersion = process.env.TARGET_VERSION
assert(targetVersion, 'specify TARGET_VERSION envvar')

// rewrite `docs/manifest.plist`
const manifestPath = path.resolve(__dirname, '../docs/manifest.plist')
console.log(`rewriting '${manifestPath}'`)
const manifest = plist.parse(fs.readFileSync(manifestPath, 'utf8'))
manifest['Extension Updates'][0]['CFBundleVersion'] = targetVersion
manifest['Extension Updates'][0]['CFBundleShortVersionString'] = targetVersion
manifest['Extension Updates'][0][
  'URL'
] = `https://github.com/uetchy/Polyglot/releases/download/v${targetVersion}/Polyglot.safariextz`
fs.writeFileSync(manifestPath, plist.build(manifest))

// rewrite `Polyglot.safariextension/Info.plist`
const infoPath = path.resolve(
  __dirname,
  '../Polyglot.safariextension/Info.plist'
)
console.log(`rewriting '${infoPath}'`)
const info = plist.parse(fs.readFileSync(infoPath, 'utf8'))
info['CFBundleShortVersionString'] = targetVersion
info['CFBundleVersion'] = targetVersion
fs.writeFileSync(infoPath, plist.build(info))

// rewrite `package.json`
const packagePath = path.resolve(__dirname, '../package.json')
console.log(`rewriting '${packagePath}'`)
const package = require(packagePath)
package.version = targetVersion
fs.writeFileSync(packagePath, JSON.stringify(package, null, 2))
