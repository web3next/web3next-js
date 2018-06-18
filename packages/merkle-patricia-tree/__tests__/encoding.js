/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */
const Trie = require("../promisifiedCheckpointTrie").default;

const trie = new Trie();
const trie2 = new Trie();
const hex = "FF44A3B3";

test("encoding hexprefixes ", async () => {
  await trie.put(Buffer.from(hex, "hex"), "test");
  await trie2.put("0x" + hex, "test");
  expect(trie.root.toString("hex")).toBe(trie2.root.toString("hex"));
});
