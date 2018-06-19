/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */

const crypto = require("crypto");
const Trie = require("../promisifiedCheckpointTrie").default;

describe("put & get raw functions", () => {
  const trie = new Trie();
  const key = crypto.randomBytes(32);
  const val = crypto.randomBytes(32);

  test("getRaw", async () => {
    await trie.putRaw(key, val);
    const rVal = await trie.getRaw(key);

    expect(val.toString("hex")).toBe(rVal.toString("hex"));
  });

  test("should checkpoint and get the rawVal", async () => {
    trie.checkpoint();
    const rVal = await trie.getRaw(key);

    expect(val.toString("hex")).toBe(rVal.toString("hex"));
  });

  const key2 = crypto.randomBytes(32);
  const val2 = crypto.randomBytes(32);

  test("should retrieve from a checkpoint", async () => {
    await trie.putRaw(key2, val2);
    const rVal = await trie.getRaw(key2);

    expect(val2.toString("hex")).toBe(rVal.toString("hex"));
  });

  test("should not get val after delete ", async () => {
    await trie.revert();
    await trie.delRaw(val2);
    const deletedVal = await trie.getRaw(val2);

    expect(deletedVal).not.toBeTruthy();
  });

  const key3 = crypto.randomBytes(32);
  const val3 = crypto.randomBytes(32);

  test("test commit behavoir", async () => {
    trie.checkpoint();
    await trie.putRaw(key3, val3);
    await trie.commit();
    const committedVal = await trie.getRaw(key3);

    expect(committedVal.toString("hex")).toBe(val3.toString("hex"));
  });
});
