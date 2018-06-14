const crypto = require("crypto");
const tape = require("tape");
const Trie = require("..");

tape("put & get raw functions", (it) => {
  const trie = new Trie();
  const key = crypto.randomBytes(32);
  const val = crypto.randomBytes(32);

  it.test("putRaw", (t) => {
    trie.putRaw(key, val, t.end);
  });

  it.test("getRaw", (t) => {
    trie.getRaw(key, (err, rVal) => {
      t.equal(val.toString("hex"), rVal.toString("hex"));
      t.end(err);
    });
  });

  it.test("should checkpoint and get the rawVal", (t) => {
    trie.checkpoint();
    trie.getRaw(key, (err, rVal) => {
      t.equal(val.toString("hex"), rVal.toString("hex"));
      t.end(err);
    });
  });

  const key2 = crypto.randomBytes(32);
  const val2 = crypto.randomBytes(32);

  it.test("should store while in a checkpoint", (t) => {
    trie.putRaw(key2, val2, t.end);
  });

  it.test("should retrieve from a checkpoint", (t) => {
    trie.getRaw(key2, (err, rVal) => {
      t.equal(val2.toString("hex"), rVal.toString("hex"));
      t.end(err);
    });
  });

  it.test("should not retiev after revert", (t) => {
    trie.revert(t.end);
  });

  it.test("should delete raw", (t) => {
    trie.delRaw(val2, t.end);
  });

  it.test("should not get val after delete ", (t) => {
    trie.getRaw(val2, (err, val) => {
      t.notok(val);
      t.end(err);
    });
  });

  const key3 = crypto.randomBytes(32);
  const val3 = crypto.randomBytes(32);

  it.test("test commit behavoir", (t) => {
    trie.checkpoint();
    trie.putRaw(key3, val3, () => {
      trie.commit(() => {
        trie.getRaw(key3, (err, val) => {
          t.equal(val.toString("hex"), val3.toString("hex"));
          t.end(err);
        });
      });
    });
  });
});
