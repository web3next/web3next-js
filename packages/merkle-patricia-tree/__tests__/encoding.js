const Trie = require("..");

const trie = new Trie();
const trie2 = new Trie();
const hex = "FF44A3B3";

test("encoding hexprefixes ", () => {
  trie.put(Buffer.from(hex, "hex"), "test", () => {
    trie2.put("0x" + hex, "test", () => {
      expect(trie.root.toString("hex")).toBe(trie2.root.toString("hex"));
    });
  });
});
