const Buffer = require('safe-buffer').Buffer
const util = require('util')
const ethUtil = require('ethereumjs-util')
const StateManager = require('./stateManager.js')
const Account = require('ethereumjs-account')
const AsyncEventEmitter = require('async-eventemitter')
const BN = ethUtil.BN

// require the percomiled contracts
const num01 = require('./precompiled/01-ecrecover.js')
const num02 = require('./precompiled/02-sha256.js')
const num03 = require('./precompiled/03-ripemd160.js')
const num04 = require('./precompiled/04-identity.js')
const num05 = require('./precompiled/05-modexp.js')
const num06 = require('./precompiled/06-ecadd.js')
const num07 = require('./precompiled/07-ecmul.js')
const num08 = require('./precompiled/08-ecpairing.js')


/**
 * @constructor
 * @param {Object} [opts]
 * @param {StateManager} [opts.stateManager] A state manager instance (EXPERIMENTAL - unstable API)
 * @param {Trie} [opts.state] A merkle-patricia-tree instance for the state tree (ignored if stateManager is passed)
 * @param {Blockchain} [opts.blockchain] A blockchain object for storing/retrieving blocks (ignored if stateManager is passed)
 * @param {Boolean} [opts.activatePrecompiles] Create entries in the state tree for the precompiled contracts
 * @param {Boolean} [opts.allowUnlimitedContractSize] Allows unlimited contract sizes while debugging (default: false; ONLY use during debugging)
 */
class VM  extends AsyncEventEmitter {
  constructor(opts = {}) {
    super(opts);
  this.opts = opts

  if (opts.stateManager) {
    this.stateManager = opts.stateManager
  } else {
    this.stateManager = new StateManager({
      trie: opts.state,
      blockchain: opts.blockchain
    })
  }

  this.allowUnlimitedContractSize = opts.allowUnlimitedContractSize === undefined ? false : opts.allowUnlimitedContractSize

  // temporary
  // this is here for a gradual transition to StateManager
  this.blockchain = this.stateManager.blockchain
  this.trie = this.stateManager.trie

  // precompiled contracts
  this._precompiled = {}
  this._precompiled['0000000000000000000000000000000000000001'] = num01
  this._precompiled['0000000000000000000000000000000000000002'] = num02
  this._precompiled['0000000000000000000000000000000000000003'] = num03
  this._precompiled['0000000000000000000000000000000000000004'] = num04
  this._precompiled['0000000000000000000000000000000000000005'] = num05
  this._precompiled['0000000000000000000000000000000000000006'] = num06
  this._precompiled['0000000000000000000000000000000000000007'] = num07
  this._precompiled['0000000000000000000000000000000000000008'] = num08

  if (this.opts.activatePrecompiles) {
    for (var i = 1; i <= 7; i++) {
      this.trie.put(new BN(i).toArrayLike(Buffer, 'be', 20), new Account().serialize())
    }
  }
this.runCode = require('./runCode.js').bind(this)

  }

}


VM.deps = {
  ethUtil: ethUtil,
  Account: require('ethereumjs-account'),
  Trie: require('merkle-patricia-tree'),
  rlp: require('ethereumjs-util').rlp
}


VM.prototype.runJIT = require('./runJit.js')
VM.prototype.runBlock = require('./runBlock.js')
VM.prototype.runTx = require('./runTx.js')
VM.prototype.runCall = require('./runCall.js')
VM.prototype.runBlockchain = require('./runBlockchain.js')

VM.prototype.copy = function () {
  return new VM({ stateManager: this.stateManager.copy() })
}

/**
 * Loads precompiled contracts into the state
 */
VM.prototype.loadCompiled = function (address, src, cb) {
  this.trie.db.put(address, src, cb)
}

VM.prototype.populateCache = function (addresses, cb) {
  this.stateManager.warmCache(addresses, cb)
}
module.exports = VM

