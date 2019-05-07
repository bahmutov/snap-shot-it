# test-flat-specs

This repo shows how `snap-shot-it` stores all snapshots from single folder by default

input spec files

```
specs/
  spec.js
  subfolder/
    spec2.js
```

result should be

```
__snapshots__/
  spec.js
  spec2.js
```
