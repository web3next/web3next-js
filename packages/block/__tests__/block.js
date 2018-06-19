const Common = require("ethereumjs-common");
const testing = require("ethereumjs-testing");
const rlp = require("ethereumjs-util").rlp;
const Block = require("..");
const testData = require("./testdata.json");
const testData2 = require("./testdata2.json");

describe("[Block]: block functions", () => {
  test("should test block initialization", () => {
    const block1 = new Block(null, {chain: "ropsten"});
    const common = new Common("ropsten");
    const block2 = new Block(null, {common});

    block1.setGenesisParams();
    block2.setGenesisParams();

    //  block hashes match
    expect(block1.hash().toString("hex")).toStrictEqual(block2.hash().toString("hex"));

    // should throw on initialization with chain and common parameter
    expect(() => {
      new Block(null, {chain: "ropsten",
        common});
    }).toThrow();
  });

  const testTransactionValidation = (block) => {
    expect(block.validateTransactions()).toBe(true);

    block.genTxTrie(() => {
      expect(block.validateTransactionsTrie()).toBe(true);
    });
  };

  test("should test transaction validation", () => {
    const block = new Block(rlp.decode(testData.blocks[0].rlp));

    testTransactionValidation(block);
  });

  test("should test transaction validation with empty transaction list", () => {
    const block = new Block();

    testTransactionValidation(block);
  });

  test("should test uncles hash validation", () => {
    const block = new Block(rlp.decode(testData2.blocks[2].rlp));

    expect(block.validateUnclesHash()).toBe(true);
  });

  test("should test isGenesis (mainnet default)", () => {
    const block = new Block();

    expect(block.isGenesis()).not.toBe(true);
    block.header.number = Buffer.from([]);
    expect(block.isGenesis()).toBe(true);
  });

  test("should test isGenesis (ropsten)", () => {
    const block = new Block(null, {chain: "ropsten"});

    expect(block.isGenesis()).not.toBe(true);
    block.header.number = Buffer.from([]);
    expect(block.isGenesis()).toBe(true);
  });

  const testDataGenesis = testing.getSingleFile("BasicTests/genesishashestest.json");

  test("should test genesis hashes (mainnet default)", () => {
    const genesisBlock = new Block();

    genesisBlock.setGenesisParams();
    const rlp = genesisBlock.serialize();

    // rlp hex match
    expect(rlp.toString("hex")).toStrictEqual(testDataGenesis.genesis_rlp_hex);

    // genesis hash match
    expect(genesisBlock.hash().toString("hex")).toStrictEqual(testDataGenesis.genesis_hash);
  });

  test("should test genesis parameters (ropsten)", () => {
    const genesisBlock = new Block(null, {chain: "ropsten"});

    genesisBlock.setGenesisParams();
    const ropstenStateRoot = "217b0bbcfb72e2d57e28f33cb361b9983513177755dc3f33ce3e7022ed62b77b";

    // genesis stateRoot match
    expect(genesisBlock.header.stateRoot.toString("hex")).toStrictEqual(ropstenStateRoot);
  });

  test("should test toJSON", () => {
    const block = new Block(rlp.decode(testData2.blocks[2].rlp));

    expect(typeof block.toJSON()).toBe("object");
    expect(typeof block.toJSON(true)).toBe("object");
  });
});

