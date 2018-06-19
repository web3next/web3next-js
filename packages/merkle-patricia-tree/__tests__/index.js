/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */
const rlp = require("rlp");
const ethUtil = require("ethereumjs-util");
const Trie = require("../promisifiedCheckpointTrie").default;

describe("simple save and retrive", () => {
  const root = Buffer.from("3f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d", "hex");

  test("should not crash if given a non-existant root", async () => {
    const trie = new Trie(null, root);
    const value = await trie.get("test");
    expect(value).toBe(null);
  });

  test("should get a value", async () => {
    const trie = new Trie();

    await trie.put("test", "one");
    const value = await trie.get("test");
    expect(value.toString()).toBe("one");
  });

  test("should update a value", async () => {
    const trie = new Trie();
    await trie.put("test", "one");
    await trie.put("test", Buffer.from("two"));
    const value = await trie.get("test");
    expect(value.toString()).toBe("two");
  });

  test("should delete a value", async () => {
    const trie = new Trie();
    await trie.put("test", "one");
    await trie.put("test", Buffer.from("two"));
    await trie.del("test");
    const value = await trie.get("test");
    expect(value).toBeFalsy();
  });

  test("should get updated a value", async () => {
    const trie = new Trie();
    await trie.put("test", "one");
    await trie.put("test", Buffer.from("two"));
    await trie.del("test");
    await trie.put(Buffer.from("test"), Buffer.from("one"));
    const value = await trie.get("test");
    expect(value.toString()).toBe("one");
  });

  test("should get a value that is in a branch", async () => {
    const trie = new Trie();
    await trie.put("test", "one");
    await trie.put("test", Buffer.from("two"));
    await trie.del("test");
    await trie.put(Buffer.from("test"), Buffer.from("one"));

    await trie.put(Buffer.from("doge"), Buffer.from("coin"));
    expect("de8a34a8c1d558682eae1528b47523a483dd8685d6db14b291451a66066bf0fc").toBe(trie.root.toString("hex"));
    const value = await trie.get(Buffer.from("doge"));
    expect(value.toString()).toBe("coin");
  });

  test("should delete from a branch", async () => {
    const trie = new Trie();
    await trie.put("test", "one");
    await trie.put("test", Buffer.from("two"));
    await trie.del("test");
    await trie.put(Buffer.from("test"), Buffer.from("one"));
    await trie.put(Buffer.from("doge"), Buffer.from("coin"));
    await trie.del("doge");
    const value = await trie.get("doge");
    expect(value).toBe(null);
  });
});

describe("storing longer values", () => {
  const trie = new Trie();
  const longString = "this will be a really really really long value";
  const longStringRoot = "b173e2db29e79c78963cff5196f8a983fbe0171388972106b114ef7f5c24dfa3";

  test("should store a longer string", async () => {
    await trie.put(Buffer.from("done"), Buffer.from(longString));
    await trie.put(Buffer.from("doge"), Buffer.from("coin"));
    expect(longStringRoot).toBe(trie.root.toString("hex"));
  });

  test("should retreive a longer value", async () => {
    const value = await trie.get(Buffer.from("done"));
    expect(value.toString()).toBe(longString);
  });
});

describe("testing Extentions and branch", () => {
  test("should create extention to store this value", async () => {
    const trie = new Trie();
    await trie.put(Buffer.from("doge"), Buffer.from("coin"));
    await trie.put(Buffer.from("do"), Buffer.from("verb"));
    expect("f803dfcb7e8f1afd45e88eedb4699a7138d6c07b71243d9ae9bff720c99925f9").toBe(trie.root.toString("hex"));
  });

  test("should store this value under the extention ", async () => {
    const trie2 = new Trie();
    await trie2.put(Buffer.from("doge"), Buffer.from("coin"));
    await trie2.put(Buffer.from("do"), Buffer.from("verb"));
    await trie2.put(Buffer.from("done"), Buffer.from("finished"));
    expect("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb").toBe(trie2.root.toString("hex"));
  });
});

describe("testing Extentions and branches - rever", () => {
  const trie3 = new Trie();

  test("should store this value under the extention ", async () => {
    await trie3.put(Buffer.from("do"), Buffer.from("verb"));
    await trie3.put(Buffer.from("doge"), Buffer.from("coin"));
    await trie3.put(Buffer.from("done"), Buffer.from("finished"));
    expect("409cff4d820b394ed3fb1cd4497bdd19ffa68d30ae34157337a7043c94a3e8cb").toBe(trie3.root.toString("hex"));
  });
});

