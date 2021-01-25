# Contribution Guide

## Setup development environment

Install dependencies and run `yarn start` to watch TypeScript files.

```bash
yarn install
yarn start   # => Start webpack to watch and transpile TypeScript files (PolyglotSafariExtensinos/Sources/content.ts)
```

then open `Polyglot.xcodeproj` in Xcode and run `Polyglot` target to start testing the extension in Safari.

## Build a distributable package

```bash
make
```

## Before commit

```bash
yarn build  # => build codebase to ensure there are no errors
yarn format # => format code with SwiftFormat
```

## Release (Maintainers only)

```bash
VERSION=3.2 BUILD=0 node Scripts/update-version.js
git add .
git commit -m 'chore: release v3.2.0'
yarn ship:mas # for Mac App Store
```
