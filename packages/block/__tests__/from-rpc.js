const blockFromRpc = require("../from-rpc.js");
const blockData = require("./testdata-from-rpc.json");

describe("[fromRPC]: block #2924874", () => {
  test("should create a block with transactions with valid signatures", () => {
    const block = blockFromRpc(blockData);
    const allValid = block.transactions.every((tx) => {
      return tx.verifySignature();
    });

    // all transaction signatures are valid
    expect(allValid).toBe(true);
  });
});
