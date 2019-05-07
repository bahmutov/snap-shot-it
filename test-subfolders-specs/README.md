# test-subfolders-specs

This repo shows how `snap-shot-core` stores all snapshots from nested specs in subfolders that are parallel to the original specs. The option to use relative filenames is in [package.json](package.json)

```json
{
  "config": {
    "snap-shot-it": {
      "useRelativePath": true
    }
  }
}
```

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
  specs/
    spec.js
    subfolder/
      spec2.js
```
