const Common = require("ethereumjs-common");
const utils = require("ethereumjs-util");

const rlp = utils.rlp;
const testing = require("ethereumjs-testing");
const Header = require("../header.js");
const Block = require("..");

describe("[Block]: Header functions", () => {
  test("should create with default constructor", () => {
    const compareDefaultHeader = (header) => {
      expect(header.parentHash).toEqual(utils.zeros(32));
      expect(header.uncleHash.toString("hex")).toBe(utils.SHA3_RLP_ARRAY_S);
      expect(header.coinbase).toEqual(utils.zeros(20));
      expect(header.stateRoot).toEqual(utils.zeros(32));
      expect(header.transactionsTrie.toString("hex")).toBe(utils.SHA3_RLP_S);
      expect(header.receiptTrie.toString("hex")).toBe(utils.SHA3_RLP_S);
      expect(header.bloom).toEqual(utils.zeros(256));
      expect(header.difficulty).toEqual(Buffer.from([]));
      expect(header.number).toEqual(utils.intToBuffer(1150000));
      expect(header.gasLimit).toEqual(Buffer.from("ffffffffffffff", "hex"));
      expect(header.gasUsed).toEqual(Buffer.from([]));
      expect(header.timestamp).toEqual(Buffer.from([]));
      expect(header.extraData).toEqual(Buffer.from([]));
      expect(header.mixHash).toEqual(utils.zeros(32));
      expect(header.nonce).toEqual(utils.zeros(8));
    };

    let header = new Header();

    compareDefaultHeader(header);

    const block = new Block();

    header = block.header;
    compareDefaultHeader(header);
  });

  test("should test header initialization", () => {
    const header1 = new Header(null, {chain: "ropsten"});
    const common = new Common("ropsten");
    const header2 = new Header(null, {common});

    header1.setGenesisParams();
    header2.setGenesisParams();

    // header hashes match
    expect(header1.hash().toString("hex")).toBe(header2.hash().toString("hex"));

    // should throw on initialization with chain and common parameter
    expect(() => {
      new Header(null, {chain: "ropsten",
        common});
    }).toThrow();
  });

  test("should test validateGasLimit", () => {
    const testData = testing.getSingleFile("BlockchainTests/bcBlockGasLimitTest.json");

    const parentBlock = new Block(rlp.decode(testData.BlockGasLimit2p63m1.genesisRLP));
    const block = new Block(rlp.decode(testData.BlockGasLimit2p63m1.blocks[0].rlp));

    expect(block.header.validateGasLimit(parentBlock)).toBe(true);
  });

  test("should test isGenesis", () => {
    const header = new Header();

    expect(header.isGenesis()).toBe(false);
    header.number = Buffer.from([]);
    expect(header.isGenesis()).toBe(true);
  });

  const testDataGenesis = testing.getSingleFile("BasicTests/genesishashestest.json");

  test("should test genesis hashes (mainnet default)", () => {
    const header = new Header();

    header.setGenesisParams();

    // genesis hash match
    expect(header.hash().toString("hex")).toBe(testDataGenesis.genesis_hash);
  });

  test("should test genesis parameters (ropsten)", () => {
    const genesisHeader = new Header(null, {chain: "ropsten"});

    genesisHeader.setGenesisParams();
    const ropstenStateRoot = "217b0bbcfb72e2d57e28f33cb361b9983513177755dc3f33ce3e7022ed62b77b";

    // genesis stateRoot match
    expect(genesisHeader.stateRoot.toString("hex")).toBe(ropstenStateRoot);
  });
});
