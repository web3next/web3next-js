module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true
  },
  "extends": [
    "canonical",
    "canonical/ava",
    "canonical/flowtype",
    "canonical/jest"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "plugins": [
    "promise"
  ],
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "prefer-const": [
      "error"
    ],
    "id-length": [
      "off"
    ],
    "sort-keys": [
      "off"
    ],
    "arrow-body-style": [
      "error",
      "as-needed"
    ]
  }
};
