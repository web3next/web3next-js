const async = require("async");
const rlp = require("rlp");
const ethUtil = require("ethereumjs-util");
const Trie = require("..");

describe("simple save and retrive", () => {
  const root = Buffer.from("3f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d", "hex");

  test("should not crash if given a non-existant root", () => {
    const trie = new Trie(null, root);

    trie.get("test", (err, value) => {
      expect(value).toBe(null);
    });
  });

  test("should get a value", () => {
    const trie = new Trie(null, root);

    trie.put("test", "one", () => {
      trie.get("test", (err, value) => {
        expect(value.toString()).toBe("one");
      });
    });
  });

  test("should update a value", () => {
    const trie = new Trie(null, root);

    trie.put("test", Buffer.from("two"), () => {
      trie.get("test", (err, value) => {
        expect(value.toString()).toBe("two");
      });
    });
  });

  test("should delete a value", () => {
    const trie = new Trie(null, root);

    trie.del("test", (stack) => {
      trie.get("test", (err, value) => {
        expect(value).toBeFalsy();
      });
    });
  });

  test("should get updated a value", () => {
    const trie = new Trie(null, root);

    trie.put(Buffer.from("test"), Buffer.from("one"), () => {
      trie.get("test", (err, value) => {
        expect(value.toString()).toBe("one");
      });
    });
  });

  test("should get a value that is in a branch", () => {
    const trie = new Trie(null, root);

    trie.put(Buffer.from("doge"), Buffer.from("coin"), () => {
      expect("de8a34a8c1d558682eae1528b47523a483dd8685d6db14b291451a66066bf0fc").toBe(trie.root.toString("hex"));
      trie.get(Buffer.from("doge"), (err, value) => {
        expect(value.toString()).toBe("coin");
      });
    });
  });

  test("should delete from a branch", () => {
    const trie = new Trie(null, root);

    trie.del("doge", (err1, stack) => {
      trie.get("doge", (err2, value) => {
        expect(value).toBe(null);
      });
    });
  });
});

describe("storing longer values", () => {
  const trie = new Trie();
  const longString = "this will be a really really really long value";
  const longStringRoot = "b173e2db29e79c78963cff5196f8a983fbe0171388972106b114ef7f5c24dfa3";

  test("should store a longer string", () => {
    trie.put(Buffer.from("done"), Buffer.from(longString), (err1, value) => {
      trie.put(Buffer.from("doge"), Buffer.from("coin"), (err2, value) => {
        expect(longStringRoot).toBe(trie.root.toString("hex"));
      });
    });
  });

  test("should retreive a longer value", () => {
    trie.get(Buffer.from("done"), (err, value) => {
      expect(value.toString()).toBe(longString);
    });
  });

  test("should when being modiefied delete the old value", () => {
  });
});

describe("testing Extentions and branch", () => {
  test("should create extention to store this value", () => {
    const trie = new Trie();
    const longString = "this will be a really really really long value";

    trie.put(Buffer.from("done"), Buffer.from(longString), (err1, value) => {
      trie.put(Buffer.from("doge"), Buffer.from("coin"), (err2, value) => {
        trie.put(Buffer.from("done"), Buffer.from("test"), () => {
          trie.put(Buffer.from("doge"), Buffer.from("coin"), () => {
            trie.put(Buffer.from("do"), Buffer.from("verb"), () => {
              expect("f803dfcb7e8f1afd45e88eedb4699a7138d6c07b71243d9ae9bff720c99925f9").toBe(trie.root.toString("hex"));
            });
          });
        });
      });
    });
  });

  test("should store this value under the extention ", () => {
    const trie2 = new Trie();

    trie2.put(Buffer.from("doge"), Buffer.from("coin"), () => {
      trie2.put(Buffer.from("do"), Buffer.from("verb"), () => {
        trie2.put(Buffer.from("done"), Buffer.from("finished"), () => {
          expect("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb").toBe(trie2.root.toString("hex"));
        });
      });
    });
  });
});

describe("testing Extentions and branches - rever", () => {
  const trie3 = new Trie();

  test("should store this value under the extention ", () => {
    trie3.put(Buffer.from("do"), Buffer.from("verb"), () => {
      trie3.put(Buffer.from("doge"), Buffer.from("coin"), () => {
        trie3.put(Buffer.from("done"), Buffer.from("finished"), () => {
          expect("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb").toBe(trie3.root.toString("hex"));
        });
      });
    });
  });
});

