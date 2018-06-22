const ethUtil = require("ethereumjs-util");
const rlp = require("rlp");
const Buffer = require("safe-buffer").Buffer;

const Account = module.exports = function (data) {
  // Define Properties
  const fields = [{
    name: "nonce",
    default: Buffer.alloc(0)
  }, {
    name: "balance",
    default: Buffer.alloc(0)
  }, {
    name: "stateRoot",
    length: 32,
    default: ethUtil.SHA3_RLP
  }, {
    name: "codeHash",
    length: 32,
    default: ethUtil.SHA3_NULL
  }];

  ethUtil.defineProperties(this, fields, data);
};

Account.prototype.serialize = function () {
  return rlp.encode(this.raw);
};

Account.prototype.isContract = function () {
  return this.codeHash.toString("hex") !== ethUtil.SHA3_NULL_S;
};

Account.prototype.getCode = async function (state) {
  if (!this.isContract()) {
    return Promise.resolve(Buffer.alloc(0));
  }
  return state.getRaw(this.codeHash);
};

Account.prototype.setCode = async function (trie, code) {
  this.codeHash = ethUtil.sha3(code);
  if (this.codeHash.toString("hex") === ethUtil.SHA3_NULL_S) {
    return Promise.resolve(Buffer.alloc(0));
  }
  await trie.putRaw(this.codeHash, code);
  return Promise.resolve(this.codeHash);
};

Account.prototype.getStorage = function (trie, key, cb) {
  const t = trie.copy();

  t.root = this.stateRoot;
  t.get(key, cb);
};

Account.prototype.setStorage = function (trie, key, val, cb) {
  const self = this;
  const t = trie.copy();

  t.root = self.stateRoot;
  t.put(key, val, (err) => {
    if (err) {
      return cb();
    }
    self.stateRoot = t.root;
    cb();
  });
};

Account.prototype.isEmpty = function () {
  return this.balance.toString("hex") === "" &&
  this.nonce.toString("hex") === "" &&
  this.stateRoot.toString("hex") === ethUtil.SHA3_RLP_S &&
  this.codeHash.toString("hex") === ethUtil.SHA3_NULL_S;
};
