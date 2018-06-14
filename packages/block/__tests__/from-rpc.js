const tape = require("tape");
const blockFromRpc = require("../from-rpc.js");
const blockData = require("./testdata-from-rpc.json");

tape("[fromRPC]: block #2924874", (t) => {
  t.test("should create a block with transactions with valid signatures", (st) => {
    const block = blockFromRpc(blockData);
    const allValid = block.transactions.every((tx) => {
      return tx.verifySignature();
    });

    st.equal(allValid, true, "all transaction signatures are valid");
    st.end();
  });
});
