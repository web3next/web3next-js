const async = require("async");
const rlp = require("rlp");
const tape = require("tape");
const ethUtil = require("ethereumjs-util");
const Trie = require("..");

tape("simple save and retrive", (tester) => {
  const it = tester.test;

  it("should not crash if given a non-existant root", (t) => {
    const root = Buffer.from("3f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d", "hex");
    const trie = new Trie(null, root);

    trie.get("test", (err, value) => {
      t.equal(value, null);
      t.end(err);
    });
  });

  const trie = new Trie();

  it("save a value", (t) => {
    trie.put("test", "one", t.end);
  });

  it("should get a value", (t) => {
    trie.get("test", (err, value) => {
      t.equal(value.toString(), "one");
      t.end(err);
    });
  });

  it("should update a value", (t) => {
    trie.put("test", Buffer.from("two"), () => {
      trie.get("test", (err, value) => {
        t.equal(value.toString(), "two");
        t.end(err);
      });
    });
  });

  it("should delete a value", (t) => {
    trie.del("test", (stack) => {
      trie.get("test", (err, value) => {
        t.notok(value);
        t.end(err);
      });
    });
  });

  it("should recreate a value", (t) => {
    trie.put(Buffer.from("test"), Buffer.from("one"), t.end);
  });

  it("should get updated a value", (t) => {
    trie.get("test", (err, value) => {
      t.equal(value.toString(), "one");
      t.end(err);
    });
  });

  it("should create a branch here", (t) => {
    trie.put(Buffer.from("doge"), Buffer.from("coin"), () => {
      t.equal("de8a34a8c1d558682eae1528b47523a483dd8685d6db14b291451a66066bf0fc", trie.root.toString("hex"));
      t.end();
    });
  });

  it("should get a value that is in a branch", (t) => {
    trie.get(Buffer.from("doge"), (err, value) => {
      t.equal(value.toString(), "coin");
      t.end(err);
    });
  });

  it("should delete from a branch", (t) => {
    trie.del("doge", (err1, stack) => {
      trie.get("doge", (err2, value) => {
        t.equal(value, null);
        t.end(err1 || err2);
      });
    });
  });
});

tape("storing longer values", (tester) => {
  const it = tester.test;
  const trie = new Trie();
  const longString = "this will be a really really really long value";
  const longStringRoot = "b173e2db29e79c78963cff5196f8a983fbe0171388972106b114ef7f5c24dfa3";

  it("should store a longer string", (t) => {
    trie.put(Buffer.from("done"), Buffer.from(longString), (err1, value) => {
      trie.put(Buffer.from("doge"), Buffer.from("coin"), (err2, value) => {
        t.equal(longStringRoot, trie.root.toString("hex"));
        t.end(err1 || err2);
      });
    });
  });

  it("should retreive a longer value", (t) => {
    trie.get(Buffer.from("done"), (err, value) => {
      t.equal(value.toString(), longString);
      t.end(err);
    });
  });

  it("should when being modiefied delete the old value", (t) => {
    trie.put(Buffer.from("done"), Buffer.from("test"), t.end);
  });
});

tape("testing Extentions and branches", (tester) => {
  const trie = new Trie();
  const it = tester.test;

  it("should store a value", (t) => {
    trie.put(Buffer.from("doge"), Buffer.from("coin"), t.end);
  });

  it("should create extention to store this value", (t) => {
    trie.put(Buffer.from("do"), Buffer.from("verb"), () => {
      t.equal("f803dfcb7e8f1afd45e88eedb4699a7138d6c07b71243d9ae9bff720c99925f9", trie.root.toString("hex"));
      t.end();
    });
  });

  it("should store this value under the extention ", (t) => {
    trie.put(Buffer.from("done"), Buffer.from("finished"), () => {
      t.equal("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb", trie.root.toString("hex"));
      t.end();
    });
  });
});

tape("testing Extentions and branches - reverse", (tester) => {
  const it = tester.test;
  const trie = new Trie();

  it("should create extention to store this value", (t) => {
    trie.put(Buffer.from("do"), Buffer.from("verb"), t.end);
  });

  it("should store a value", (t) => {
    trie.put(Buffer.from("doge"), Buffer.from("coin"), t.end);
  });

  it("should store this value under the extention ", (t) => {
    trie.put(Buffer.from("done"), Buffer.from("finished"), () => {
      t.equal("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb", trie.root.toString("hex"));
      t.end();
    });
  });
});

