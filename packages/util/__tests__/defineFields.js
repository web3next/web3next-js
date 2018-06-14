const  ethUtil = require("..");

const fields = Object.freeze([{
  name: "aword",
  alias: "blah",
  word: true,
  default: Buffer.allocUnsafe(0)
}, {
  name: "empty",
  allowZero: true,
  length: 20,
  default: Buffer.allocUnsafe(0)
}, {
  name: "cannotBeZero",
  allowZero: false,
  default: Buffer.from([0])
}, {
  name: "value",
  default: Buffer.allocUnsafe(0)
}, {
  name: "r",
  length: 32,
  allowLess: true,
  default: ethUtil.zeros(32)
}]);

describe("define", () => {
  test("should trim zeros", () => {
    const someOb = {};

    ethUtil.defineProperties(someOb, fields);

    // Define Properties
    someOb.r = "0x00004";
    expect(someOb.r.toString("hex")).toBe("04");

    someOb.r = Buffer.from([0, 0, 0, 0, 4]);
    expect(someOb.r.toString("hex")).toBe("04");
  });

  test("shouldn't allow wrong size for exact size requirements", () => {
    const someOb = {};

    ethUtil.defineProperties(someOb, fields);

    expect(() => {
      const tmp = [{
        name: "mustBeExactSize",
        allowZero: false,
        length: 20,
        default: Buffer.from([1, 2, 3, 4])
      }];

      ethUtil.defineProperties(someOb, tmp);
    }).toThrow();
  });

  test("it should accept rlp encoded intial data", () => {
    const someOb = {};
    const data = {
      aword: "test",
      cannotBeZero: "not zero",
      value: "a value",
      r: "rrr"
    };

    const expected = {
      aword: "0x74657374",
      empty: "0x",
      cannotBeZero: "0x6e6f74207a65726f",
      value: "0x612076616c7565",
      r: "0x727272"
    };

    const expectedArray = [
      "0x74657374", "0x", "0x6e6f74207a65726f", "0x612076616c7565", "0x727272"
    ];

    ethUtil.defineProperties(someOb, fields, data);

    // "should produce the correctly labeled object"
    expect(someOb.toJSON(true)).toEqual(expected);

    const someOb2 = {};
    const rlpEncoded = someOb.serialize().toString("hex");

    ethUtil.defineProperties(someOb2, fields, rlpEncoded);

    // "the constuctor should accept rlp encoded buffers"
    expect(someOb2.serialize().toString("hex")).toBe(rlpEncoded);

    const someOb3 = {};

    ethUtil.defineProperties(someOb3, fields, expectedArray);

    // "should produce the correctly object"
    expect(someOb.toJSON()).toEqual(expectedArray);
  });

  test("it should not accept invalid values in the constuctor", () => {
    const someOb = {};

    // "should throw on nonsensical data"
    expect(() => {
      ethUtil.defineProperties(someOb, fields, 5);
    }).toThrow();

    // "should throw on invalid arrays"
    expect(() => {
      ethUtil.defineProperties(someOb, fields, new Array(6));
    }).toThrow();
  });

  test("alias should work ", () => {
    const someOb = {};
    const data = {
      aword: "test",
      cannotBeZero: "not zero",
      value: "a value",
      r: "rrr"
    };

    ethUtil.defineProperties(someOb, fields, data);
    expect(someOb.blah.toString()).toBe("test");
    someOb.blah = "lol";
    expect(someOb.blah.toString()).toBe("lol");
    expect(someOb.aword.toString()).toBe("lol");
  });

  test("alias should work #2", () => {
    const someOb = {};
    const data = {blah: "42"};

    ethUtil.defineProperties(someOb, fields, data);
    expect(someOb.blah).toBe("42");
    expect(someOb.aword).toBe("42");
  });
});
