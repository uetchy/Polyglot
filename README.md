![](http://uechi-public.s3.amazonaws.com/github/Polyglot/header.png)

[![Build Status](https://travis-ci.com/uetchy/Polyglot.svg?branch=master)](https://travis-ci.com/uetchy/Polyglot)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/polyglot)

Polyglot is a Safari extension that translates selected text into your native
language using Google Translate.

[Download latest version](https://github.com/uetchy/Polyglot/releases/latest)
then move `Polyglot.app` into `Applications` folder.

# Usage

Open up `Polyglot.app` and change the target
language to one you prefer and reconfigure keyboard shortcuts as you wish.

- Select word or sentence and just type the configured key combination.
- or, Select word or sentence and right-click then click **Translate**.
- or, Select word or sentence and click **Translate** button on tool bar.

![](http://uechi-public.s3.amazonaws.com/github/Polyglot/screencast1.gif)

# Troubleshooting

#### It seems a new settings have not been applied.

Refresh web pages or restart Safari and try it again. If you continue to face
same problem, please open an issue on GitHub.

#### My key combination didn't work

Some key combinations are preblematic. Try another one.

# Development

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

# Contributors

list of awesome contributors.

- Yasuaki Uechi
- Sergey Sorokin
- Serhii Dmytruk
- Matt Sephton
- nixiesquid
