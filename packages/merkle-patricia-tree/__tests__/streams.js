/* eslint-disable promise/prefer-await-to-callbacks, import/no-commonjs, import/unambiguous, max-len, id-match */

const Trie = require("..");

describe("kv stream test", () => {
  const trie = new Trie();
  const init = [{
    type: "del",
    key: "father"
  }, {
    type: "put",
    key: "name",
    value: "Yuri Irsenovich Kim"
  }, {
    type: "put",
    key: "dob",
    value: "16 February 1941"
  }, {
    type: "put",
    key: "spouse",
    value: "Kim Young-sook"
  }, {
    type: "put",
    key: "occupation",
    value: "Clown"
  }, {
    type: "put",
    key: "nameads",
    value: "Yuri Irsenovich Kim"
  }, {
    type: "put",
    key: "namfde",
    value: "Yuri Irsenovich Kim"
  }, {
    type: "put",
    key: "namsse",
    value: "Yuri Irsenovich Kim"
  }, {
    type: "put",
    key: "dofab",
    value: "16 February 1941"
  }, {
    type: "put",
    key: "spoudse",
    value: "Kim Young-sook"
  }, {
    type: "put",
    key: "occupdsation",
    value: "Clown"
  }, {
    type: "put",
    key: "dozzzb",
    value: "16 February 1941"
  }, {
    type: "put",
    key: "spouszze",
    value: "Kim Young-sook"
  }, {
    type: "put",
    key: "occupatdfion",
    value: "Clown"
  }, {
    type: "put",
    key: "dssob",
    value: "16 February 1941"
  }, {
    type: "put",
    key: "spossuse",
    value: "Kim Young-sook"
  }, {
    type: "put",
    key: "occupssation",
    value: "Clown"
  }];

  const valObj = {};

  init.forEach((i) => {
    if (i.type === "put") {
      valObj[i.key] = i.value;
    }
  });

  test("should fetch all of the nodes", () => {
    trie.batch(init, () => {
      const stream = trie.createReadStream();

      return expect(new Promise((resolve) => {
        stream.on("data", (d) => {
          expect(valObj[d.key.toString()]).toBe(d.value.toString());
          delete valObj[d.key.toString()];
        });
        stream.on("end", () => {
          const keys = Object.keys(valObj);

          resolve(keys.length);
        });
      })).resolves.toBe(0);
    });
  });
});

describe("db stream test", () => {
  test("should only fetch nodes in the current trie", () => {
    const trie = new Trie();
    const init = [{
      type: "put",
      key: "color",
      value: "purple"
    }, {
      type: "put",
      key: "food",
      value: "sushi"
    }, {
      type: "put",
      key: "fight",
      value: "fire"
    }, {
      type: "put",
      key: "colo",
      value: "trolo"
    }, {
      type: "put",
      key: "color",
      value: "blue"
    }, {
      type: "put",
      key: "color",
      value: "pink"
    }];

    const expectedNodes = {
      "3c38d9aa6ad288c8e27da701e17fe99a5b67c8b12fd0469651c80494d36bc4c1": true,
      d5f61e1ff2b918d1c2a2c4b1732a3c68bd7e3fd64f35019f2f084896d4546298: true,
      e64329dadee2fb8a113b4c88cfe973aeaa9b523d4dc8510b84ca23f9d5bfbd90: true,
      c916d458bfb5f27603c5bd93b00f022266712514a59cde749f19220daffc743f: true,
      "2386bfb0de9cf93902a110f5ab07b917ffc0b9ea599cb7f4f8bb6fd1123c866c": true
    };

    trie.checkpoint();
    trie.batch(init, async () => {
      const stream = trie.createScratchReadStream();

      const nodes = await new Promise((resolve) => {
        stream.on("data", (d) => {
          const key = d.key.toString("hex");
          expect(Boolean(expectedNodes[key])).toBeTruthy();
          delete expectedNodes[key];
        });
        stream.on("end", () => {
          resolve(expectedNodes);
        });
      });
      expect(Object.keys(nodes).length).toBe(0);
    });
  });
});
