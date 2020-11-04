# Contribution Guide

## Setup development environment

Install dependencies and run `yarn start` to watch TypeScript files.

```bash
make bootstrap
yarn start   # => Start webpack to watch and transpile TypeScript files
```

then open `Polyglot.xcodeproj` in Xcode and run `Polyglot` target to test the extension in Safari.

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
yarn ship:mas # for Mac App Store
```