describe("testing deletions cases", () => {
  test("should delete from a branch->branch-branch", async () => {
    const trie = new Trie();
    await Promise.all([
      trie.put(Buffer.from([11, 11, 11]), "first"),
      trie.put(Buffer.from([12, 22, 22]), "create the first branch"),
      trie.put(Buffer.from([12, 34, 44]), "create the last branch")
    ]);
    await trie.del(Buffer.from([12, 22, 22]));
    const val = await trie.get(Buffer.from([12, 22, 22]));
    expect(null).toBe(val);
  });

  test("should delete from a branch->branch-extention", async () => {
    const trie = new Trie();

    await Promise.all([
      trie.put(Buffer.from([11, 11, 11]), "first"),
      trie.put(Buffer.from([12, 22, 22]), "create the first branch"),
      trie.put(Buffer.from([12, 33, 33]), "create the middle branch"),
      trie.put(Buffer.from([12, 33, 44]), "create the last branch")
    ]);

    await trie.del(Buffer.from([12, 22, 22]));
    const val = await trie.get(Buffer.from([12, 22, 22]));
    expect(null).toBe(val);
  });

  test("should delete from a extention->branch-extention", async () => {
    const trie = new Trie();

    await trie.put(Buffer.from([11, 11, 11]), "first");

    // create the top branch
    await trie.put(Buffer.from([12, 22, 22]), "create the first branch");

    // crete the middle branch
    await trie.put(Buffer.from([12, 33, 33]), "create the middle branch");
    await trie.put(Buffer.from([12, 33, 44]), "create the last branch");

    // delete the middle branch
    await trie.del(Buffer.from([11, 11, 11]));
    const val = await trie.get(Buffer.from([11, 11, 11]));
    expect(null).toBe(val);
  });

  test("should delete from a extention->branch-branch", async () => {
    const trie = new Trie();
    await trie.put(Buffer.from([11, 11, 11]), "first");

    // create the top branch
    await trie.put(Buffer.from([12, 22, 22]), "create the first branch");

    // crete the middle branch
    await trie.put(Buffer.from([12, 33, 33]), "create the middle branch");
    await trie.put(Buffer.from([12, 34, 44]), "create the last branch");

    // delete the middle branch
    await trie.del(Buffer.from([11, 11, 11]));
    const val = await trie.get(Buffer.from([11, 11, 11]));
    expect(null).toBe(val);
  });
});

describe("testing checkpoints", () => {
  let postRoot;
  const trie = new Trie();

  test("should revert to the orginal root", async () => {
    await trie.put("do", "verb");
    await trie.put("doge", "coin");
    const preRoot = trie.root.toString("hex");
    trie.checkpoint();
    await trie.put("test", "something");
    await trie.put("love", "emotion");
    postRoot = trie.root.toString("hex");
    expect(trie.isCheckpoint).toBe(true);
    await trie.revert();
    expect(trie.root.toString("hex")).toBe(preRoot);
    expect(trie.isCheckpoint).toBe(false);
  });

  test("should commit a checkpoint", async () => {
    trie.checkpoint();
    await trie.put("test", "something");
    await trie.put("love", "emotion");
    await trie.commit();
    expect(trie.isCheckpoint).toBe(false);
    expect(trie.root.toString("hex")).toBe(postRoot);
  });

  test("should commit a nested checkpoint", async () => {
    trie.checkpoint();
    await trie.put("test", "something else");
    const root = trie.root;
    trie.checkpoint();
    await trie.put("the feels", "emotion");
    await trie.revert();
    await trie.commit();
    expect(trie.isCheckpoint).toBe(false);
    expect(trie.root.toString("hex")).toBe(root.toString("hex"));
  });
});

describe("it should create the genesis state root from ethereum", () => {
  const trie = new Trie();
  const g = Buffer.from("8a40bfaa73256b60764c1bf40675a99083efb075", "hex");
  const j = Buffer.from("e6716f9544a56c530d868e4bfbacb172315bdead", "hex");
  const v = Buffer.from("1e12515ce3e0f817a4ddef9ca55788a1d66bd2df", "hex");
  const a = Buffer.from("1a26338f0d905e295fccb71fa9ea849ffa12aaf4", "hex");
  const stateRoot = Buffer.alloc(32);

  stateRoot.fill(0);
  const startAmount = Buffer.alloc(26);

  startAmount.fill(0);
  startAmount[0] = 1;
  const account = [startAmount, 0, stateRoot, ethUtil.sha3()];
  const rlpAccount = rlp.encode(account);
  // eslint-disable-next-line max-len
  const cppRlp = "f85e9a010000000000000000000000000000000000000000000000000080a00000000000000000000000000000000000000000000000000000000000000000a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

  const genesisStateRoot = "2f4399b08efe68945c1cf90ffe85bbe3ce978959da753f9e649f034015b8817d";

  test("shall match the root", async () => {
    expect(cppRlp).toBe(rlpAccount.toString("hex"));
    await trie.put(g, rlpAccount);
    await trie.put(j, rlpAccount);
    await trie.put(v, rlpAccount);
    await trie.put(a, rlpAccount);
    expect(trie.root.toString("hex")).toBe(genesisStateRoot);
  });
});

