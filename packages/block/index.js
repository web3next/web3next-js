const Common = require("ethereumjs-common");
const ethUtil = require("ethereumjs-util");
const Tx = require("ethereumjs-tx");
const Trie = require("merkle-patricia-tree");

const BN = ethUtil.BN;
const rlp = ethUtil.rlp;
const async = require("async");
const BlockHeader = require("./header");

/**
 * Creates a new block object
 *
 * @constructor the raw serialized or the deserialized block.
 * @param {Array|Buffer|Object} data
 * @param {Array} opts Options
 * @param {string|number} opts.chain The chain for the block [default: 'mainnet']
 * @param {string} opts.hardfork Hardfork for the block [default: null, block number-based behaviour]
 * @param {Object} opts.common Alternatively pass a Common instance (ethereumjs-common) instead of setting chain/hardfork directly
 * @prop {Header} header the block's header
 * @prop {Array.<Header>} uncleList an array of uncle headers
 * @prop {Array.<Buffer>} raw an array of buffers containing the raw blocks.
 */
const Block = module.exports = function (data, opts) {
  opts = opts || {};

  if (opts.common) {
    if (opts.chain) {
      throw new Error("Instantiation with both opts.common and opts.chain parameter not allowed!");
    }
    this._common = opts.common;
  } else {
    const chain = opts.chain ? opts.chain : "mainnet";
    const hardfork = opts.hardfork ? opts.hardfork : null;

    this._common = new Common(chain, hardfork);
  }

  this.transactions = [];
  this.uncleHeaders = [];
  this._inBlockChain = false;
  this.txTrie = new Trie();

  Object.defineProperty(this, "raw", {
    get () {
      return this.serialize(false);
    }
  });

  let rawTransactions; let rawUncleHeaders;

  // defaults
  if (!data) {
    data = [[], [], []];
  }

  if (Buffer.isBuffer(data)) {
    data = rlp.decode(data);
  }

  if (Array.isArray(data)) {
    this.header = new BlockHeader(data[0], opts);
    rawTransactions = data[1];
    rawUncleHeaders = data[2];
  } else {
    this.header = new BlockHeader(data.header, opts);
    rawTransactions = data.transactions || [];
    rawUncleHeaders = data.uncleHeaders || [];
  }

  // parse uncle headers
  for (var i = 0; i < rawUncleHeaders.length; i++) {
    this.uncleHeaders.push(new BlockHeader(rawUncleHeaders[i], opts));
  }

  // parse transactions
  for (i = 0; i < rawTransactions.length; i++) {
    const tx = new Tx(rawTransactions[i]);

    tx._homestead = true;
    this.transactions.push(tx);
  }
};

Block.Header = BlockHeader;

/**
 * Produces a hash the RLP of the block
 *
 * @method hash
 */
Block.prototype.hash = function () {
  return this.header.hash();
};

/**
 * Determines if a given block is the genesis block
 *
 * @method isGenisis
 * @return Boolean
 */
Block.prototype.isGenesis = function () {
  return this.header.isGenesis();
};

/**
 * turns the block into the canonical genesis block
 *
 * @method setGenesisParams
 */
Block.prototype.setGenesisParams = function () {
  this.header.setGenesisParams();
};

/**
 * Produces a serialization of the block.
 *
 * @method serialize
 * @param {boolean} rlpEncode whether to rlp encode the block or not
 */
Block.prototype.serialize = function (rlpEncode) {
  const raw = [this.header.raw, [],
    []
  ];

  // rlpEnode defaults to true
  if (typeof rlpEncode === "undefined") {
    rlpEncode = true;
  }

  this.transactions.forEach((tx) => {
    raw[1].push(tx.raw);
  });

  this.uncleHeaders.forEach((uncle) => {
    raw[2].push(uncle.raw);
  });

  return rlpEncode ? rlp.encode(raw) : raw;
};

/**
 * Generate transaction trie. The tx trie must be generated before the transaction trie can
 * be validated with `validateTransactionTrie`
 *
 * @method genTxTrie
 * @param {Function} cb the callback
 */
Block.prototype.genTxTrie = function (cb) {
  let i = 0;
  const self = this;

  async.eachSeries(this.transactions, (tx, done) => {
    self.txTrie.put(rlp.encode(i), tx.serialize(), done);
    i++;
  }, cb);
};

/**
 * Validates the transaction trie
 *
 * @method validateTransactionTrie
 * @return {boolean}
 */
