# scripts

## update-version

```bash
yarn build # production build

export TARGET_VERSION=<version> # specify next version
./scripts/update-version.js # update corresponding files
yarn # update lockfile
fixpack # format package.json
git commit -am "release: v${TARGET_VERSION}"
git tag v${TARGET_VERSION} -a -m "release: v${TARGET_VERSION}"
git push
git push --tags
```

then open up Safari Extension Builder and export an extension to a package file (`.safariextz`) and attach it to the release in GitHub.
