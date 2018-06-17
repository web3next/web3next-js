import {promisify} from "es6-promisify";
import BaseTrie from "./baseTrie";
import checkpointInterface from "./checkpoint-interface";
import proof from "./proof";
const levelup = require("levelup");
const memdown = require("memdown");
const async = require("async");
const inherits = require("util").inherits;
const Readable = require("readable-stream").Readable;
const levelws = require("level-ws");
const callTogether = require("./util").callTogether;

export default class PromisifiedCheckpointTrie extends BaseTrie {
 
  constructor (db, root) {
    super(db, root);

    this._scratch = null;
    this._checkpoints = [];

    const callbackMethods = [
      "put", "del", "getRaw", "delRaw", "get",
      "findPath", "createReadStream", "batch",
      "checkRoot", "_findDbNodes"
    ];

    callbackMethods.forEach((method) => {
      if (typeof super[method] !== "function") {
        throw new TypeError(`${method} is not a function`);
      }
      this[method] = promisify(super[method]);
    });

    this.putRawNormalMode = promisify(super.putRaw);
    this.putRaw = this.putRawNormalMode;
  }



  get isCheckpoint () {
    return Boolean(this._checkpoints.length);
  }

  /**
 * Creates a checkpoint that can later be reverted to or committed. After this is called, no changes to the trie will be permanently saved until `commit` is called
   *
 * @method checkpoint
 */
  checkpoint () {
    const wasCheckpoint = this.isCheckpoint;

    this._checkpoints.push(this.root);
    if (!wasCheckpoint && this.isCheckpoint) {
      this._enterCpMode();
    }
  }

  /**
 * commits a checkpoint to disk
 *
 * @method commit
 * @param {Function} cb the callback
 */
  commit (cb) {
    cb = callTogether(cb, this.sem.leave);

    this.sem.take(() => {
      if (this.isCheckpoint) {
        this._checkpoints.pop();
        if (!this.isCheckpoint) {
          this._exitCpMode(true, cb);
        } else {
          cb();
        }
      } else {
        throw new Error("trying to commit when not checkpointed");
      }
    });
  }

  /**
 * Reverts the trie to the state it was at when `checkpoint` was first called.
 *
 * @method revert
 * @param {Function} cb the callback
 */
  revert (cb) {
    cb = callTogether(cb, this.sem.leave);

    this.sem.take(() => {
      if (this.isCheckpoint) {
        this.root = this._checkpoints.pop();
        if (!this.isCheckpoint) {
          this._exitCpMode(false, cb);

          return;
        }
      }

      cb();
    });
  }

  // enter into checkpoint mode
  _enterCpMode () {
    this._scratch = levelup("", {
      db: memdown
    });
    this._getDBs = [this._scratch].concat(this._getDBs);
    this.__putDBs = this._putDBs;
    this._putDBs = [this._scratch];

    // this._putRaw = this.putRaw;
    this.putRaw = this.putRawCpMode;
  }

  // exit from checkpoint mode
  _exitCpMode (commitState, cb) {
    const scratch = this._scratch;

    this._scratch = null;
    this._getDBs = this._getDBs.slice(1);
    this._putDBs = this.__putDBs;
    this.putRaw = this.putRawNormalMode;

    const flushScratch = (db, cb) => {
      if (!db.createWriteStream) {
        db = levelws(db);
      }

      this.createScratchReadStream(scratch)
        .pipe(db.createWriteStream())
        .on("close", cb);
    };

    if (commitState) {
      async.map(this._putDBs, flushScratch, cb);
    } else {
      cb();
    }
  }

  // adds the interface when copying the trie
  copy () {
    return new PromisifiedCheckpointTrie(this.db, this.root);
  }

  putRawCpMode (key, val, cb) {
    function dbPut (db, cb2) {
      db.put(key, val, {
        keyEncoding: "binary",
        valueEncoding: "binary"
      }, cb2);
    }
    async.each(this.__putDBs, dbPut, cb);
  }

  createScratchReadStream (scratch) {
    const trie = this.copy();

    scratch = scratch || this._scratch;

    // only read from the scratch
    trie._getDBs = [scratch];
    trie._scratch = scratch;

    return new ScratchReadStream(trie);
  }
}

// ScratchReadStream
// this is used to minimally dump the scratch into the db

class ScratchReadStream extends Readable {
  constructor (trie) {
    super({
      objectMode: true
    });
    this.trie = trie;
    this.next = null;
  }

  _read () {
    if (!this._started) {
      this._started = true;
      this.trie._findDbNodes((nodeRef, node, key, next) => {
        this.push({
          key: nodeRef,
          value: node.serialize()
        });
        next();
      }, () => {
      // close stream
        this.push(null);
      });
    }
  }
}
PromisifiedCheckpointTrie.prove = promisify(proof.prove)
PromisifiedCheckpointTrie.verifyProof = promisify(proof.verifyProof)
