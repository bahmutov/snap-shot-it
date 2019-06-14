exports['exact name'] = 1

exports['duplicate key same value is detected 1'] = `
Duplicate snapshot key "exact name"
in spec file: src/duplicate-key-spec.js
test title: duplicate key same value is detected
previous test title: duplicate key same value is detected
Please change the snapshot name to ensure uniqueness.
`

exports['diff values'] = 1

exports['duplicate key different value is detected 1'] = `
Duplicate snapshot key "diff values"
in spec file: src/duplicate-key-spec.js
test title: duplicate key different value is detected
previous test title: duplicate key different value is detected
Please change the snapshot name to ensure uniqueness.
`
