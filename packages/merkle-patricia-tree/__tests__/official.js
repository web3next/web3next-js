const async = require("async");
const jsonTests = require("ethereumjs-testing").tests.trieTests;
const Trie = require("..");

test("official tests", () => {
  let trie = new Trie();
  const testNames = Object.keys(jsonTests.trietest);

  async.eachSeries(testNames, (i, done) => {
    const inputs = jsonTests.trietest[i].in;
    const expected = jsonTests.trietest[i].root;

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
      expect("0x" + trie.root.toString("hex")).toBe(expected);
      trie = new Trie();
      done();
    });
  });
});

test("official tests any order", () => {
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
      expect("0x" + trie.root.toString("hex")).toBe(test.root);
      trie = new Trie();
      done();
    });
  });
});
