/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous */

const Account = require("..");

describe("empty constructor", () => {
  test("should work", () => {
    const account = new Account();

    expect(account.nonce.toString("hex")).toBe("");
    expect(account.balance.toString("hex")).toBe("");
    expect(account.stateRoot.toString("hex")).toBe("56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    expect(account.codeHash.toString("hex")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  });
});

describe("constructor with Array", () => {
  test("should work", () => {
    const raw = [
      // nonce
      "0x02",

      // balance
      "0x0384",

      // stateRoot
      "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",

      // codeHash
      "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    ];
    const account = new Account(raw);

    expect(account.nonce.toString("hex")).toBe("02");
    expect(account.balance.toString("hex")).toBe("0384");
    expect(account.stateRoot.toString("hex")).toBe("56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    expect(account.codeHash.toString("hex")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  });
});

describe("constructor with Object", () => {
  test("should work", () => {
    const raw = {
      nonce: "0x02",
      balance: "0x0384",
      stateRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      codeHash: "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    };
    const account = new Account(raw);

    expect(account.nonce.toString("hex")).toBe("02");
    expect(account.balance.toString("hex")).toBe("0384");
    expect(account.stateRoot.toString("hex")).toBe("56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    expect(account.codeHash.toString("hex")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  });
});

describe("constructor with RLP", () => {
  test("should work", () => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    expect(account.nonce.toString("hex")).toBe("02");
    expect(account.balance.toString("hex")).toBe("0384");
    expect(account.stateRoot.toString("hex")).toBe("56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421");
    expect(account.codeHash.toString("hex")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  });
});

describe("serialize", () => {
  test("should work", () => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    expect(account.serialize().toString("hex")).toBe("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  });
});

describe("isContract", () => {
  test("should return false", () => {
    const account = new Account("f84602820384a056e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421a0c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");

    expect(account.isContract()).toBeFalsy();
  });
  test("should return true", () => {
    const raw = {
      nonce: "0x01",
      balance: "0x0042",
      stateRoot: "0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421",
      codeHash: "0xc5d2461236f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470"
    };
    const account = new Account(raw);

    expect(account.isContract()).toBeTruthy();
  });
});
