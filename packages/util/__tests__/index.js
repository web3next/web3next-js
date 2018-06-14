const BN = require("bn.js");
const ethUtils =require( "..");

describe("zeros function", () => {
  test("should produce lots of 0s", () => {
    const z60 = ethUtils.zeros(30);
    const zs60 = "000000000000000000000000000000000000000000000000000000000000";

    expect(z60.toString("hex")).toBe(zs60);
  });
});

describe("zero address", () => {
  test("should generate a zero address", () => {
    const zeroAddress = ethUtils.zeroAddress();

    expect(zeroAddress).toBe("0x0000000000000000000000000000000000000000");
  });
});

describe("is zero address", () => {
  test("should return true when a zero address is passed", () => {
    const isZeroAddress = ethUtils.isZeroAddress("0x0000000000000000000000000000000000000000");

    expect(isZeroAddress).toBe(true);
  });

  test("should return false when the address is not equal to zero", () => {
    const nonZeroAddress = "0x2f015c60e0be116b1f0cd534704db9c92118fb6a";

    expect(ethUtils.isZeroAddress(nonZeroAddress)).toBe(false);
  });
});

describe("keccak", () => {
  test("should produce a hash", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
    const hash = ethUtils.keccak(msg);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("keccak256", () => {
  test("should produce a hash (keccak(a, 256) alias)", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28";
    const hash = ethUtils.keccak256(msg);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("keccak without hexprefix", () => {
  test("should produce a hash", () => {
    const msg = "3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "22ae1937ff93ec72c4d46ff3e854661e3363440acd6f6e4adf8f1a8978382251";
    const hash = ethUtils.keccak(msg);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("keccak-512", () => {
  test("should produce a hash", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "36fdacd0339307068e9ed191773a6f11f6f9f99016bd50f87fd529ab7c87e1385f2b7ef1ac257cc78a12dcb3e5804254c6a7b404a6484966b831eadc721c3d24";
    const hash = ethUtils.keccak(msg, 512);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("sha256", () => {
  test("should produce a sha256", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "58bbda5e10bc11a32d808e40f9da2161a64f00b5557762a161626afe19137445";
    const hash = ethUtils.sha256(msg);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("ripemd160", () => {
  test("should produce a ripemd160", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "4bb0246cbfdfddbe605a374f1187204c896fabfd";
    const hash = ethUtils.ripemd160(msg);

    expect(hash.toString("hex")).toBe(r);
  });

  test("should produce a padded ripemd160", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "0000000000000000000000004bb0246cbfdfddbe605a374f1187204c896fabfd";
    const hash = ethUtils.ripemd160(msg, true);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("rlphash", () => {
  test("should produce a keccak-256 hash of the rlp data", () => {
    const msg = "0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1";
    const r = "33f491f24abdbdbf175e812b94e7ede338d1c7f01efb68574acd279a15a39cbe";
    const hash = ethUtils.rlphash(msg);

    expect(hash.toString("hex")).toBe(r);
  });
});

describe("unpad", () => {
  test("should unpad a string", () => {
    const str = "0000000006600";
    const r = ethUtils.unpad(str);

    expect(r).toBe("6600");
  });
});

describe("unpad a hex string", () => {
  test("should unpad a string", () => {
    const str = "0x0000000006600";
    const r = ethUtils.unpad(str);

    expect(r).toBe("6600");
  });
});

describe("pad", () => {
  test("should left pad a Buffer", () => {
    const buf = Buffer.from([9, 9]);
    const padded = ethUtils.setLength(buf, 3);

    expect(padded.toString("hex")).toBe("000909");
  });
  test("should left truncate a Buffer", () => {
    const buf = Buffer.from([9, 0, 9]);
    const padded = ethUtils.setLength(buf, 2);

    expect(padded.toString("hex")).toBe("0009");
  });
  test("should left pad a Buffer - alias", () => {
    const buf = Buffer.from([9, 9]);
    const padded = ethUtils.setLengthLeft(buf, 3);

    expect(padded.toString("hex")).toBe("000909");
  });
});

describe("rpad", () => {
  test("should right pad a Buffer", () => {
    const buf = Buffer.from([9, 9]);
    const padded = ethUtils.setLength(buf, 3, true);

    expect(padded.toString("hex")).toBe("090900");
  });
  test("should right truncate a Buffer", () => {
    const buf = Buffer.from([9, 0, 9]);
    const padded = ethUtils.setLength(buf, 2, true);

    expect(padded.toString("hex")).toBe("0900");
  });
  test("should right pad a Buffer - alias", () => {
    const buf = Buffer.from([9, 9]);
    const padded = ethUtils.setLengthRight(buf, 3);

    expect(padded.toString("hex")).toBe("090900");
  });
});

describe("bufferToHex", () => {
  test("should convert a buffer to hex", () => {
    const buf = Buffer.from("5b9ac8", "hex");
    const hex = ethUtils.bufferToHex(buf);

    expect(hex).toBe("0x5b9ac8");
  });
  test("empty buffer", () => {
    const buf = Buffer.alloc(0);
    const hex = ethUtils.bufferToHex(buf);

    expect(hex).toStrictEqual("0x");
  });
});

describe("intToHex", () => {
  test("should convert a int to hex", () => {
    const i = 6003400;
    const hex = ethUtils.intToHex(i);

    expect(hex).toBe("0x5b9ac8");
  });
});

describe("intToBuffer", () => {
  test("should convert a int to a buffer", () => {
    const i = 6003400;
    const buf = ethUtils.intToBuffer(i);

    expect(buf.toString("hex")).toBe("5b9ac8");
  });
});

describe("bufferToInt", () => {
  test("should convert a int to hex", () => {
    const buf = Buffer.from("5b9ac8", "hex");
    const i = ethUtils.bufferToInt(buf);

    expect(i).toBe(6003400);
    expect(ethUtils.bufferToInt(Buffer.allocUnsafe(0))).toBe(0);
  });
  test("should convert empty input to 0", () => {
    expect(ethUtils.bufferToInt(Buffer.allocUnsafe(0))).toBe(0);
  });
});

describe("fromSigned", () => {
  test("should convert an unsigned (negative) buffer to a singed number", () => {
    const neg = "-452312848583266388373324160190187140051835877600158453279131187530910662656";
    const buf = Buffer.allocUnsafe(32).fill(0);

    buf[0] = 255;

    expect(ethUtils.fromSigned(buf)).toBe(neg);
  });
  test("should convert an unsigned (positive) buffer to a singed number", () => {
    const neg = "452312848583266388373324160190187140051835877600158453279131187530910662656";
    const buf = Buffer.allocUnsafe(32).fill(0);

    buf[0] = 1;

    expect(ethUtils.fromSigned(buf)).toBe(neg);
  });
});

describe("toUnsigned", () => {
  test("should convert a signed (negative) number to unsigned", () => {
    const neg = "-452312848583266388373324160190187140051835877600158453279131187530910662656";
    const hex = "ff00000000000000000000000000000000000000000000000000000000000000";
    const num = new BN(neg);

    expect(ethUtils.toUnsigned(num).toString("hex")).toBe(hex);
  });

  test("should convert a signed (positive) number to unsigned", () => {
    const neg = "452312848583266388373324160190187140051835877600158453279131187530910662656";
    const hex = "0100000000000000000000000000000000000000000000000000000000000000";
    const num = new BN(neg);

    expect(ethUtils.toUnsigned(num).toString("hex")).toBe(hex);
  });
});

describe("isValidPrivate", () => {
  const SECP256K1_N = new ethUtils.BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16);

  test("should fail on short input", () => {
    const tmp = "0011223344";

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(false);
  });
  test("should fail on too big input", () => {
    const tmp = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(false);
  });
  test("should fail on invalid curve (zero)", () => {
    const tmp = "0000000000000000000000000000000000000000000000000000000000000000";

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(false);
  });
  test("should fail on invalid curve (== N)", () => {
    const tmp = SECP256K1_N.toString(16);

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(false);
  });
  test("should fail on invalid curve (>= N)", () => {
    const tmp = SECP256K1_N.addn(1).toString(16);

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(false);
  });
  test("should work otherwise (< N)", () => {
    const tmp = SECP256K1_N.subn(1).toString(16);

    expect(ethUtils.isValidPrivate(Buffer.from(tmp, "hex"))).toBe(true);
  });
});

describe("isValidPublic", () => {
  test("should fail on too short input", () => {
    let pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae744";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey)).toBe(false);
  });
  test("should fail on too big input", () => {
    let pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d00";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey)).toBe(false);
  });
  test("should fail on SEC1 key", () => {
    let pubKey = "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey)).toBe(false);
  });
  test("shouldn't fail on SEC1 key with sanitize enabled", () => {
    let pubKey = "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey, true)).toBe(true);
  });
  test("should fail with an invalid SEC1 public key", () => {
    let pubKey = "023a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey, true)).toBe(false);
  });
  test("should work with compressed keys with sanitize enabled", () => {
    let pubKey = "033a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey, true)).toBe(true);
  });
  test("should work with sanitize enabled", () => {
    let pubKey = "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey, true)).toBe(true);
  });
  test("should work otherwise", () => {
    let pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(ethUtils.isValidPublic(pubKey)).toBe(true);
  });
});

describe("importPublic", () => {
  const pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

  test("should work with an Ethereum public key", () => {
    const tmp = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    expect(ethUtils.importPublic(Buffer.from(tmp, "hex")).toString("hex")).toBe(pubKey);
  });
  test("should work with uncompressed SEC1 keys", () => {
    const tmp = "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    expect(ethUtils.importPublic(Buffer.from(tmp, "hex")).toString("hex")).toBe(pubKey);
  });
  test("should work with compressed SEC1 keys", () => {
    const tmp = "033a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a";

    expect(ethUtils.importPublic(Buffer.from(tmp, "hex")).toString("hex")).toBe(pubKey);
  });
});

describe("publicToAddress", () => {
  test("should produce an address given a public key", () => {
    let pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
    const address = "2f015c60e0be116b1f0cd534704db9c92118fb6a";

    pubKey = Buffer.from(pubKey, "hex");
    const r = ethUtils.publicToAddress(pubKey);

    expect(r.toString("hex")).toBe(address);
  });
  test("should produce an address given a SEC1 public key", () => {
    let pubKey = "043a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
    const address = "2f015c60e0be116b1f0cd534704db9c92118fb6a";

    pubKey = Buffer.from(pubKey, "hex");
    const r = ethUtils.publicToAddress(pubKey, true);

    expect(r.toString("hex")).toBe(address);
  });
  test("shouldn't produce an address given an invalid SEC1 public key", () => {
    let pubKey = "023a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";

    pubKey = Buffer.from(pubKey, "hex");
    expect(() => {
      ethUtils.publicToAddress(pubKey, true);
    }).toThrow();
  });
  test("shouldn't produce an address given an invalid public key", () => {
    let pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae744";

    pubKey = Buffer.from(pubKey, "hex");
    expect(() => {
      ethUtils.publicToAddress(pubKey);
    }).toThrow();
  });
});

describe("publicToAddress 0x", () => {
  test("should produce an address given a public key", () => {
    const pubKey = "0x3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
    const address = "2f015c60e0be116b1f0cd534704db9c92118fb6a";
    const r = ethUtils.publicToAddress(pubKey);

    expect(r.toString("hex")).toBe(address);
  });
});

describe("privateToPublic", () => {
  test("should produce a public key given a private key", () => {
    const pubKey = "3a443d8381a6798a70c6ff9304bdc8cb0163c23211d11628fae52ef9e0dca11a001cf066d56a8156fc201cd5df8a36ef694eecd258903fca7086c1fae7441e1d";
    const privateKey = Buffer.from([234, 84, 189, 197, 45, 22, 63, 136, 201, 58, 176, 97, 87, 130, 207, 113, 138, 46, 251, 158, 81, 167, 152, 154, 171, 27, 8, 6, 126, 156, 28, 95]);
    const r = ethUtils.privateToPublic(privateKey).toString("hex");

    expect(r.toString("hex")).toBe(pubKey);
  });
  test("shouldn't produce a public key given an invalid private key", () => {
    const privateKey1 = Buffer.from([234, 84, 189, 197, 45, 22, 63, 136, 201, 58, 176, 97, 87, 130, 207, 113, 138, 46, 251, 158, 81, 167, 152, 154, 171, 27, 8, 6, 126, 156, 28, 95, 42]);
    const privateKey2 = Buffer.from([234, 84, 189, 197, 45, 22, 63, 136, 201, 58, 176, 97, 87, 130, 207, 113, 138, 46, 251, 158, 81, 167, 152, 154, 171, 27, 8, 6, 126, 156, 28]);

    expect(() => {
      ethUtils.privateToPublic(privateKey1);
    }).toThrow();
    expect(() => {
      ethUtils.privateToPublic(privateKey2);
    }).toThrow();
  });
});

describe("privateToAddress", () => {
  test("should produce an address given a private key", () => {
    const address = "2f015c60e0be116b1f0cd534704db9c92118fb6a";

    // Our private key
    const privateKey = Buffer.from([234, 84, 189, 197, 45, 22, 63, 136, 201, 58, 176, 97, 87, 130, 207, 113, 138, 46, 251, 158, 81, 167, 152, 154, 171, 27, 8, 6, 126, 156, 28, 95]);
    const r = ethUtils.privateToAddress(privateKey).toString("hex");

    expect(r.toString("hex")).toBe(address);
  });
});

describe("generateAddress", () => {
  test("should produce an address given a public key", () => {
    const add = ethUtils.generateAddress("990ccf8a0de58091c028d6ff76bb235ee67c1c39", 14).toString("hex");

    expect(add.toString("hex")).toBe("936a4295d8d74e310c0c95f0a63e53737b998d12");
  });
});

describe("generateAddress with hex prefix", () => {
  test("should produce an address given a public key", () => {
    const add = ethUtils.generateAddress("0x990ccf8a0de58091c028d6ff76bb235ee67c1c39", 14).toString("hex");

    expect(add.toString("hex")).toBe("d658a4b8247c14868f3c512fa5cbb6e458e4a989");
  });
});

describe("generateAddress with nonce 0 (special case)", () => {
  test("should produce an address given a public key", () => {
    const add = ethUtils.generateAddress("0x990ccf8a0de58091c028d6ff76bb235ee67c1c39", 0).toString("hex");

    expect(add.toString("hex")).toBe("bfa69ba91385206bfdd2d8b9c1a5d6c10097a85b");
  });
});

describe("hex prefix", () => {
  const string = "d658a4b8247c14868f3c512fa5cbb6e458e4a989";

  test("should add", () => {
    expect(ethUtils.addHexPrefix(string)).toBe("0x" + string);
  });
  test("should return on non-string input", () => {
    expect(ethUtils.addHexPrefix(1)).toBe(1);
  });
});

describe("isPrecompiled", () => {
  test("should return true", () => {
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000001")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000002")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000003")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000004")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000005")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000006")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000007")).toBe(true);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000008")).toBe(true);
    expect(ethUtils.isPrecompiled(Buffer.from("0000000000000000000000000000000000000001", "hex"))).toBe(true);
  });
  test("should return false", () => {
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000000")).toBe(false);
    expect(ethUtils.isPrecompiled("0000000000000000000000000000000000000009")).toBe(false);
    expect(ethUtils.isPrecompiled("1000000000000000000000000000000000000000")).toBe(false);
    expect(ethUtils.isPrecompiled(Buffer.from("0000000000000000000000000000000000000000", "hex"))).toBe(false);
  });
});

describe("toBuffer", () => {
  test("should work", () => {
    // Buffer
    expect(ethUtils.toBuffer(Buffer.allocUnsafe(0))).toEqual(Buffer.allocUnsafe(0));

    // Array
    expect(ethUtils.toBuffer([])).toEqual(Buffer.allocUnsafe(0));

    // String
    expect(ethUtils.toBuffer("11")).toEqual(Buffer.from([49, 49]));
    expect(ethUtils.toBuffer("0x11")).toEqual(Buffer.from([17]));
    expect(ethUtils.toBuffer("1234").toString("hex")).toEqual("31323334");
    expect(ethUtils.toBuffer("0x1234").toString("hex")).toEqual("1234");

    // Number
    expect(ethUtils.toBuffer(1)).toEqual(Buffer.from([1]));

    // null
    expect(ethUtils.toBuffer(null)).toEqual(Buffer.allocUnsafe(0));

    // undefined
    expect(ethUtils.toBuffer()).toEqual(Buffer.allocUnsafe(0));

    // 'toBN'
    expect(ethUtils.toBuffer(new BN(1))).toEqual(Buffer.from([1]));

    // 'toArray'
    expect(ethUtils.toBuffer({toArray () {
      return [1];
    }})).toEqual(Buffer.from([1]));
  });
  test("should fail", () => {
    expect(() => {
      ethUtils.toBuffer({test: 1});
    }).toThrow();
  });
});

describe("baToJSON", () => {
  test("should turn a array of buffers into a pure json object", () => {
    const ba = [Buffer.from([0]), Buffer.from([1]), [Buffer.from([2])]];

    expect(ethUtils.baToJSON(ba)).toEqual(["0x00", "0x01", ["0x02"]]);
  });
  test("should turn a buffers into string", () => {
    expect(ethUtils.baToJSON(Buffer.from([0]))).toEqual("0x00");
  });
});

const echash = Buffer.from("82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28", "hex");
const ecprivkey = Buffer.from("3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1", "hex");

describe("ecsign", () => {
  test("should produce a signature", () => {
    const sig = ethUtils.ecsign(echash, ecprivkey);

    expect(sig.r).toEqual(Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex"));
    expect(sig.s).toEqual(Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex"));
    expect(sig.v).toBe(27);
  });
});

describe("ecrecover", () => {
  test("should recover a public key", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");
    const pubkey = ethUtils.ecrecover(echash, 27, r, s);

    expect(pubkey).toEqual(ethUtils.privateToPublic(ecprivkey));
  });
  test("should fail on an invalid signature (v = 21)", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(() => {
      ethUtils.ecrecover(echash, 21, r, s);
    }).toThrow();
  });
  test("should fail on an invalid signature (v = 29)", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(() => {
      ethUtils.ecrecover(echash, 29, r, s);
    }).toThrow();
  });
  test("should fail on an invalid signature (swapped points)", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(() => {
      ethUtils.ecrecover(echash, 27, s, r);
    }).toThrow();
  });
});

describe("hashPersonalMessage", () => {
  test("should produce a deterministic hash", () => {
    const h = ethUtils.hashPersonalMessage(Buffer.from("Hello world"));

    expect(h).toEqual(Buffer.from("8144a6fa26be252b86456491fbcd43c1de7e022241845ffea1c3df066f7cfede", "hex"));
  });
});

describe("isValidSignature", () => {
  test("should fail on an invalid signature (shorter r))", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1ab", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(ethUtils.isValidSignature(27, r, s)).toBe(false);
  });
  test("should fail on an invalid signature (shorter s))", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca", "hex");

    expect(ethUtils.isValidSignature(27, r, s)).toBe(false);
  });
  test("should fail on an invalid signature (v = 21)", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(ethUtils.isValidSignature(21, r, s)).toBe(false);
  });
  test("should fail on an invalid signature (v = 29)", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(ethUtils.isValidSignature(29, r, s)).toBe(false);
  });
  test("should work otherwise", () => {
    const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
    const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

    expect(ethUtils.isValidSignature(27, r, s)).toBe(true);
  });

  // FIXME: add homestead test
});

const checksumAddresses = [
  // All caps
  "0x52908400098527886E0F7030069857D2E4169EE7",
  "0x8617E340B3D01FA5F11F306F4090FD50E238070D",

  // All Lower
  "0xde709f2102306220921060314715629080e2fb77",
  "0x27b1fdb04752bbc536007a920d24acb045561c26",

  // Normal
  "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
  "0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB",
  "0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb"
];

describe(".toChecksumAddress()", () => {
  test("should work", () => {
    for (let i = 0; i < checksumAddresses.length; i++) {
      const tmp = checksumAddresses[i];

      expect(ethUtils.toChecksumAddress(tmp.toLowerCase())).toBe(tmp);
    }
  });
});

describe(".isValidChecksumAddress()", () => {
  test("should return true", () => {
    for (let i = 0; i < checksumAddresses.length; i++) {
      expect(ethUtils.isValidChecksumAddress(checksumAddresses[i])).toBe(true);
    }
  });
  test("should validate", () => {
    expect(ethUtils.isValidChecksumAddress("0x2f015c60e0be116b1f0cd534704db9c92118fb6a")).toBe(false);
  });
});

describe(".isValidAddress()", () => {
  test("should return true", () => {
    expect(ethUtils.isValidAddress("0x2f015c60e0be116b1f0cd534704db9c92118fb6a")).toBe(true);
    expect(ethUtils.isValidAddress("0x52908400098527886E0F7030069857D2E4169EE7")).toBe(true);
  });
  test("should return false", () => {
    expect(ethUtils.isValidAddress("2f015c60e0be116b1f0cd534704db9c92118fb6a")).toBe(false);
    expect(ethUtils.isValidAddress("0x2f015c60e0be116b1f0cd534704db9c92118fb6")).toBe(false);
    expect(ethUtils.isValidAddress("0x2f015c60e0be116b1f0cd534704db9c92118fb6aa")).toBe(false);
    expect(ethUtils.isValidAddress("0X52908400098527886E0F7030069857D2E4169EE7")).toBe(false);
    expect(ethUtils.isValidAddress("x2f015c60e0be116b1f0cd534704db9c92118fb6a")).toBe(false);
  });
});

describe("message sig", () => {
  const r = Buffer.from("99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9", "hex");
  const s = Buffer.from("129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66", "hex");

  test("should return hex strings that the RPC can use", () => {
    expect(ethUtils.toRpcSig(27, r, s)).toBe("0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca6600");
    expect(ethUtils.fromRpcSig("0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca6600")).toEqual({
      v: 27,
      r,
      s
    });
  });

  test("should throw on invalid length", () => {
    expect(() => {
      ethUtils.fromRpcSig("");
    }).toThrow();
    expect(() => {
      ethUtils.fromRpcSig("0x99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca660042");
    }).toThrow();
  });

  test("pad short r and s values", () => {
    expect(ethUtils.toRpcSig(27, r.slice(20), s.slice(20))).toBe("0x00000000000000000000000000000000000000004a1579cf389ef88b20a1abe90000000000000000000000000000000000000000326fa689f228040429e3ca6600");
  });

  test("should throw on invalid v value", () => {
    expect(() => {
      ethUtils.toRpcSig(1, r, s);
    }).toThrow();
  });
});
