exports['works 1'] = 42

exports['works 2'] = `
another value
`

exports['works abs 1'] = {
  "name": "abs",
  "behavior": [
    {
      "given": -3,
      "expect": 3
    },
    {
      "given": 2,
      "expect": 2
    },
    {
      "given": 4,
      "expect": 4
    },
    {
      "given": 3,
      "expect": 3
    }
  ]
}

exports['works add 1'] = {
  "name": "add",
  "behavior": [
    {
      "given": [
        3,
        4
      ],
      "expect": 7
    },
    {
      "given": [
        5,
        6
      ],
      "expect": 11
    }
  ]
}
