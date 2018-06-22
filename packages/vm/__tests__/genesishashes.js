const genesisData = require("ethereumjs-testing").getSingleFile("BasicTests/genesishashestest.json");
const VM = require("..");
const vm = new VM();
jest.setTimeout(30000);

describe("[Common]: genesis hashes tests", () => {
  test("should generate the genesis state correctly", async () => {
    await vm.stateManager.generateCanonicalGenesis();
    expect(vm.trie.root.toString("hex")).toBe(genesisData.genesis_state_root);
  });
});
