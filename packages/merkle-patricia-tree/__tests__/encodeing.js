const tape = require("tape");
const Trie = require("..");

const trie = new Trie();
const trie2 = new Trie();

const hex = "FF44A3B3";

tape("encoding hexprefixes ", (t) => {
  trie.put(Buffer.from(hex, "hex"), "test", () => {
    trie2.put("0x" + hex, "test", () => {
      t.equal(trie.root.toString("hex"), trie2.root.toString("hex"));
      t.end();
    });
  });
});
