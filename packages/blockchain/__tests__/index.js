/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs */
const Blockchain = require("..");
const Block = require("ethereumjs-block");
const async = require("async");
const ethUtil = require("ethereumjs-util");
const levelup = require("levelup");
const memdown = require("memdown");
const BN = require("bn.js");
const testData = require("./testdata.json");

const isConsecutive = (blocks) => {
  let _isConsecutive = true;

  blocks.some((block, index) => {
    if (index === 0) {
      return false;
    }
    if (Buffer.compare(block.header.parentHash, blocks[index - 1].hash()) !== 0) {
      _isConsecutive = false;

      return true;
    }
  });

  return _isConsecutive;
};

test("blockchain test", () => {
  const blockchain = new Blockchain();
  let genesisBlock;
  const blocks = [];
  let forkBlock;

  blockchain.validate = false;
  const p = new Promise((resolve, reject) => async.series([

    function (done) {
      blockchain.getHead((err, head) => {
        if (err) {
          return done(err);
        }
        done();
      });
    },
    function alternateConstructors (done) {
      const db = levelup("", {db: memdown});
      let blockchain = new Blockchain(db);

      // support constructor with db parameter

      expect(db).toEqual(blockchain.db);
      blockchain = new Blockchain({
        detailsDb: db,
        blockDb: db
      });

      // support blockDb and detailsDb params
      expect(db).toEqual(blockchain.db);

      // ignore detailsDb param
      expect(blockchain.detailsDb).toBeFalsy();
      done();
    },
    function addgenesis (done) {
      genesisBlock = new Block();
      genesisBlock.setGenesisParams();
      blockchain.putGenesis(genesisBlock, (err) => {
        if (err) {
          return done(err);
        }

        // genesis block hash should be correct
        expect(genesisBlock.hash().toString("hex")).toBe(blockchain.meta.genesis.toString("hex"));
        blocks.push(genesisBlock);
        done();
      });
    },
    function invalidGenesis (done) {
      const badBlock = new Block();

      badBlock.header.number = Buffer.from([]);
      blockchain.validate = true;
      blockchain.putBlock(badBlock, (err) => {
        // should not validate a block incorrectly flagged as genesis
        expect(err).toBeTruthy();
        blockchain.validate = false;
        done();
      }, false);
    },
    function addBlocks (done) {
      function addNextBlock (blockNumber) {
        const block = new Block();

        block.header.number = ethUtil.toBuffer(blockNumber);
        block.header.difficulty = "0xfffffff";
        block.header.parentHash = blocks[blockNumber - 1].hash();
        blockchain.putBlock(block, (err) => {
          if (err) {
            return done(err);
          }

          blocks.push(block);

          if (blocks.length === 10) {
            // added 10 blocks
            expect(true).toBeTruthy();
            done();
          } else {
            addNextBlock(blockNumber + 1);
          }
        });
      }
      addNextBlock(1);
    },
    function getBlockByNumber (done) {
      blockchain.getBlock(1, (err, block) => {
        if (err) {
          return done(err);
        }

        // should get block by number
        expect(block.hash().toString("hex")).toBe(blocks[1].hash().toString("hex"));
        done();
      });
    },
    function getBlockByHash (done) {
      blockchain.getBlock(genesisBlock.hash(), (err, block) => {
        if (err) {
          return done(err);
        }

        // should get block by hash
        expect(block.hash().toString("hex")).toBe(genesisBlock.hash().toString("hex"));
        done();
      });
    },
    function getBlocks1 (done) {
      // start: genesisHash, max: 5, skip: 0, reverse: false
      blockchain.getBlocks(genesisBlock.hash(), 5, 0, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 5 blocks
        expect(blocks.length).toBe(5);

        // blocks should be consecutive
        expect(isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks2 (done) {
      // start: genesisHash, max: 5, skip: 1, reverse: false
      blockchain.getBlocks(genesisBlock.hash(), 5, 1, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 5 blocks
        expect(blocks.length).toBe(5);

        // blocks should not be consecutive
        expect(!isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks3 (done) {
      // start: genesisHash, max: 5, skip: 2, reverse: false
      blockchain.getBlocks(genesisBlock.hash(), 5, 2, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 4 blocks
        expect(blocks.length).toBe(4);

        // blocks should not be consecutive
        expect(!isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks4 (done) {
      // start: genesisHash, max: 12, skip: 0, reverse: false
      blockchain.getBlocks(genesisBlock.hash(), 12, 0, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 10 blocks
        expect(blocks.length).toBe(10);

        // blocks should be consecutive
        expect(isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks5 (done) {
      // start: 0, max: 5, skip: 0, reverse: false
      blockchain.getBlocks(0, 5, 0, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 5 blocks
        expect(blocks.length).toBe(5);

        // blocks should be consecutive
        expect(isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks6 (done) {
      // start: 0, max: 5, skip: 1, reverse: false
      blockchain.getBlocks(1, 5, 1, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 5 blocks
        expect(blocks.length).toBe(5);

        // blocks should not be consecutive
        expect(!isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks7 (done) {
      // start: 0, max: 5, skip: 2, reverse: false
      blockchain.getBlocks(0, 5, 2, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 4 blocks
        expect(blocks.length).toBe(4);

        // blocks should not be consecutive
        expect(!isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks8 (done) {
      // start: 0, max: 12, skip: 0, reverse: false
      blockchain.getBlocks(0, 12, 0, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        // should get 10 blocks
        expect(blocks.length).toBe(10);

        // blocks should be consecutive
        expect(isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks9 (done) {
      // start: 1, max: 5, skip: 0, reverse: false
      blockchain.getBlocks(1, 5, 0, false, (err, blocks) => {
        if (err) {
          return done(err);
        }

        expect(blocks.length).toBe(5)
        expect(isConsecutive(blocks)).toBeTruthy();
        done();
      });
    },
    function getBlocks10 (done) {
      // start: 5, max: 5, skip: 0, reverse: true
      blockchain.getBlocks(5, 5, 0, true, (err, blocks) => {
        if (err) {
          return done(err);
        }
        expect(blocks.length).toBe(5)
        expect(isConsecutive(blocks.reverse())).toBeTruthy()

        done();
      });
    },
    function getBlocks11 (done) {
      // start: 5, max: 10, skip: 0, reverse: true
      blockchain.getBlocks(5, 10, 0, true, (err, blocks) => {
        if (err) {
          return done(err);
        }
        expect(blocks.length).toBe(6)
        expect(isConsecutive(blocks.reverse())).toBeTruthy()
        done();
      });
    },
    function getBlocks12 (done) {
      // start: 5, max: 10, skip: 0, reverse: true
      blockchain.getBlocks(5, 10, 1, true, (err, blocks) => {
        if (err) {
          return done(err);
        }
        expect(blocks.length).toBe(3)
        expect(isConsecutive(blocks.reverse())).toBeFalsy()
        done();
      });
    },
    function selectNeededHashes (done) {
      const neededHash = Buffer.from("abcdef", "hex");

      blockchain.selectNeededHashes([
        blocks[0].hash(),
        blocks[9].hash(),
        neededHash
      ], (err, hashes) => {
        if (err) {
          return done(err);
        }
         // should find needed hash
        expect(hashes[0].toString("hex")).toBe(neededHash.toString("hex"))
        done();
      });
    },
    function iterateBlocks (done) {
      let i = 0;

      blockchain.iterator("test", (block, reorg, cb) => {
        if (block.hash().equals(blocks[i + 1].hash())) {
          i++;
        }
        cb();
      }, () => {
        // should iterate through 9 blocks
        expect(i).toBe( 9)
        done();
      });
    },
    function iterateEmpty (done) {
      const blockchain = new Blockchain();

      blockchain.validate = false;
      blockchain.iterator("test", () => {
        done();
      }, () => {
        done();
      });
    },
    function getMeta (done) {
      // should get meta.rawHead
      expect(blockchain.meta.rawHead.toString("hex")).toBe(blocks[9].hash().toString("hex"))
      // should get meta.genesis"
      expect(blockchain.meta.genesis.toString("hex")).toBe(genesisBlock.hash().toString("hex"))
      expect(blockchain.meta.heads.test).toBeTruthy()
      done();
    },
    function addForkBlockAndResetStaleHeads (done) {
      forkBlock = new Block();
      forkBlock.header.number = ethUtil.toBuffer(9);
      forkBlock.header.difficulty = "0xffffffff";
      forkBlock.header.parentHash = blocks[8].hash();
      blockchain._heads.staletest = blockchain._headHeader;
      blockchain.putBlock(forkBlock, (err) => {
        expect(blockchain._heads.staletest.toString("hex")).toBe(blocks[8].hash().toString("hex"));
        expect(err).toBeFalsy();
        done();
      });
    },
    function delForkBlock (done) {

      blockchain.delBlock(forkBlock.hash(), (err) => {
        expect(err).toBeFalsy();
         // should not change head
        expect(blockchain._headHeader.toString("hex")).toBe(blocks[8].hash().toString("hex"));
        done();
      });
    },
    function delBlocks (done) {
      function delNextBlock (number, cb) {
        const block = blocks[number];

        blockchain.delBlock(block.hash(), (err) => {
          if (err) {
            return cb(err);
          }
          if (number > 6) {
            return delNextBlock(--number, cb);
          }
          cb();
        });
      }
      delNextBlock(9, (err) => {
        // should delete blocks in canonical chain
        expect(err).toBeFalsy()
        // should have block 5 as head
        expect(blockchain._headHeader.toString("hex")).toBe(blocks[5].hash().toString("hex"));
        done();
      });
    },
    function delBlockAndChildren (done) {
      blockchain.delBlock(blocks[1].hash(), (err) => {
        // should delete block and children
        expect(err).toBeFalsy()
        // should have genesis as head
        expect(blockchain._headHeader.toString("hex")).toBe(genesisBlock.hash().toString("hex"));
        done();
      });
    },
    function putBlocks (done) {
      blockchain.putBlocks(blocks.slice(1), (err) => {
        // should put multiple blocks at once
        expect(err).toBeFalsy()
        done();
      });
    },
    function getHeads (done) {
      createTestDB((err, db, genesis) => {
        if (err) {
          return done(err);
        }
        const blockchain = new Blockchain({db});

        blockchain.getHead((err, head) => {
          if (err) {
            return done(err);
          }
          // should get head
          expect(head.hash().toString("hex")).toBe(genesis.hash().toString("hex"))
          // should get state root heads
          expect(blockchain._heads.head0.toString("hex")).toBe( "abcd")
          done();
        });
      });
    },
    function validate (done) {
      const blockchain = new Blockchain({validate: true});
      const genesisBlock = new Block();

      genesisBlock.setGenesisParams();
      blockchain.putGenesis(genesisBlock, (err) => {
        // should validate genesisBlock
        expect(err).toBeFalsy()
        const invalidBlock = new Block();

        blockchain.putBlock(invalidBlock, (err) => {
          // should not validate an invalid block
          expect(err).toBeTruthy();
          done();
        });
      });
    },
    function addBlockWithBody (done) {
      const blockchain = new Blockchain({validate: false});
      const genesisBlock = new Block(Buffer.from(testData.genesisRLP.slice(2), "hex"));

      blockchain.putGenesis(genesisBlock, (err) => {
        if (err) {
          return done(err);
        }
        const block = new Block(Buffer.from(testData.blocks[0].rlp.slice(2), "hex"));

        blockchain.putBlock(block, (err) => {
          if (err) {
            return done(err);
          }
          // should add block with a body
          expect(err).toBeFalsy()
          done();
        });
      });
    },
    function uncachedDbOps (done) {
      createTestDB((err, db, genesis) => {
        if (err) {
          return done(err);
        }
        const blockchain = new Blockchain({db});

        async.series([
          (cb) => {
            return blockchain._hashToNumber(genesisBlock.hash(), (err, number) => {
              // should perform _hashToNumber correctly
              expect(number.toString(10)).toBe("0")
              cb(err);
            });
          },
          (cb) => {
            return blockchain._numberToHash(new BN(0), (err, hash) => {
              // should perform _numberToHash correctly
              expect(genesisBlock.hash().toString("hex")).toBe(hash.toString("hex"))
              cb(err);
            });
          },
          (cb) => {
            return blockchain._getTd(genesisBlock.hash(), new BN(0), (err, td) => {
              // should perform _getTd correctly
              expect(td.toBuffer().toString("hex")).toBe(genesis.header.difficulty.toString("hex"));
              cb(err);
            });
          }
        ], done);
      });
    },
    function saveHeads (done) {
      const db = levelup("", {db: memdown});
      let blockchain = new Blockchain({
        db,
        validate: false
      });

      blockchain.putBlock(blocks[1], (err) => {
        if (err) {
          return done(err);
        }
        blockchain = new Blockchain({
          db,
          validate: false
        });
        async.series([
          (cb) => {
            return blockchain.getLatestHeader((err, header) => {
              if (err) {
                return done(err);
              }
              // should get latest header
              expect(header.hash().toString("hex")).toBe(blocks[1].hash().toString("hex"))
              cb();
            });
          },
          (cb) => {
            return blockchain.getLatestBlock((err, headBlock) => {
              if (err) {
                return done(err);
              }
              // should get latest block
              expect(headBlock.hash().toString("hex")).toBe(blocks[1].hash().toString("hex"))
              cb();
            });
          }
        ], done);
      });
    }
  ], (err) => {
    if (!err) {
      resolve(true);
    }else {
      reject(err)
    }
  }))
  return expect(p).resolves.toBe(true);
});

function createTestDB (cb) {
  const genesis = new Block();

  genesis.setGenesisParams();
  const db = levelup("", {db: memdown});

  db.batch([{
    type: "put",
    key: Buffer.from("6800000000000000006e", "hex"),
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: genesis.hash()
  }, {
    type: "put",
    key: Buffer.from("48d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3", "hex"),
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: Buffer.from("00", "hex")
  }, {
    type: "put",
    key: "LastHeader",
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: genesis.hash()
  }, {
    type: "put",
    key: "LastBlock",
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: genesis.hash()
  }, {
    type: "put",
    key: Buffer.from("680000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3", "hex"),
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: ethUtil.rlp.encode(genesis.header.raw)
  }, {
    type: "put",
    key: Buffer.from("680000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa374", "hex"),
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: ethUtil.rlp.encode(new BN(17179869184).toBuffer())
  }, {
    type: "put",
    key: Buffer.from("620000000000000000d4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3", "hex"),
    keyEncoding: "binary",
    valueEncoding: "binary",
    value: ethUtil.rlp.encode(genesis.serialize(false).slice(1))
  }, {
    type: "put",
    key: "heads",
    valueEncoding: "json",
    value: {head0: {type: "Buffer",
      data: [171, 205]}}
  }], (err) => {
    cb(err, db, genesis);
  });
}
