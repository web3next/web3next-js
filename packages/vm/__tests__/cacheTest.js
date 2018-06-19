const async = require("async");
const Account = require("ethereumjs-account");
const Transaction = require("ethereumjs-tx");
const Trie = require("merkle-patricia-tree");
const ethUtil = require("ethereumjs-util");
const VM = require("..");

describe("test the cache api", () => {
  test("should have the correct value in the cache ", () => {
    const account1 = {
      address: Buffer.from("cd2a3d9f938e13cd947ec05abc7fe734df8dd826", "hex"),
      key: ethUtil.sha3("cow")
    };

    /*
    contract Contract2 {
        uint i
        function Contract2() {
            i = 1
        }
    }
    */
    const account2 = {
      address: Buffer.from("985509582b2c38010bfaa3c8d2be60022d3d00da", "hex"),
      code: Buffer.from("60606040525b60016000600050819055505b600a80601e6000396000f30060606040526008565b00", "hex")
    };

    /*
    contract Contract {
        function test(uint i) returns (uint) {
            return i
        }
    }
    */
    const account3 = {
      code: Buffer.from("6060604052606a8060116000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806329e99f07146037576035565b005b6046600480359060200150605c565b6040518082815260200191505060405180910390f35b60008190506065565b91905056", "hex")
    };

    const vm = new VM(new Trie());

    async.series([
      createAccount,
      runCode,
      runTx,
      function (cb) {
        vm.trie.get(account2.address, (err, val) => {
          t.assert(!err);
          const a = new Account(val);

          a.getCode(vm.trie, (err, v) => {
            t.assert(!err);
            t.assert(v.toString("hex") === "60606040526008565b00");
            cb();
          });
        });
      }
    ], (err) => {
      t.assert(!err);
      st.end();
    });

    function createAccount (cb) {
      const account = new Account();

      account.balance = "0xf00000000000000001";
      vm.trie.put(Buffer.from(account1.address, "hex"), account.serialize(), cb);
    }

    function runCode (cb) {
      const account = new Account();

      vm.runCode({
        code: account2.code,
        data: account2.code,
        account,
        gasLimit: 3141592,
        address: account2.address,
        caller: account1.address
      }, (err, result) => {
        if (err) {
          return cb(err);
        }
        account.setCode(vm.trie, result.return, (err) => {
          if (err) {
            cb(err);
          } else {
            vm.trie.put(account2.address, account.serialize(), cb);
          }
        });
      });
    }

    function runTx (cb) {
      const tx = new Transaction({
        gasLimit: 3141592,
        gasPrice: 1,
        data: account3.code
      });

      tx.sign(account1.key);
      vm.runTx({
        tx
      }, cb);
    }
  });
});
