const Account = require("..");

describe("empty constructor", () => {
  const it = tester.test;

  test("should work", (t) => {
    const account = new Account();

    t.equal(account.nonce.toString("hex"), "");
    t.equal(account.balance.toString("hex"), "");
    t.equal(account.stateRoot.toString("hex"), "56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    t.equal(account.codeHash.toString("hex"), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
    t.end();
  });
});

describe("constructor with Array", () => {
  const it = tester.test;

  test("should work", (t) => {
    const raw = [
      "0x02", // nonce
      "0x0384", // balance
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421", // stateRoot
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470" // codeHash
    ];
    const account = new Account(raw);

    t.equal(account.nonce.toString("hex"), "02");
    t.equal(account.balance.toString("hex"), "0384");
    t.equal(account.stateRoot.toString("hex"), "56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    t.equal(account.codeHash.toString("hex"), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
    t.end();
  });
});

describe("constructor with Object", () => {
  const it = tester.test;

  test("should work", (t) => {
    const raw = {
      nonce: "0x02",
      balance: "0x0384",
      stateRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      codeHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    };
    const account = new Account(raw);

    t.equal(account.nonce.toString("hex"), "02");
    t.equal(account.balance.toString("hex"), "0384");
    t.equal(account.stateRoot.toString("hex"), "56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    t.equal(account.codeHash.toString("hex"), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
    t.end();
  });
});

describe("constructor with RLP", () => {
  const it = tester.test;

  test("should work", (t) => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    t.equal(account.nonce.toString("hex"), "02");
    t.equal(account.balance.toString("hex"), "0384");
    t.equal(account.stateRoot.toString("hex"), "56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    t.equal(account.codeHash.toString("hex"), "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
    t.end();
  });
});

describe("serialize", () => {
  const it = tester.test;

  test("should work", (t) => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    t.equal(account.serialize().toString("hex"), "f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
    t.end();
  });
});

describe("isContract", () => {
  const it = tester.test;

  test("should return false", (t) => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    t.equal(account.isContract(), false);
    t.end();
  });
  test("should return true", (t) => {
    const raw = {
      nonce: "0x01",
      balance: "0x0042",
      stateRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      codeHash: "0xc5d2461236f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    };
    const account = new Account(raw);

    t.equal(account.isContract(), true);
    t.end();
  });
});