describe("testing deletions cases", () => {
  test("should delete from a branch->branch-branch", () => {
    let trie = new Trie();

    async.parallel([
      async.apply(trie.put.bind(trie), Buffer.from([11, 11, 11]), "first"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 22, 22]), "create the first branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 34, 44]), "create the last branch")
    ], () => {
      trie.del(Buffer.from([12, 22, 22]), () => {
        trie.get(Buffer.from([12, 22, 22]), (err, val) => {
          expect(null).toBe(val);
          trie = new Trie();
        });
      });
    });
  });

  test("should delete from a branch->branch-extention", () => {
    const trie = new Trie();

    async.parallel([
      async.apply(trie.put.bind(trie), Buffer.from([11, 11, 11]), "first"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 22, 22]), "create the first branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 33, 33]), "create the middle branch"),
      async.apply(trie.put.bind(trie), Buffer.from([12, 33, 44]), "create the last branch")
    ], () => {
      trie.del(Buffer.from([12, 22, 22]), () => {
        trie.get(Buffer.from([12, 22, 22]), (err, val) => {
          expect(null).toBe(val);
        });
      });
    });
  });

  test("should delete from a extention->branch-extention", () => {
    const trie = new Trie();

    trie.put(Buffer.from([11, 11, 11]), "first", () => {
      // create the top branch
      trie.put(Buffer.from([12, 22, 22]), "create the first branch", () => {
        // crete the middle branch
        trie.put(Buffer.from([12, 33, 33]), "create the middle branch", () => {
          trie.put(Buffer.from([12, 33, 44]), "create the last branch", () => {
            // delete the middle branch
            trie.del(Buffer.from([11, 11, 11]), () => {
              trie.get(Buffer.from([11, 11, 11]), (err, val) => {
                expect(null).toBe(val);
              });
            });
          });
        });
      });
    });
  });

  test("should delete from a extention->branch-branch", () => {
    const trie = new Trie();

    trie.put(Buffer.from([11, 11, 11]), "first", () => {
      // create the top branch
      trie.put(Buffer.from([12, 22, 22]), "create the first branch", () => {
        // crete the middle branch
        trie.put(Buffer.from([12, 33, 33]), "create the middle branch", () => {
          trie.put(Buffer.from([12, 34, 44]), "create the last branch", () => {
            // delete the middle branch
            trie.del(Buffer.from([11, 11, 11]), () => {
              trie.get(Buffer.from([11, 11, 11]), (err, val) => {
                expect(null).toBe(val);
              });
            });
          });
        });
      });
    });
  });
});

describe("testing checkpoints", () => {
  let postRoot; let preRoot; let trie;

  test("setup", () => {
    trie = new Trie();
    trie.put("do", "verb", () => {
      trie.put("doge", "coin", () => {
        preRoot = trie.root.toString("hex");
      });
    });
  });

  test("should revert to the orginal root", () => {
    trie.checkpoint();
    trie.put("test", "something", () => {
      trie.put("love", "emotion", () => {
        postRoot = trie.root.toString("hex");
        expect(trie.isCheckpoint).toBe(true);
        trie.revert(() => {
          expect(trie.root.toString("hex")).toBe(preRoot);
          expect(trie.isCheckpoint).toBe(false);
        });
      });
    });
  });

  test("should commit a checkpoint", () => {
    trie.checkpoint();
    trie.put("test", "something", () => {
      trie.put("love", "emotion", () => {
        trie.commit(() => {
          expect(trie.isCheckpoint).toBe(false);
          expect(trie.root.toString("hex")).toBe(postRoot);
        });
      });
    });
  });

  test("should commit a nested checkpoint", () => {
    trie.checkpoint();
    let root;

    trie.put("test", "something else", () => {
      root = trie.root;
      trie.checkpoint();
      trie.put("the feels", "emotion", () => {
        trie.revert();
        trie.commit(() => {
          expect(trie.isCheckpoint).toBe(false);
          expect(trie.root.toString("hex")).toBe(root.toString("hex"));
        });
      });
    });
  });
});

describe("it should create the genesis state root from ethereum", () => {
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

  expect(cppRlp).toBe(rlpAccount.toString("hex"));

  test("shall match the root", () => {
    trie4.put(g, rlpAccount, () => {
      trie4.put(j, rlpAccount, () => {
        trie4.put(v, rlpAccount, () => {
          trie4.put(a, rlpAccount, () => {
            expect(trie4.root.toString("hex")).toBe(genesisStateRoot);
          });
        });
      });
    });
  });
});
