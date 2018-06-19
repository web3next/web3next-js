const genesisData = require("ethereumjs-testing").getSingleFile("BasicTests/genesishashestest.json");
const tape = require("tape");
const VM = require("..");

const vm = new VM();

tape("[Common]: genesis hashes tests", (t) => {
  t.test("should generate the genesis state correctly", (st) => {
    vm.stateManager.generateCanonicalGenesis(() => {
      st.equal(vm.trie.root.toString("hex"), genesisData.genesis_state_root);
      st.end();
    });
  });
});
