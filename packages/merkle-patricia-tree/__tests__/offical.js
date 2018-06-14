const async = require("async");
const tape = require("tape");
const jsonTests = require("ethereumjs-testing").tests.trieTests;
const Trie = require("..");

tape("offical tests", (t) => {
  let trie = new Trie();
  const testNames = Object.keys(jsonTests.trietest);

  async.eachSeries(testNames, (i, done) => {
    const inputs = jsonTests.trietest[i].in;
    const expect = jsonTests.trietest[i].root;

    async.eachSeries(inputs, (input, done) => {
      for (i = 0; i < 2; i++) {
        if (input[i] && input[i].slice(0, 2) === "0x") {
          input[i] = Buffer.from(input[i].slice(2), "hex");
        }
      }

      trie.put(Buffer.from(input[0]), input[1], () => {
        done();
      });
    }, () => {
      t.equal("0x" + trie.root.toString("hex"), expect);
      trie = new Trie();
      done();
    });
  }, t.end);
});

tape("offical tests any order", (t) => {
  const testNames = Object.keys(jsonTests.trieanyorder);
  let trie = new Trie();

  async.eachSeries(testNames, (i, done) => {
    const test = jsonTests.trieanyorder[i];
    const keys = Object.keys(test.in);

    async.eachSeries(keys, (key, done) => {
      let val = test.in[key];

      if (key.slice(0, 2) === "0x") {
        key = Buffer.from(key.slice(2), "hex");
      }

      if (val && val.slice(0, 2) === "0x") {
        val = Buffer.from(val.slice(2), "hex");
      }

      trie.put(Buffer.from(key), Buffer.from(val), () => {
        done();
      });
    }, () => {
      t.equal("0x" + trie.root.toString("hex"), test.root);
      trie = new Trie();
      done();
    });
  }, t.end);
});
