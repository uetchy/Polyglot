# scripts

## update-version

```bash
export TARGET_VERSION=<version>
./scripts/update-version.js
git commit -am "release: v${TARGET_VERSION}"
git tag v${TARGET_VERSION}
```
