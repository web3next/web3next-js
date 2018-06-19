const ethUtil = require("ethereumjs-util");
const argv = require("minimist")(process.argv.slice(2));
const testing = require("ethereumjs-testing");
const common = require("ethereum-common/params.json");
const Tx = require("..");

const txTests = testing.getTests("transaction", argv);

const bufferToHex = ethUtil.bufferToHex;
const addHexPrefix = ethUtil.addHexPrefix;
const stripHexPrefix = ethUtil.stripHexPrefix;
const setLength = ethUtil.setLength;

function addPad (v) {
  if (v.length % 2 === 1) {
    v = "0" + v;
  }

  return v;
}

function normalizeZero (v) {
  if (!v || v === "0x") {
    return "0x00";
  } else {
    return v;
  }
}

/* TODO: we should rewrite ethereumjs-testing since this depends on tape
testing.runTests((testData, sst, cb) => {
  const tTx = testData.transaction;

  try {
    const rawTx = ethUtil.toBuffer(testData.rlp);
    var tx = new Tx(rawTx);

    if (testData.blocknumber !== String(common.homeSteadForkNumber.v)) {
      tx._homestead = false;
    }
  } catch (e) {
    sst.equal(undefined, tTx, "should not have any fields ");
    cb();

    return;
  }

  if (tTx && tx.validate()) {
    try {
      sst.equal(bufferToHex(tx.data), addHexPrefix(addPad(stripHexPrefix(tTx.data))), "data");
      sst.equal(normalizeZero(bufferToHex(tx.gasLimit)), tTx.gasLimit, "gasLimit");
      sst.equal(normalizeZero(bufferToHex(tx.gasPrice)), tTx.gasPrice, "gasPrice");
      sst.equal(normalizeZero(bufferToHex(tx.nonce)), tTx.nonce, "nonce");
      sst.equal(normalizeZero(bufferToHex(setLength(tx.r, 32))), normalizeZero(bufferToHex(setLength(tTx.r, 32))), "r");
      sst.equal(normalizeZero(bufferToHex(tx.s)), normalizeZero(bufferToHex(tTx.s)), "s");
      sst.equal(normalizeZero(bufferToHex(tx.v)), normalizeZero(bufferToHex(tTx.v)), "v");
      sst.equal(bufferToHex(tx.to), addHexPrefix(tTx.to), "to");
      sst.equal(normalizeZero(bufferToHex(tx.value)), tTx.value, "value");
      sst.equal(normalizeZero(bufferToHex(tx.getSenderAddress())), addHexPrefix(testData.sender), "sender's address");
    } catch (e) {
      sst.fail(e);
    }
  } else {
    sst.equal(undefined, tTx, "no tx params in test");
  }
  cb();
}, txTests, tape);
*/
