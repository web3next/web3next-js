const async = require("async");
const Trie = require("@w3n/merkle-patricia-tree/secure").default;
const ethUtil = require("ethereumjs-util");
const testUtil = require("./util");
const VM = require("../..");
const BN = ethUtil.BN;

function parseTestCases (forkConfig, testData, data, gasLimit, value) {
  let testCases = testData.post[forkConfig].map((testCase) => {
    const testIndexes = testCase.indexes;
    const tx = Object.assign({}, testData.transaction);

    if (data !== undefined && testIndexes.data !== data) {
      return null;
    }

    if (value !== undefined && testIndexes.value !== value) {
      return null;
    }

    if (gasLimit !== undefined && testIndexes.gas !== gasLimit) {
      return null;
    }

    tx.data = testData.transaction.data[testIndexes.data];
    tx.gasLimit = testData.transaction.gasLimit[testIndexes.gas];
    tx.value = testData.transaction.value[testIndexes.value];

    return {
      transaction: tx,
      postStateRoot: testCase.hash,
      env: testData.env,
      pre: testData.pre
    };
  });

  testCases = testCases.filter((testCase) => {
    return testCase != null;
  });

  return testCases;
}

function runTestCase (options, testData, t, cb) {
  const state = new Trie();
  let block; let vm;

  async.series([
    function (done) {
      vm = new VM({
        state
      });
      testUtil.setupPreConditions(state, testData, done);
    },
    function (done) {
      const tx = testUtil.makeTx(testData.transaction);

      block = testUtil.makeBlockFromEnv(testData.env);
      tx._homestead = true;
      tx.enableHomestead = true;
      block.isHomestead = function () {
        return true;
      };

      if (tx.validate()) {
        if (options.jsontrace) {
          vm.on("step", (e) => {
            let hexStack = [];

            hexStack = e.stack.map((item) => {
              return "0x" + new BN(item).toString(16, 0);
            });

            const opTrace = {
              pc: e.pc,
              op: e.opcode.opcode,
              gas: "0x" + e.gasLeft.toString("hex"),
              gasCost: "0x" + e.opcode.fee.toString(16),
              stack: hexStack,
              depth: e.depth,
              opName: e.opcode.name
            };

            t.comment(JSON.stringify(opTrace));
          });
          vm.on("afterTx", (results) => {
            const stateRoot = {
              stateRoot: results.vm.runState.stateManager.trie.root.toString("hex")
            };

            t.comment(JSON.stringify(stateRoot));
          });
        }
        vm.runTx({
          tx,
          block
        }, (err, r) => {
          err = null;
          done();
        });
      } else {
        done();
      }
    },
    function (done) {
      if (testData.postStateRoot.substr(0, 2) === "0x") {
        testData.postStateRoot = testData.postStateRoot.substr(2);
      }
      t.equal(state.root.toString("hex"), testData.postStateRoot, "the state roots should match");

      if (state.root.toString("hex") !== testData.postStateRoot.toString("hex")) {
        // since General State Tests, postState keys are no longer included in
        // the state test format. only postStateRoot, so can't debug expected post conditions
        // testUtil.verifyPostConditions(state, testData.post, t, done)
        done();
      } else {
        done();
      }
    }
  ], cb);
}

module.exports = function runStateTest (options, testData) {
  //try {

    const testCases = parseTestCases(options.forkConfig, testData, options.data, options.gasLimit, options.value);
    console.log(testCases);
    return runTestCase(options, testCases[0]); 
/*    async.eachSeries(
      testCases,
      (testCase, done) => {
        return runTestCase(options, testCase, t, done);
      },
      cb
    );
    
  } catch (e) {
    console.log("error running test case for fork: " + options.forkConfig);
    console.log("error:", e);
  }
  */
};
