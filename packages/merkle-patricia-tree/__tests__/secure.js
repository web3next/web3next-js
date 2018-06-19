/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */

const jsonTests = require("ethereumjs-testing").tests.trieTests.trietest_secureTrie;
const Trie = require("../secure.js").default;

const convert = (v) => {
  if (v && v.startsWith("0x")) {
    return Buffer.from(v.slice(2), "hex");
  } else {
    return v;
  }
};
describe("secure tests", () => {
  const testNames = Object.keys(jsonTests);

  testNames.forEach((name) => {
    test(name, async () => {
      const inputs = jsonTests[name].in;
      const expected = jsonTests[name].root;
      const trie = new Trie();
      const ps = inputs.map(([key, value]) => {
        return trie.put(convert(key), convert(value));
      });
      await Promise.all(ps);
      expect("0x" + trie.root.toString("hex")).toBe(expected);
    });
  });
});
