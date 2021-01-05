#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const assert = require("assert");
const { execSync } = require("child_process");
const plist = require("plist");

const shortVersion = process.env.VERSION;
assert(shortVersion, "specify VERSION envvar");

const buildId = process.env.BUILD;
assert(buildId, "specify BUILD envvar");

const bundleVersion = shortVersion + "." + buildId;

console.log(`CFBundleShortVersionString: ${shortVersion}`);
console.log(`CFBundleVersion: ${bundleVersion}`);

// rewrite `Polyglot/Info.plist`
const appInfoPath = path.resolve(__dirname, "../Polyglot/Info.plist");
console.log(`rewriting '${appInfoPath}'`);
const appInfo = plist.parse(fs.readFileSync(appInfoPath, "utf8"));
appInfo["CFBundleShortVersionString"] = shortVersion;
appInfo["CFBundleVersion"] = bundleVersion;
fs.writeFileSync(appInfoPath, plist.build(appInfo));

// rewrite `PolyglotSafariExtension/Info.plist`
const extInfoPath = path.resolve(
  __dirname,
  "../PolyglotSafariExtension/Info.plist"
);
console.log(`rewriting '${extInfoPath}'`);
const extInfo = plist.parse(fs.readFileSync(extInfoPath, "utf8"));
extInfo["CFBundleShortVersionString"] = shortVersion;
extInfo["CFBundleVersion"] = bundleVersion;
fs.writeFileSync(extInfoPath, plist.build(extInfo));

// rewrite `package.json`
const packagePath = path.resolve(__dirname, "../package.json");
console.log(`rewriting '${packagePath}'`);
const package = require(packagePath);
package.version = bundleVersion;
fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
