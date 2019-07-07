# scripts

## update-version

```bash
yarn build # production build

export TARGET_VERSION=<version> # specify next version
./Scripts/update-version.js # update corresponding files
yarn # update lockfile
fixpack # format package.json
git commit -am "release: v${TARGET_VERSION}"
git tag v${TARGET_VERSION} -a -m "release: v${TARGET_VERSION}"
git push
git push --tags
```

## ship

```bash
yarn ship # will generate Polyglot.app to `Artifacts/Exported/`
```
