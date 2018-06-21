import Trie from "@w3n/merkle-patricia-tree/promisifiedCheckpointTrie";
import {promisify} from "es6-promisify";
import rlp from "rlp";
const async = require("async");
const Account = require("@w3n/account");
const Transaction = require("ethereumjs-tx");
const ethUtil = require("ethereumjs-util");
const VM = require("..");

jest.setTimeout(20000);

describe("test the cache api", () => {
  test("should have the correct value in the cache ", async () => {
    const account1 = {
      address: Buffer.from("cd2a3d9f938e13cd947ec05abc7fe734df8dd826", "hex"),
      key: ethUtil.sha3("cow")
    };

    const account2 = {
      address: Buffer.from("985509582b2c38010bfaa3c8d2be60022d3d00da", "hex"),
      code: Buffer.from("60606040525b60016000600050819055505b600a80601e6000396000f30060606040526008565b00", "hex")
    };

    const account3 = {
      code: Buffer.from("6060604052606a8060116000396000f30060606040526000357c01000000000000000000000000000000000000000000000000000000009004806329e99f07146037576035565b005b6046600480359060200150605c565b6040518082815260200191505060405180910390f35b60008190506065565b91905056", "hex")
    };

    const vm = new VM(new Trie());
    const account0 = new Account();
    console.log(vm.trie.root)

    account0.balance = "0xf00000000000000001";
    await vm.trie.put(Buffer.from(account1.address, "hex"), account0.serialize());

    const account = new Account();
    console.log(vm.trie.root)
    const result = await promisify(vm.runCode)({
      code: account2.code,
      data: account2.code,
      account,
      gasLimit: 3141592,
      address: account2.address,
      caller: account1.address
    });

    console.log(vm.trie.root, result.return);
    await promisify(account.setCode)(vm.trie, result.return);
    console.log(account.codeHash, account);

    await vm.trie.put(account2.address, account.serialize());

    const tx = new Transaction({
      gasLimit: 3141592,
      gasPrice: 1,
      data: account3.code
    });

    tx.sign(account1.key);
    console.log("sign tx");
    await vm.runTx({tx});
    const val = await vm.trie.get(account2.address);

    console.log(rlp.decode(val));
    const a = new Account(val);

    console.log(a.codeHash, a.stateRoot, a.balance, a.nonce);
    const raw = await vm.trie.getRaw(a.codeHash);

    console.log(raw);

    return new Promise((resolve) => {
      a.getCode(vm.trie, (err, v) => {
        console.log(err, v);
        expect(err).toBeFalsy();
        expect(v.toString("hex")).toBe("60606040526008565b00");
        res();
      });
    });
  });
});
