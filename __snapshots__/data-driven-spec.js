exports['data-driven testing checks behavior of binary function add add 1'] = {
  "name": "add",
  "behavior": [
    {
      "given": [
        1,
        2
      ],
      "expect": 3
    },
    {
      "given": [
        2,
        2
      ],
      "expect": 4
    },
    {
      "given": [
        -5,
        5
      ],
      "expect": 0
    },
    {
      "given": [
        10,
        11
      ],
      "expect": 21
    }
  ]
}

exports['data-driven testing computes values 1'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 1,
      "expect": false
    },
    {
      "given": 2,
      "expect": true
    },
    {
      "given": 3,
      "expect": true
    }
  ]
}

exports['data-driven testing finds multiple primes isPrime 1'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 1,
      "expect": false
    },
    {
      "given": 2,
      "expect": true
    },
    {
      "given": 3,
      "expect": true
    },
    {
      "given": 4,
      "expect": false
    },
    {
      "given": 5,
      "expect": true
    },
    {
      "given": 6,
      "expect": false
    },
    {
      "given": 7,
      "expect": true
    },
    {
      "given": 8,
      "expect": false
    },
    {
      "given": 9,
      "expect": false
    }
  ]
}

exports['data-driven testing finds single prime isPrime 1'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 6,
      "expect": false
    }
  ]
}

exports['data-driven testing finds single prime isPrime 2'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 17,
      "expect": true
    }
  ]
}

exports['data-driven testing finds single prime isPrime 3'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 73,
      "expect": true
    }
  ]
}

exports['data-driven testing finds single prime isPrime 4'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 50,
      "expect": false
    }
  ]
}

exports['data-driven testing works add 1'] = {
  "name": "add",
  "behavior": [
    {
      "given": [
        1,
        2
      ],
      "expect": 3
    }
  ]
}

exports['data-driven testing works isPrime 1'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 10,
      "expect": false
    },
    {
      "given": 11,
      "expect": true
    }
  ]
}

exports['data-driven testing works isPrime 2'] = {
  "name": "isPrime",
  "behavior": [
    {
      "given": 12,
      "expect": false
    },
    {
      "given": 13,
      "expect": true
    }
  ]
}
