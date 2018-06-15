// const testing = require('ethereumjs-testing')
const utils = require("ethereumjs-util");
const Block = require("..");

const hardforkTestData = {
  chainstart: require("./difficultyFrontier.json"),
  homestead: require("./difficultyHomestead.json"),
  byzantium: require("./difficultyByzantium.json")
};
const BN = utils.BN;

function normalize (data) {
  Object.keys(data).map((i) => {
    if (i !== "homestead" && typeof data[i] === "string") {
      data[i] = utils.isHexPrefixed(data[i]) ? new BN(utils.toBuffer(data[i])) : new BN(data[i]);
    }
  });
}

describe("[Header]: difficulty tests", () => {
  test("hard fork", () => {
    for (const hardfork in hardforkTestData) {
      const testData = hardforkTestData[hardfork];

      for (const testName in testData) {
        const test = testData[testName];
        const parentBlock = new Block(null, {
          chain: "mainnet",
          hardfork
        });

        parentBlock.header.timestamp = test.parentTimestamp;
        parentBlock.header.difficulty = test.parentDifficulty;
        parentBlock.header.uncleHash = test.parentUncles;

        const block = new Block(null, {
          chain: "mainnet",
          hardfork
        });

        block.header.timestamp = test.currentTimestamp;
        block.header.difficulty = test.currentDifficulty;
        block.header.number = test.currentBlockNumber;

        normalize(test);

        const dif = block.header.canonicalDifficulty(parentBlock);

        // canonicalDifficulty fork determination by hardfork param

        expect(dif.toString()).toBe(test.currentDifficulty.toString());

        // validateDifficulty fork determination by hardfork param
        expect(block.header.validateDifficulty(parentBlock)).toBe(true);
      }
    }
  });

  test("chain", () => {
    const chainTestData = {
      mainnet: require("./difficultyMainNetwork.json"),
      ropsten: require("./difficultyRopsten.json")
    };

    for (const chain in chainTestData) {
      const testData = chainTestData[chain];

      for (const testName in testData) {
        const test = testData[testName];
        const parentBlock = new Block(null, {chain});

        parentBlock.header.timestamp = test.parentTimestamp;
        parentBlock.header.difficulty = test.parentDifficulty;
        parentBlock.header.uncleHash = test.parentUncles;

        const block = new Block(null, {chain});

        block.header.timestamp = test.currentTimestamp;
        block.header.difficulty = test.currentDifficulty;
        block.header.number = test.currentBlockNumber;
        normalize(test);

        const dif = block.header.canonicalDifficulty(parentBlock);

        // canonicalDifficulty fork determination by block number

        expect(dif.toString()).toBe(test.currentDifficulty.toString());

        // validateDifficulty fork determination by block number
        expect(block.header.validateDifficulty(parentBlock)).toBe(true);
      }
    }
  });

  // Temporarily run local test selection
  // also: implicit testing through ethereumjs-vm tests
  // (no Byzantium difficulty tests available yet)
  /*
  let args = {}
  args.file = /^difficultyHomestead/
  testing.getTestsFromArgs('BasicTests', (fileName, testName, test) => {
    return new Promise((resolve, reject) => {
      runDifficultyTests(test)
      resolve()
    }).catch(err => console.log(err))
  }, args).then(() => {
    t.end()
  })
  */
});
