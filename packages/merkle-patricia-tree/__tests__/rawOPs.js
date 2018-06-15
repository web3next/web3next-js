const crypto = require("crypto");
const Trie = require("..");

describe("put & get raw functions", () => {
  const trie = new Trie();
  const key = crypto.randomBytes(32);
  const val = crypto.randomBytes(32);

  test("getRaw", () => {
    trie.putRaw(key, val, () => {
      trie.getRaw(key, (err, rVal) => {
        expect(val.toString("hex")).toEqual(rVal.toString("hex"));
      });
    });
  });

  test("should checkpoint and get the rawVal", () => {
    trie.checkpoint();
    trie.getRaw(key, (err, rVal) => {
      expect(val.toString("hex")).toEqual(rVal.toString("hex"));
    });
  });

  const key2 = crypto.randomBytes(32);
  const val2 = crypto.randomBytes(32);

  test("should retrieve from a checkpoint", () => {
    trie.putRaw(key2, val2, () => {
      trie.getRaw(key2, (err, rVal) => {
        expect(val2.toString("hex")).toEqual(rVal.toString("hex"));
      });
    });
  });

  test("should not get val after delete ", () => {
    trie.revert(() => {
      trie.delRaw(val2, () => {
        trie.getRaw(val2, (err, deletedVal) => {
          expect(deletedVal).not.toBeTruthy();
        });
      });
    });
  });

  const key3 = crypto.randomBytes(32);
  const val3 = crypto.randomBytes(32);

  test("test commit behavoir", () => {
    trie.checkpoint();
    trie.putRaw(key3, val3, () => {
      trie.commit(() => {
        trie.getRaw(key3, (err, committedVal) => {
          expect(committedVal.toString("hex")).toEqual(val3.toString("hex"));
        });
      });
    });
  });
});
