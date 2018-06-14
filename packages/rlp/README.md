SYNOPSIS
=====

[Recursive Length](https://github.com/ethereum/wiki/wiki/RLP) Prefix Encoding for node.js.

INSTALL
======
`npm install rlp`   

install with `-g` if you want to use the cli.

USAGE
=======

```javascript
var RLP = require('rlp');
var assert = require('assert');

var nestedList = [ [], [[]], [ [], [[]] ] ];
var encoded = RLP.encode(nestedList);
var decoded = RLP.decode(encoded);
assert.deepEqual(nestedList, decoded);


```

API
=====
`rlp.encode(plain)` - RLP encodes an `Array`, `Buffer` or `String` and returns a `Buffer`.

`rlp.decode(encoded, [skipRemainderCheck=false])` - Decodes an RLP encoded `Buffer`, `Array` or `String` and returns a `Buffer` or an `Array` of `Buffers`. If `skipRemainderCheck` is enabled, `rlp` will just decode the first rlp sequence in the buffer. By default, it would throw an error if there are more bytes in Buffer than used by rlp sequence.

CLI
===
`rlp decode <hex string>`   
`rlp encode <json String>`  

TESTS
=====
Test uses mocha. To run `npm test`

fork from [ethereumjs/rlp](https://github.com/ethereumjs/rlp/commit/90661f13296fc31f25fd8c6d7ea2fec51d50bd08)
