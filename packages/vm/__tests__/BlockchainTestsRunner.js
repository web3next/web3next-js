const async = require("async");
const ethUtil = require("ethereumjs-util");
const Trie = require("merkle-patricia-tree/secure");
const Block = require("ethereumjs-block");
const Blockchain = require("ethereumjs-blockchain");
const BlockHeader = require("ethereumjs-block/header.js");
const Level = require("levelup");
const testUtil = require("./util.js");

const cacheDB = new Level("./.cachedb");

module.exports = function runBlockchainTest (options, testData, t, cb) {
  const blockchainDB = new Level("", {
    db: require("memdown")
  });
  const state = new Trie();
  const blockchain = new Blockchain(blockchainDB);

  blockchain.ethash.cacheDB = cacheDB;
  let VM;

  if (options.dist) {
    VM = require("../dist");
  } else {
    VM = require("../lib");
  }
  const vm = new VM({
    state,
    blockchain
  });
  const genesisBlock = new Block();

  testData.homestead = true;
  if (testData.homestead) {
    vm.on("beforeTx", (tx) => {
      tx._homestead = true;
    });
    vm.on("beforeBlock", (block) => {
      block.header.isHomestead = function () {
        return true;
      };
    });
  }
  async.series([
    // set up pre-state
    function (done) {
      testUtil.setupPreConditions(state, testData, () => {
        done();
      });
    },
    function (done) {
      // create and add genesis block
      genesisBlock.header = new BlockHeader(formatBlockHeader(testData.genesisBlockHeader));
      t.equal(state.root.toString("hex"), genesisBlock.header.stateRoot.toString("hex"), "correct pre stateRoot");
      if (testData.genesisRLP) {
        t.equal(genesisBlock.serialize().toString("hex"), testData.genesisRLP.slice(2), "correct genesis RLP");
      }
      blockchain.putGenesis(genesisBlock, (err) => {
        done(err);
      });
    },
    function (done) {
      async.eachSeries(testData.blocks, (raw, cb) => {
        try {
          const block = new Block(Buffer.from(raw.rlp.slice(2), "hex"));

          // forces the block into thinking they are homestead

          if (testData.homestead) {
            block.header.isHomestead = function () {
              return true;
            };
            block.uncleHeaders.forEach((uncle) => {
              uncle.isHomestead = function () {
                return true;
              };
            });
          }
          blockchain.putBlock(block, (err) => {
            cb(err);
          });
        } catch (err) {
          cb();
        }
      }, () => {
        done();
      });
    },
    function runBlockchain (done) {
      vm.runBlockchain(() => {
        done();
      });
    },
    function getHead (done) {
      vm.blockchain.getHead((err, block) => {
        if (testData.lastblockhash.substr(0, 2) === "0x") {
          // fix for BlockchainTests/GeneralStateTests/stRandom/*
          testData.lastblockhash = testData.lastblockhash.substr(2);
        }
        t.equal(block.hash().toString("hex"), testData.lastblockhash, "last block hash");

        // if the test fails, then block.header is the preState because
        // vm.runBlock has a check that prevents the actual postState from being
        // imported if it is not equal to the expected postState. it is useful
        // for debugging to skip this, so that verifyPostConditions will compare
        // testData.postState to the actual postState, rather than to the preState.
        if (!options.debug) {
          // make sure the state is set before checking post conditions
          state.root = block.header.stateRoot;
        }
        done(err);
      });
    },
    function (done) {
      if (options.debug) {
        testUtil.verifyPostConditions(state, testData.postState, t, done);
      } else {
        done();
      }
    }
  ], () => {
    t.equal(blockchain.meta.rawHead.toString("hex"), testData.lastblockhash, "correct header block");
    cb();
  });
};

function formatBlockHeader (data) {
  const r = {};
  const keys = Object.keys(data);

  keys.forEach((key) => {
    r[key] = ethUtil.addHexPrefix(data[key]);
  });

  return r;
}
