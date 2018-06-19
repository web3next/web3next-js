/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */

const jsonTests = require("ethereumjs-testing").tests.trieTests;
const Trie = require("../promisifiedCheckpointTrie").default;

const convert = (v) => {
  if (v && v.startsWith("0x")) {
    return Buffer.from(v.slice(2), "hex");
  } else {
    return v;
  }
};

describe("official tests", () => {
  const testNames = Object.keys(jsonTests.trietest);

  testNames.forEach((name) => {
    test(name, async () => {
      const inputs = jsonTests.trietest[name].in;
      const expected = jsonTests.trietest[name].root;
      const trie = new Trie();
      const ps = inputs.map(([key, value]) => {
        return trie.put(convert(key), convert(value));
      });
      await Promise.all(ps);
      expect("0x" + trie.root.toString("hex")).toBe(expected);
    });
  });
});

describe("official tests any order", () => {
  const testNames = Object.keys(jsonTests.trieanyorder);

  testNames.forEach((name) => {
    test(name, async () => {
      const inputs = jsonTests.trieanyorder[name].in;
      const expected = jsonTests.trieanyorder[name].root;
      const trie = new Trie();
      const ps = Object.keys(inputs).map((key) => {
        const value = inputs[key];

        return trie.put(convert(key), convert(value));
      });
      await Promise.all(ps);
      expect("0x" + trie.root.toString("hex")).toBe(expected);
    });
  });
});
