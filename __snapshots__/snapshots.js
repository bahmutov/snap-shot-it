module.exports = {
  "src/spec.js": {
    "spec file": {
      "adds 2 numbers": {
        "1": 5
      },
      "has several snapshot numbers": {
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5
      },
      "supports promises": {
        "1": 42
      },
      "inner tests": {
        "works in nested describes": {
          "1": "foo"
        }
      }
    },
    "example": {
      "works": {
        "1": 30,
        "2": "a text message",
        "3": 42
      }
    },
    "multi line text": {
      "works": {
        "1": "\n      line 1\n      line 2\n      line 3\n    "
      },
      "works with longer text": {
        "1": "first line\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10"
      }
    }
  },
  "src/data-driven-spec.js": {
    "data-driven testing": {
      "computes values": {
        "1": {
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
      },
      "finds single prime": {
        "1": {
          "name": "isPrime",
          "behavior": [
            {
              "given": 6,
              "expect": false
            }
          ]
        },
        "2": {
          "name": "isPrime",
          "behavior": [
            {
              "given": 17,
              "expect": true
            }
          ]
        },
        "3": {
          "name": "isPrime",
          "behavior": [
            {
              "given": 73,
              "expect": true
            }
          ]
        },
        "4": {
          "name": "isPrime",
          "behavior": [
            {
              "given": 50,
              "expect": false
            }
          ]
        }
      },
      "finds multiple primes": {
        "1": {
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
      },
      "checks behavior of binary function add": {
        "1": {
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
      },
      "works": {
        "1": {
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
        },
        "2": {
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
        },
        "3": {
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
      }
    }
  },
  "src/named-snapshots-spec.js": {
    "named snapshots": {
      "saves these snapshots by custom name": {
        "1": 1,
        "2": 2,
        "3": 3
      }
    }
  },
  "src/second-spec.js": {
    "second-spec": {
      "works too": {
        "1": "some value"
      }
    }
  },
  "test/two-specs/a-spec.js": {
    "a-spec": {
      "works": {
        "1": "value a"
      }
    }
  },
  "test/two-specs/b-spec.js": {
    "b-spec": {
      "works": {
        "1": "value b"
      },
      "works with long text": {
        "1": "\n      line 1\n      line 2\n      line 3\n      line 4\n      line 5\n      line 6\n      line 7\n      line 8\n      line 9\n      line 10\n    "
      }
    }
  },
  "__version": "0.0.0-development"
}
