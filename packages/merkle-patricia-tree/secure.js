import {promisify} from "es6-promisify";
import {sha3} from "ethereumjs-util";
import CheckpointTrie from "./promisifiedCheckpointTrie";

/**
 * You can create a secure Trie where the keys are automatically hashed using **SHA3** by using `require('merkle-patricia-tree/secure')`. It has the same methods and constuctor as `Trie`
 * @class SecureTrie
 * @extends Trie
 */
class SecureTrie extends CheckpointTrie {
  constructor (db, root) {
    super(db, root);
    this.__put = promisify(super.put);
    this.__del = promisify(super.del);
    this.__get = promisify(super.get);

    this.put = function (key, value) {
      if (value != null) {
        return this.__put(sha3(key), value);
      }

      return this.__del(sha3(key));
    };
    this.del = function (key) {
      this.__del(sha3(key));
    };
    this.get = function (key) {
      this.__get(sha3(key));
    };
  }
}

export default SecureTrie;
