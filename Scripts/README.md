# scripts

## Update version

```bash
export VERSION=3.0
export BUILD=1
Scripts/update-version.js # update corresponding files
yarn # update lockfile
fixpack # format package.json
git add .
git commit -am "release: v${VERSION}"
git tag v${VERSION} -a -m "release: v${VERSION}"
git push
```

## Ship to Mac App Store

```bash
yarn ship:mas # will build Polyglot.app and upload to MAS
```

## Build app for pre-release

```bash
yarn ship # will generate Polyglot.app to `Artifacts/Exported/`
```
