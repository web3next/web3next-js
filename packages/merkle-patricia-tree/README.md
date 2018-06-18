# SYNOPSIS 

This is an implementation of the modified merkle patricia tree as specified in the [Ethereum's yellow paper](http://gavwood.com/Paper.pdf).

> The modified Merkle Patricia tree (trie) provides a persistent data structure to map between arbitrary-length binary data (byte arrays). It is defined in terms of a mutable data structure to map between 256-bit binary fragments and arbitrary-length binary data. The core of the trie, and its sole requirement in terms of the protocol specification is to provide a single 32-byte value that identifies a given set of key-value pairs.   
  \- Ethereum's yellow paper  

The only backing store supported is LevelDB through the ```levelup``` module.

# INSTALL
 `npm install merkle-patricia-tree`

# USAGE

## Initialization and Basic Usage

```javascript
import Trie from 'merkle-patricia-tree';
import levelup from 'levelup';
const db = levelup('./testdb'),
const trie = new Trie(db); 

await trie.put('test', 'one');
const value = async trie.get('test');
console.log(value && value.toString());
```

## Merkle Proofs

```javascript
const prove = await Trie.prove(trie, 'test');
const value = await Trie.verifyProof(trie.root, 'test', prove);
console.log(value.toString())
```

# API
[./docs/](./docs/index.md)

# TESTING
`npm test`

# REFERENCES

- ["Exploring Ethereum's state trie with Node.js"](https://wanderer.github.io/ethereum/nodejs/code/2014/05/21/using-ethereums-tries-with-node/) blog post
- ["Merkling in Ethereum"](https://blog.ethereum.org/2015/11/15/merkling-in-ethereum/) blog post
- [Ethereum Trie Specification](https://github.com/ethereum/wiki/wiki/Patricia-Tree) Wiki
- ["Understanding the ethereum trie"](https://easythereentropy.wordpress.com/2014/06/04/understanding-the-ethereum-trie/) blog post
- ["Trie and Patricia Trie Overview"](https://www.youtube.com/watch?v=jXAHLqQthKw&t=26s) Video Talk on Youtube

# LICENSE
MPL-2.0

fork from [ethereumjs/merkle-patricia-tree](https://github.com/ethereumjs/merkle-patricia-tree/commit/75dff20794402967af0b2d45fc577e1e719d8956)