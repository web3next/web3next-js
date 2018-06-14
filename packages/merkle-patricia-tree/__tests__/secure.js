const async = require("async");
const tape = require("tape");
const jsonTests = require("ethereumjs-testing").tests.trieTests.trietest_secureTrie;
const Trie = require("../secure.js");

let trie = new Trie();

tape("secure tests", (it) => {
  it.test("empty values", (t) => {
    async.eachSeries(jsonTests.emptyValues.in, (row, cb) => {
      trie.put(Buffer.from(row[0]), row[1], cb);
    }, (err) => {
      t.equal("0x" + trie.root.toString("hex"), jsonTests.emptyValues.root);
      t.end(err);
    });
  });

  it.test("branchingTests", (t) => {
    trie = new Trie();
    async.eachSeries(jsonTests.branchingTests.in, (row, cb) => {
      trie.put(row[0], row[1], cb);
    }, () => {
      t.equal("0x" + trie.root.toString("hex"), jsonTests.branchingTests.root);
      t.end();
    });
  });

  it.test("jeff", (t) => {
    async.eachSeries(jsonTests.jeff.in, (row, cb) => {
      let val = row[1];

      if (val) {
        val = Buffer.from(row[1].slice(2), "hex");
      }

      trie.put(Buffer.from(row[0].slice(2), "hex"), val, cb);
    }, () => {
      t.equal("0x" + trie.root.toString("hex"), jsonTests.jeff.root);
      t.end();
    });
  });
});
