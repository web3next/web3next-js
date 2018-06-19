/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */
const Trie = require("../promisifiedCheckpointTrie").default;

describe("simple merkle proofs generation and verification", () => {
  test("create a merkle proof and verify it", async () => {
    const trie = new Trie();

    await trie.put("key1aa", "0123456789012345678901234567890123456789xx");
    await trie.put("key2bb", "aval2");
    await trie.put("key3cc", "aval3");
    await trie.put("key3cc", "aval3");

    const prove = await Trie.prove(trie, "key2bb");
    const val = await Trie.verifyProof(trie.root, "key2bb", prove);
    expect(val.toString("utf8")).toBe("aval2");

    const prove2 = await Trie.prove(trie, "key1aa");
    const val2 = await Trie.verifyProof(trie.root, "key1aa", prove2);
    expect(val2.toString("utf8")).toBe("0123456789012345678901234567890123456789xx");

    const prove3 = await Trie.prove(trie, "key2bb");
    expect(Trie.verifyProof(trie.root, "randomkey", prove3)).rejects.toBeTruthy();

    const prove4 = await Trie.prove(trie, "key2bb");
    expect(Trie.verifyProof(trie.root, "key2b", prove4)).rejects.toBeTruthy();

    const prove5 = await Trie.prove(trie, "key2bb");
    prove5.push(Buffer.from("123456"));
    expect(Trie.verifyProof(trie.root, "key2b", prove5)).rejects.not.toBe(null);
  });

  test("create a merkle proof and verify it with a single long key", async () => {
    const trie = new Trie();
    await trie.put("key1aa", "0123456789012345678901234567890123456789xx");
    const prove = await Trie.prove(trie, "key1aa");
    const val = await Trie.verifyProof(trie.root, "key1aa", prove);
    expect(val.toString("utf8")).toBe("0123456789012345678901234567890123456789xx");
  });

  test("create a merkle proof and verify it with a single short key", async () => {
    const trie = new Trie();
    await trie.put("key1aa", "01234");
    const prove = await Trie.prove(trie, "key1aa");
    const val = await Trie.verifyProof(trie.root, "key1aa", prove);
    expect(val.toString("utf8")).toBe("01234");
  });

  test("create a merkle proof and verify it whit keys in the midle", async () => {
    const trie = new Trie();
    await trie.put("key1aa", "0123456789012345678901234567890123456789xxx");
    await trie.put("key1", "0123456789012345678901234567890123456789Very_Long");
    await trie.put("key2bb", "aval3");
    await trie.put("key2", "short");
    await trie.put("key3cc", "aval3");
    await trie.put("key3", "1234567890123456789012345678901");

    const prove = await Trie.prove(trie, "key1");
    const val = await Trie.verifyProof(trie.root, "key1", prove);
    expect(val.toString("utf8")).toBe("0123456789012345678901234567890123456789Very_Long");

    const prove2 = await Trie.prove(trie, "key2");
    const val2 = await Trie.verifyProof(trie.root, "key2", prove2);
    expect(val2.toString("utf8")).toBe("short");

    const prove3 = await Trie.prove(trie, "key3");
    const val3 = await Trie.verifyProof(trie.root, "key3", prove3);

    expect(val3.toString("utf8")).toBe("1234567890123456789012345678901");
  });
});
