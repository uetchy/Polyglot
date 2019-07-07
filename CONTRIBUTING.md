# Contribution Guide

## Setup development environment

Install dependencies and run `yarn start` to watch TypeScript files.

```bash
yarn install # => Install deps
yarn start   # => Start webpack to watch .ts files
```

then open up `Preference > Extentions` in Safari and make sure `Polyglot` is enabled in the extention panel.

## Build

```bash
yarn build # => just build ts / swift
yarn ship  # => build ts / swift and generate .app
```

## Before commit

```bash
yarn build  # => build codebase to ensure there are no errors
yarn format # => format code with SwiftFormat
```
