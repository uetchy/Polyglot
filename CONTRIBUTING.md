# Contribution Guide

## Setup development environment

Install dependencies and run `yarn start` to watch TypeScript files.

```bash
yarn install
```

## Development flow

1. `yarn start` to fire up webpack watching and transpiling TypeScript files inside `PolyglotSafariExtensinos/Sources`.
1. Open up `Polyglot.xcodeproj` in Xcode.
1. Build and launch `Polyglot` target.
1. In the Safari settings, ensure that Polyglot extension is enabled.
1. Everytime you change `.ts` and `.swift` files, you will need to re-build the app (step 3) to reflect these changes.

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
