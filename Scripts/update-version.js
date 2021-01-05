#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const assert = require("assert");
const plist = require("plist");

const bundleVersion = process.env.VERSION;
assert(bundleVersion, "specify VERSION envvar");

console.log(`CFBundleShortVersionString: ${bundleVersion}`);
console.log(`CFBundleVersion: ${bundleVersion}`);

// rewrite `Polyglot/Info.plist`
const appInfoPath = path.resolve(__dirname, "../Polyglot/Info.plist");
console.log(`rewriting '${appInfoPath}'`);
const appInfo = plist.parse(fs.readFileSync(appInfoPath, "utf8"));
appInfo["CFBundleShortVersionString"] = bundleVersion;
appInfo["CFBundleVersion"] = bundleVersion;
fs.writeFileSync(appInfoPath, plist.build(appInfo));

// rewrite `PolyglotSafariExtension/Info.plist`
const extInfoPath = path.resolve(
  __dirname,
  "../PolyglotSafariExtension/Info.plist"
);
console.log(`rewriting '${extInfoPath}'`);
const extInfo = plist.parse(fs.readFileSync(extInfoPath, "utf8"));
extInfo["CFBundleShortVersionString"] = bundleVersion;
extInfo["CFBundleVersion"] = bundleVersion;
fs.writeFileSync(extInfoPath, plist.build(extInfo));

// rewrite `package.json`
const packagePath = path.resolve(__dirname, "../package.json");
console.log(`rewriting '${packagePath}'`);
const package = require(packagePath);
package.version = bundleVersion;
fs.writeFileSync(packagePath, JSON.stringify(package, null, 2));