Block.prototype.validateTransactionsTrie = function () {
  const txT = this.header.transactionsTrie.toString("hex");

  if (this.transactions.length) {
    return txT === this.txTrie.root.toString("hex");
  } else {
    return txT === ethUtil.SHA3_RLP.toString("hex");
  }
};

/**
 * Validates the transactions
 *
 * @method validateTransactions
 * @param {boolean} [stringError=false] whether to return a string with a dscription of why the validation failed or return a Bloolean
 * @return {boolean}
 */
Block.prototype.validateTransactions = function (stringError) {
  const errors = [];

  this.transactions.forEach((tx, i) => {
    const error = tx.validate(true);

    if (error) {
      errors.push(error + " at tx " + i);
    }
  });

  if (stringError === undefined || stringError === false) {
    return errors.length === 0;
  } else {
    return arrayToString(errors);
  }
};

/**
 * Validates the entire block. Returns a string to the callback if block is invalid
 *
 * @method validate
 * @param {BlockChain} blockChain the blockchain that this block wants to be part of
 * @param {Function} cb the callback which is given a `String` if the block is not valid
 */
Block.prototype.validate = function (blockChain, cb) {
  const self = this;
  const errors = [];

  async.parallel([
    // validate uncles
    self.validateUncles.bind(self, blockChain),

    // validate block
    self.header.validate.bind(self.header, blockChain),

    // generate the transaction trie
    self.genTxTrie.bind(self)
  ], (err) => {
    if (err) {
      errors.push(err);
    }

    if (!self.validateTransactionsTrie()) {
      errors.push("invalid transaction true");
    }

    const txErrors = self.validateTransactions(true);

    if (txErrors !== "") {
      errors.push(txErrors);
    }

    if (!self.validateUnclesHash()) {
      errors.push("invild uncle hash");
    }

    cb(arrayToString(errors));
  });
};

/**
 * Validates the uncle's hash
 *
 * @method validateUncleHash
 * @return {boolean}
 */
Block.prototype.validateUnclesHash = function () {
  let raw = [];

  this.uncleHeaders.forEach((uncle) => {
    raw.push(uncle.raw);
  });

  raw = rlp.encode(raw);

  return ethUtil.sha3(raw).toString("hex") === this.header.uncleHash.toString("hex");
};

/**
 * Validates the uncles that are in the block if any. Returns a string to the callback if uncles are invalid
 *
 * @method validateUncles
 * @param {Blockchain} blockChaina an instance of the Blockchain
 * @param {Function} cb the callback
 */
Block.prototype.validateUncles = function (blockChain, cb) {
  if (this.isGenesis()) {
    return cb();
  }

  const self = this;

  if (self.uncleHeaders.length > 2) {
    return cb("too many uncle headers");
  }

  const uncleHashes = self.uncleHeaders.map((header) => {
    return header.hash().toString("hex");
  });

  if (!((new Set(uncleHashes)).size === uncleHashes.length)) {
    return cb("dublicate unlces");
  }

  async.each(self.uncleHeaders, (uncle, cb2) => {
    const height = new BN(self.header.number);

    async.parallel([
      uncle.validate.bind(uncle, blockChain, height),

      // check to make sure the uncle is not already in the blockchain
      function (cb3) {
        blockChain.getDetails(uncle.hash(), (err, blockInfo) => {
          // TODO: remove uncles from BC
          if (blockInfo && blockInfo.isUncle) {
            cb3(err || "uncle already included");
          } else {
            cb3();
          }
        });
      }
    ], cb2);
  }, cb);
};

/**
 * Converts the block toJSON
 *
 * @method toJSON
 * @param {Bool} labeled whether to create an labeled object or an array
 * @return {Object}
 */
Block.prototype.toJSON = function (labeled) {
  if (labeled) {
    const obj = {
      header: this.header.toJSON(true),
      transactions: [],
      uncleHeaders: []
    };

    this.transactions.forEach((tx) => {
      obj.transactions.push(tx.toJSON(labeled));
    });

    this.uncleHeaders.forEach((uh) => {
      obj.uncleHeaders.push(uh.toJSON());
    });

    return obj;
  } else {
    return ethUtil.baToJSON(this.raw);
  }
};

function arrayToString (array) {
  try {
    return array.reduce((str, err) => {
      if (str) {
        str += " ";
      }

      return str + err;
    });
  } catch (e) {
    return "";
  }
}
