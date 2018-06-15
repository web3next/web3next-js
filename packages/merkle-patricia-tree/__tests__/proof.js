const async = require("async");
const Trie = require("..");

describe("simple merkle proofs generation and verification", () => {
  test("create a merkle proof and verify it", () => {
    const trie = new Trie();

    async.series([
      function (cb) {
        trie.put("key1aa", "0123456789012345678901234567890123456789xx", cb);
      },
      function (cb) {
        trie.put("key2bb", "aval2", cb);
      },
      function (cb) {
        trie.put("key3cc", "aval3", cb);
      },
      function (cb) {
        Trie.prove(trie, "key2bb", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key2bb", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("aval2");
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key1aa", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key1aa", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("0123456789012345678901234567890123456789xx");
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key2bb", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "randomkey", prove, (err, val) => {
            expect(err).not.toBe(null);
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key2bb", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key2b", prove, (err, val) => {
            expect(err).not.toBe(null);
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key2bb", (err, prove) => {
          if (err) {
            return cb(err);
          }
          prove.push(Buffer.from("123456"));
          Trie.verifyProof(trie.root, "key2b", prove, (err, val) => {
            expect(err).not.toBe(null);
            cb();
          });
        });
      }
    ], (err) => {
    });
  });

  test("create a merkle proof and verify it with a single long key", () => {
    const trie = new Trie();

    async.series([
      function (cb) {
        trie.put("key1aa", "0123456789012345678901234567890123456789xx", cb);
      },
      function (cb) {
        Trie.prove(trie, "key1aa", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key1aa", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("0123456789012345678901234567890123456789xx");
            cb();
          });
        });
      }
    ], (err) => {

    });
  });

  test("create a merkle proof and verify it with a single short key", () => {
    const trie = new Trie();

    async.series([
      function (cb) {
        trie.put("key1aa", "01234", cb);
      },
      function (cb) {
        Trie.prove(trie, "key1aa", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key1aa", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("01234");
            cb();
          });
        });
      }
    ], (err) => {

    });
  });

  test("create a merkle proof and verify it whit keys in the midle", () => {
    const trie = new Trie();

    async.series([
      function (cb) {
        trie.put("key1aa", "0123456789012345678901234567890123456789xxx", cb);
      },
      function (cb) {
        trie.put("key1", "0123456789012345678901234567890123456789Very_Long", cb);
      },
      function (cb) {
        trie.put("key2bb", "aval3", cb);
      },
      function (cb) {
        trie.put("key2", "short", cb);
      },
      function (cb) {
        trie.put("key3cc", "aval3", cb);
      },
      function (cb) {
        trie.put("key3", "1234567890123456789012345678901", cb);
      },
      function (cb) {
        Trie.prove(trie, "key1", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key1", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("0123456789012345678901234567890123456789Very_Long");
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key2", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key2", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("short");
            cb();
          });
        });
      },
      function (cb) {
        Trie.prove(trie, "key3", (err, prove) => {
          if (err) {
            return cb(err);
          }
          Trie.verifyProof(trie.root, "key3", prove, (err, val) => {
            if (err) {
              return cb(err);
            }
            expect(val.toString("utf8")).toBe("1234567890123456789012345678901");
            cb();
          });
        });
      }
    ], (err) => {
    });
  });
});