tape("testing deletions cases", (tester) => {
  const it = tester.test;
  let trie = new Trie();

  it("should delete from a branch->branch-branch", (t) => {
    async.parallel([
      async.apply(trie.put.bind(trie), Buffer.from([11, 11, 11]), "first"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 22, 22]), "create the first branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 34, 44]), "create the last branch")
    ], () => {
      trie.del(Buffer.from([12, 22, 22]), () => {
        trie.get(Buffer.from([12, 22, 22]), (err, val) => {
          t.equal(null, val);
          trie = new Trie();
          t.end(err);
        });
      });
    });
  });

  it("should delete from a branch->branch-extention", (t) => {
    async.parallel([
      async.apply(trie.put.bind(trie), Buffer.from([11, 11, 11]), "first"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 22, 22]), "create the first branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 33, 33]), "create the middle branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 33, 44]), "create the last branch")
    ], () => {
      trie.del(Buffer.from([12, 22, 22]), () => {
        trie.get(Buffer.from([12, 22, 22]), (err, val) => {
          t.equal(null, val);
          t.end(err);
        });
      });
    });
  });

  it("should delete from a extention->branch-extention", (t) => {
    trie.put(Buffer.from([11, 11, 11]), "first", () => {
      // create the top branch
      trie.put(Buffer.from([12, 22, 22]), "create the first branch", () => {
        // crete the middle branch
        trie.put(Buffer.from([12, 33, 33]), "create the middle branch", () => {
          trie.put(Buffer.from([12, 33, 44]), "create the last branch", () => {
            // delete the middle branch
            trie.del(Buffer.from([11, 11, 11]), () => {
              trie.get(Buffer.from([11, 11, 11]), (err, val) => {
                t.equal(null, val);
                t.end(err);
              });
            });
          });
        });
      });
    });
  });

  it("should delete from a extention->branch-branch", (t) => {
    trie.put(Buffer.from([11, 11, 11]), "first", () => {
      // create the top branch
      trie.put(Buffer.from([12, 22, 22]), "create the first branch", () => {
        // crete the middle branch
        trie.put(Buffer.from([12, 33, 33]), "create the middle branch", () => {
          trie.put(Buffer.from([12, 34, 44]), "create the last branch", () => {
            // delete the middle branch
            trie.del(Buffer.from([11, 11, 11]), () => {
              trie.get(Buffer.from([11, 11, 11]), (err, val) => {
                t.equal(null, val);
                t.end(err);
              });
            });
          });
        });
      });
    });
  });
});

tape("testing checkpoints", (tester) => {
  let postRoot; let preRoot; let trie;
  const it = tester.test;

  it("setup", (t) => {
    trie = new Trie();
    trie.put("do", "verb", () => {
      trie.put("doge", "coin", () => {
        preRoot = trie.root.toString("hex");
        t.end();
      });
    });
  });

  it("should create a checkpoint", (t) => {
    trie.checkpoint();
    t.end();
  });

  it("should save to the cache", (t) => {
    trie.put("test", "something", () => {
      trie.put("love", "emotion", () => {
        postRoot = trie.root.toString("hex");
        t.end();
      });
    });
  });

  it("should revert to the orginal root", (t) => {
    t.equal(trie.isCheckpoint, true);
    trie.revert(() => {
      t.equal(trie.root.toString("hex"), preRoot);
      t.equal(trie.isCheckpoint, false);
      t.end();
    });
  });

  it("should commit a checkpoint", (t) => {
    trie.checkpoint();
    trie.put("test", "something", () => {
      trie.put("love", "emotion", () => {
        trie.commit(() => {
          t.equal(trie.isCheckpoint, false);
          t.equal(trie.root.toString("hex"), postRoot);
          t.end();
        });
      });
    });
  });

  it("should commit a nested checkpoint", (t) => {
    trie.checkpoint();
    let root;

    trie.put("test", "something else", () => {
      root = trie.root;
      trie.checkpoint();
      trie.put("the feels", "emotion", () => {
        trie.revert();
        trie.commit(() => {
          t.equal(trie.isCheckpoint, false);
          t.equal(trie.root.toString("hex"), root.toString("hex"));
          t.end();
        });
      });
    });
  });
});

tape("it should create the genesis state root from ethereum", (tester) => {
  const it = tester.test;
  const trie4 = new Trie();
  const g = Buffer.from("8a40bfaa73256b60764c1bf40675a99083efb075", "hex");
  const j = Buffer.from("e6716f9544a56c530d868e4bfbacb172315bdead", "hex");
  const v = Buffer.from("1e12515ce3e0f817a4ddef9ca55788a1d66bd2df", "hex");
  const a = Buffer.from("1a26338f0d905e295fccb71fa9ea849ffa12aaf4", "hex");
  const stateRoot = Buffer.alloc(32);

  stateRoot.fill(0);
  const startAmount = Buffer.alloc(26);

  startAmount.fill(0);
  startAmount[0] = 1;
  const account = [startAmount, 0, stateRoot, ethUtil.sha3()];
  const rlpAccount = rlp.encode(account);
  const cppRlp = "f85e9a010000000000000000000000000000000000000000000000000080a00000000000000000000000000000000000000000000000000000000000000000a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

  const genesisStateRoot = "2f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d";

  tester.equal(cppRlp, rlpAccount.toString("hex"));

  it("shall match the root", (t) => {
    trie4.put(g, rlpAccount, () => {
      trie4.put(j, rlpAccount, () => {
        trie4.put(v, rlpAccount, () => {
          trie4.put(a, rlpAccount, () => {
            t.equal(trie4.root.toString("hex"), genesisStateRoot);
            t.end();
          });
        });
      });
    });
  });
});
