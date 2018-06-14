const async = require("async");
const Account = require("ethereumjs-account");
const Trie = require("merkle-patricia-tree/secure");
const ethUtil = require("ethereumjs-util");
const VM = require("..");
const testUtil = require("./util");

const BN = ethUtil.BN;

module.exports = function runVMTest (options, testData, t, cb) {
  const state = new Trie();
  let results;
  let account;

  async.series([
    function (done) {
      const acctData = testData.pre[testData.exec.address];

      account = new Account();
      account.nonce = testUtil.format(acctData.nonce);
      account.balance = testUtil.format(acctData.balance);
      testUtil.setupPreConditions(state, testData, done);
    },
    function (done) {
      state.get(Buffer.from(testData.exec.address, "hex"), (err, data) => {
        const a = new Account(data);

        account.stateRoot = a.stateRoot;

        // console.log(account.toJSON(true))
        done(err);
      });
    },
    function (done) {
      const block = testUtil.makeBlockFromEnv(testData.env);
      const vm = new VM({state});
      const runCodeData = testUtil.makeRunCodeData(testData.exec, account, block);

      if (options.vmtrace) {
        vm.on("step", (op) => {
          console.log(`(stack before: ${op.stack.length} items)`);
          op.stack.forEach((item, i) => {
            console.log(`${i}: ${item.toString("hex")}`);
          });
          const string = `${op.opcode.name} (gas left: ${op.gasLeft.toString()})`;

          console.log(string);
        });
      }

      vm.runCode(runCodeData, (err, r) => {
        if (r) {
          results = r;
        }
        done(err);
      });
    },
    function (done) {
      if (options.vmtrace) {
        console.log(results.runState.gasLeft.toString());
      }

      if (testData.out.slice(2)) {
        t.equal(results.return.toString("hex"), testData.out.slice(2), "valid return value");
      }

      if (testData.log && testData.logs.length !== 0) {
        testUtil.verifyLogs(results.logs, testData, t);
      }

      if (testData.gas) {
        let actualGas; let expectedGas;

        if (!results.exceptionError) {
          actualGas = results.gas.toString();
          expectedGas = new BN(testUtil.format(testData.gas)).toString();
        } else {
          // OOG
          actualGas = results.gasUsed.toString();
          expectedGas = new BN(testUtil.format(testData.exec.gas)).toString();
        }

        // compress output message for passing test cases
        const successMsg = `valid gas usage [file: ${testData.fileName}]`;
        const failMsg = `valid gas usage [file: ${testData.fileName}, test: ${testData.testName}]`;

        if (actualGas === expectedGas) {
          t.equal(actualGas, expectedGas, successMsg);
        } else {
          t.equal(actualGas, expectedGas, failMsg);
        }
      }

      done();
    }
  ], cb);
};
