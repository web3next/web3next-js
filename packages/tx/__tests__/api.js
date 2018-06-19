const utils = require("ethereumjs-util");

const rlp = utils.rlp;
const Transaction = require("..");
const txFixtures = require("./txs.json");
const txFixturesEip155 = require("./ttTransactionTestEip155VitaliksTests.json");

describe("[Transaction]: Basic functions", () => {
  const transactions = [];

  test("should decode transactions", () => {
    txFixtures.slice(0, 3).forEach((tx) => {
      const pt = new Transaction(tx.raw);

      expect("0x" + pt.nonce.toString("hex")).toBe(tx.raw[0]);
      expect("0x" + pt.gasPrice.toString("hex")).toBe(tx.raw[1]);
      expect("0x" + pt.gasLimit.toString("hex")).toBe(tx.raw[2]);
      expect("0x" + pt.to.toString("hex")).toBe(tx.raw[3]);
      expect("0x" + pt.value.toString("hex")).toBe(tx.raw[4]);
      expect("0x" + pt.v.toString("hex")).toBe(tx.raw[6]);
      expect("0x" + pt.r.toString("hex")).toBe(tx.raw[7]);
      expect("0x" + pt.s.toString("hex")).toBe(tx.raw[8]);
      expect("0x" + pt.data.toString("hex")).toBe(tx.raw[5]);
      transactions.push(pt);
    });
  });

  test("should serialize", () => {
    transactions.forEach((tx) => {
      expect(tx.serialize()).toEqual(rlp.encode(tx.raw));
    });
  });

  test("should hash", () => {
    const tx = new Transaction(txFixtures[2].raw);

    expect(tx.hash()).toEqual(Buffer.from("375a8983c9fc56d7cfd118254a80a8d7403d590a6c9e105532b67aca1efb97aa", "hex"));
    expect(tx.hash(false)).toEqual(Buffer.from("61e1ec33764304dddb55348e7883d4437426f44ab3ef65e6da1e025734c03ff0", "hex"));
    expect(tx.hash(true)).toEqual(Buffer.from("375a8983c9fc56d7cfd118254a80a8d7403d590a6c9e105532b67aca1efb97aa", "hex"));
  });

  test("should hash with defined chainId", () => {
    const tx = new Transaction(txFixtures[3].raw);

    expect(tx.hash().toString("hex")).toBe("0f09dc98ea85b7872f4409131a790b91e7540953992886fc268b7ba5c96820e4");
    expect(tx.hash(true).toString("hex")).toBe("0f09dc98ea85b7872f4409131a790b91e7540953992886fc268b7ba5c96820e4");
    expect(tx.hash(false).toString("hex")).toBe("f97c73fdca079da7652dbc61a46cd5aeef804008e057be3e712c43eac389aaf0");
  });

  test("should verify Signatures", () => {
    transactions.forEach((tx) => {
      expect(tx.verifySignature()).toBe(true);
    });
  });

  test("should not verify Signatures", () => {
    transactions.forEach((tx) => {
      tx.s = utils.zeros(32);
      expect(tx.verifySignature()).toBe(false);
    });
  });

  test("should give a string about not verifing Signatures", () => {
    transactions.forEach((tx) => {
      expect(tx.validate(true).slice(0, 54)).toBe("Invalid Signature gas limit is too low. Need at least ");
    });
  });

  test("should validate", () => {
    transactions.forEach((tx) => {
      expect(tx.validate()).toBe(false);
    });
  });

  test("should sign tx", () => {
    transactions.forEach((tx, i) => {
      if (txFixtures[i].privateKey) {
        const privKey = Buffer.from(txFixtures[i].privateKey, "hex");

        tx.sign(privKey);
      }
    });
  });

  test("should get sender's address after signing it", () => {
    transactions.forEach((tx, i) => {
      if (txFixtures[i].privateKey) {
        expect(tx.getSenderAddress().toString("hex")).toBe(txFixtures[i].sendersAddress);
      }
    });
  });

  test("should get sender's public key after signing it", () => {
    transactions.forEach((tx, i) => {
      if (txFixtures[i].privateKey) {
        expect(tx.getSenderPublicKey().toString("hex"))
          .toBe(utils.privateToPublic(Buffer.from(txFixtures[i].privateKey, "hex")).toString("hex"));
      }
    });
  });

  test("should get sender's address after signing it (second call should be cached)", () => {
    transactions.forEach((tx, i) => {
      if (txFixtures[i].privateKey) {
        expect(tx.getSenderAddress().toString("hex")).toBe(txFixtures[i].sendersAddress);
        expect(tx.getSenderAddress().toString("hex")).toBe(txFixtures[i].sendersAddress);
      }
    });
  });

  test("should verify signing it", () => {
    transactions.forEach((tx, i) => {
      if (txFixtures[i].privateKey) {
        expect(tx.verifySignature()).toBe(true);
      }
    });
  });

  test("should validate with string option", () => {
    transactions.forEach((tx) => {
      tx.gasLimit = 30000;
      expect(tx.validate(true)).toBe("");
    });
  });

  test("should round trip decode a tx", () => {
    const tx = new Transaction();

    tx.value = 5000;
    const s1 = tx.serialize().toString("hex");
    const tx2 = new Transaction(s1);
    const s2 = tx2.serialize().toString("hex");

    expect(s1).toBe(s2);
  });

  test("should accept lesser r values", () => {
    const tx = new Transaction();

    tx.r = "0x0005";
    expect(tx.r.toString("hex")).toBe("05");
  });

  test("should return data fee", () => {
    let tx = new Transaction();

    expect(tx.getDataFee().toNumber()).toBe(0);

    tx = new Transaction(txFixtures[2].raw);
    expect(tx.getDataFee().toNumber()).toBe(2496);
  });

  test("should return base fee", () => {
    const tx = new Transaction();

    expect(tx.getBaseFee().toNumber()).toBe(53000);
  });

  test("should return upfront cost", () => {
    const tx = new Transaction({
      gasPrice: 1000,
      gasLimit: 10000000,
      value: 42
    });

    expect(tx.getUpfrontCost().toNumber()).toBe(10000000042);
  });

  test("Verify EIP155 Signature based on Vitalik's tests", () => {
    txFixturesEip155.forEach((tx) => {
      const pt = new Transaction(tx.rlp);

      expect(pt.hash(false).toString("hex")).toBe(tx.hash);
      expect("0x" + pt.serialize().toString("hex")).toBe(tx.rlp);
      expect(pt.getSenderAddress().toString("hex")).toBe(tx.sender);
    });
  });

  test("sign tx with chainId specified in params", () => {
    const tx = new Transaction({chainId: 42});

    expect(tx.getChainId()).toBe(42);
    const privKey = Buffer.from(txFixtures[0].privateKey, "hex");

    tx.sign(privKey);
    const serialized = tx.serialize();
    const reTx = new Transaction(serialized);

    expect(reTx.verifySignature()).toBe(true);
    expect(reTx.getChainId()).toBe(42);
  });

  test("allow chainId more than 1 byte", () => {
    const tx = new Transaction({chainId: 0x16B2});

    expect(tx.getChainId()).toBe(0x16B2);
  });
});
