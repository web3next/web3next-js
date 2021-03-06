import assert from "assert";
import createKeccakHash from "keccak";
import secp256k1 from "secp256k1";
import rlp from "rlp";
import BN from "bn.js";
import createHash from "create-hash";
import {Buffer} from "safe-buffer";
import {
  arrayContainsArray,
  intToBuffer,
  getBinarySize,
  isHexPrefixed,
  stripHexPrefix,
  padToEven,
  intToHex,
  fromAscii,
  fromUtf8,
  toAscii,
  toUtf8,
  getKeys,
  isHexString
} from "ethjs-util";

export {
  BN,
  rlp,
  arrayContainsArray,
  intToBuffer,
  getBinarySize,
  isHexPrefixed,
  stripHexPrefix,
  padToEven,
  intToHex,
  fromAscii,
  fromUtf8,
  toAscii,
  toUtf8,
  getKeys,
  isHexString
};

/**
 * the max integer that this VM can handle (a ```BN```)
 * @var {BN} MAX_INTEGER
 */
export const MAX_INTEGER = new BN("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 16);

/**
 * 2^256 (a ```BN```)
 * @var {BN} TWO_POW256
 */
export const TWO_POW256 = new BN("10000000000000000000000000000000000000000000000000000000000000000", 16);

/**
 * Keccak-256 hash of null (a ```String```)
 * @var {String} KECCAK256_NULL_S
 */
export const KECCAK256_NULL_S = "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
export const SHA3_NULL_S = KECCAK256_NULL_S;

/**
 * Keccak-256 hash of null (a ```Buffer```)
 * @var {Buffer} KECCAK256_NULL
 */
export const KECCAK256_NULL = Buffer.from(KECCAK256_NULL_S, "hex");
export const SHA3_NULL = KECCAK256_NULL;

/**
 * Keccak-256 of an RLP of an empty array (a ```String```)
 * @var {String} KECCAK256_RLP_ARRAY_S
 */
export const KECCAK256_RLP_ARRAY_S = "1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347";
export const SHA3_RLP_ARRAY_S = KECCAK256_RLP_ARRAY_S;

/**
 * Keccak-256 of an RLP of an empty array (a ```Buffer```)
 * @var {Buffer} KECCAK256_RLP_ARRAY
 */
export const KECCAK256_RLP_ARRAY = Buffer.from(KECCAK256_RLP_ARRAY_S, "hex");
export const SHA3_RLP_ARRAY = KECCAK256_RLP_ARRAY;

/**
 * Keccak-256 hash of the RLP of null  (a ```String```)
 * @var {String} KECCAK256_RLP_S
 */
export const KECCAK256_RLP_S = "56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421";
export const SHA3_RLP_S = KECCAK256_RLP_S;

/**
 * Keccak-256 hash of the RLP of null (a ```Buffer```)
 * @var {Buffer} KECCAK256_RLP
 */
export const KECCAK256_RLP = Buffer.from(KECCAK256_RLP_S, "hex");
export const SHA3_RLP = KECCAK256_RLP;

/**
 * Returns a buffer filled with 0s
 *
 * @method zeros
 * @param {number} bytes  the number of bytes the buffer should be
 * @return {Buffer}
 */
export const zeros = function (bytes) {
  return Buffer.allocUnsafe(bytes).fill(0);
};

/**
  * Returns a zero address
 *
  * @method zeroAddress
  * @return {string}
  */
export const zeroAddress = function () {
  const addressLength = 20;

  return bufferToHex(zeros(addressLength));
};

/**
 * Left Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 *
 * @method lsetLength
 * @param {Buffer|Array} msg the value to pad
 * @param {number} length the number of bytes the output should be
 * @param {boolean} [right=false] whether to start padding form the left or right
 * @return {Buffer|Array}
 */
export const setLengthLeft = function (msg, length, right) {
  const buf = zeros(length);

  msg = toBuffer(msg);
  if (right) {
    if (msg.length < length) {
      msg.copy(buf);

      return buf;
    }

    return msg.slice(0, length);
  } else {
    if (msg.length < length) {
      msg.copy(buf, length - msg.length);

      return buf;
    }

    return msg.slice(-length);
  }
};
export const setLength = setLengthLeft;

/**
 * Right Pads an `Array` or `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 *
 * @param {Buffer|Array} msg the value to pad
 * @param {number} length the number of bytes the output should be
 * @return {Buffer|Array}
 */
export const setLengthRight = function (msg, length) {
  return setLength(msg, length, true);
};

/**
 * Trims leading zeros from a `Buffer` or an `Array`
 *
 * @param {Buffer|Array|string} a
 * @return {Buffer|Array|string}
 */
export const unpad = function (a) {
  a = stripHexPrefix(a);
  let first = a[0];

  while (a.length > 0 && first.toString() === "0") {
    a = a.slice(1);
    first = a[0];
  }

  return a;
};
export const stripZeros = unpad;

/**
 * Attempts to turn a value into a `Buffer`. As input it supports `Buffer`, `String`, `Number`, null/undefined, `BN` and other objects with a `toArray()` method.
 *
 * @param {*} v the value
 */
export const toBuffer = function (v) {
  if (!Buffer.isBuffer(v)) {
    if (Array.isArray(v)) {
      v = Buffer.from(v);
    } else if (typeof v === "string") {
      if (isHexString(v)) {
        v = Buffer.from(padToEven(stripHexPrefix(v)), "hex");
      } else {
        v = Buffer.from(v);
      }
    } else if (typeof v === "number") {
      v = intToBuffer(v);
    } else if (v === null || v === undefined) {
      v = Buffer.allocUnsafe(0);
    } else if (BN.isBN(v)) {
      v = v.toArrayLike(Buffer);
    } else if (v.toArray) {
      // converts a BN to a Buffer
      v = Buffer.from(v.toArray());
    } else {
      throw new Error("invalid type");
    }
  }

  return v;
};

/**
 * Converts a `Buffer` to a `Number`
 *
 * @param {Buffer} buf
 * @return {number}
 * @throws If the input number exceeds 53 bits.
 */
export const bufferToInt = function (buf) {
  return new BN(toBuffer(buf)).toNumber();
};

/**
 * Converts a `Buffer` into a hex `String`
 *
 * @param {Buffer} buf
 * @return {string}
 */
export const bufferToHex = function (buf) {
  buf = toBuffer(buf);

  return "0x" + buf.toString("hex");
};

/**
 * Interprets a `Buffer` as a signed integer and returns a `BN`. Assumes 256-bit numbers.
 *
 * @param {Buffer} num
 * @return {BN}
 */
export const fromSigned = function (num) {
  return new BN(num).fromTwos(256);
};

/**
 * Converts a `BN` to an unsigned integer and returns it as a `Buffer`. Assumes 256-bit numbers.
 *
 * @param {BN} num
 * @return {Buffer}
 */
export const toUnsigned = function (num) {
  return Buffer.from(num.toTwos(256).toArray());
};

/**
 * Creates Keccak hash of the input
 *
 * @param {Buffer|Array|string|number} a the input data
 * @param {number} [bits=256] the Keccak width
 * @return {Buffer}
 */
export const keccak = function (a, bits) {
  a = toBuffer(a);
  if (!bits) {
    bits = 256;
  }

  return createKeccakHash("keccak" + bits).update(a).digest();
};

/**
 * Creates Keccak-256 hash of the input, alias for keccak(a, 256)
 *
 * @param {Buffer|Array|string|number} a the input data
 * @return {Buffer}
 */
export const keccak256 = function (a) {
  return keccak(a);
};

/**
 * Creates SHA-3 (Keccak) hash of the input [OBSOLETE]
 * @param {Buffer|Array|String|Number} a the input data
 * @param {Number} [bits=256] the SHA-3 width
 * @return {Buffer}
 */
export const sha3 = keccak;

/**
 * Creates SHA256 hash of the input
 *
 * @param {Buffer|Array|string|number} a the input data
 * @return {Buffer}
 */
export const sha256 = function (a) {
  a = toBuffer(a);

  return createHash("sha256").update(a).digest();
};

/**
 * Creates RIPEMD160 hash of the input
 *
 * @param {Buffer|Array|string|number} a the input data
 * @param {boolean} padded whether it should be padded to 256 bits or not
 * @return {Buffer}
 */
export const ripemd160 = function (a, padded) {
  a = toBuffer(a);
  const hash = createHash("rmd160").update(a).digest();

  if (padded === true) {
    return setLength(hash, 32);
  } else {
    return hash;
  }
};

/**
 * Creates SHA-3 hash of the RLP encoded version of the input
 *
 * @param {Buffer|Array|string|number} a the input data
 * @return {Buffer}
 */
export const rlphash = function (a) {
  return keccak(rlp.encode(a));
};

/**
 * Checks if the private key satisfies the rules of the curve secp256k1.
 *
 * @param {Buffer} privateKey
 * @return {boolean}
 */
export const isValidPrivate = function (privateKey) {
  return secp256k1.privateKeyVerify(privateKey);
};

/**
 * Checks if the public key satisfies the rules of the curve secp256k1
 * and the requirements of Ethereum.
 *
 * @param {Buffer} publicKey The two points of an uncompressed key, unless sanitize is enabled
 * @param {boolean} [sanitize=false] Accept public keys in other formats
 * @return {boolean}
 */
export const isValidPublic = function (publicKey, sanitize) {
  if (publicKey.length === 64) {
    // Convert to SEC1 for secp256k1
    return secp256k1.publicKeyVerify(Buffer.concat([Buffer.from([4]), publicKey]));
  }

  if (!sanitize) {
    return false;
  }

  return secp256k1.publicKeyVerify(publicKey);
};

/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 *
 * @param {Buffer} pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param {boolean} [sanitize=false] Accept public keys in other formats
 * @return {Buffer}
 */
export const pubToAddress = function (pubKey, sanitize) {
  pubKey = toBuffer(pubKey);
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1.publicKeyConvert(pubKey, false).slice(1);
  }
  assert(pubKey.length === 64);

  // Only take the lower 160bits of the hash
  return keccak(pubKey).slice(-20);
};

export const publicToAddress = pubToAddress;

/**
 * Returns the ethereum public key of a given private key
 *
 * @param {Buffer} privateKey A private key must be 256 bits wide
 * @return {Buffer}
 */
export const privateToPublic = function (privateKey) {
  privateKey = toBuffer(privateKey);

  // skip the type flag and use the X, Y points
  return secp256k1.publicKeyCreate(privateKey, false).slice(1);
};

/**
 * Converts a public key to the Ethereum format.
 *
 * @param {Buffer} publicKey
 * @return {Buffer}
 */
export const importPublic = function (publicKey) {
  publicKey = toBuffer(publicKey);
  if (publicKey.length !== 64) {
    publicKey = secp256k1.publicKeyConvert(publicKey, false).slice(1);
  }

  return publicKey;
};

/**
 * ECDSA sign
 *
 * @param {Buffer} msgHash
 * @param {Buffer} privateKey
 * @return {Object}
 */
export const ecsign = function (msgHash, privateKey) {
  const sig = secp256k1.sign(msgHash, privateKey);

  const ret = {};

  ret.r = sig.signature.slice(0, 32);
  ret.s = sig.signature.slice(32, 64);
  ret.v = sig.recovery + 27;

  return ret;
};

/**
 * Returns the keccak-256 hash of `message`, prefixed with the header used by the `eth_sign` RPC call.
 * The output of this function can be fed into `ecsign` to produce the same signature as the `eth_sign`
 * call for a given `message`, or fed to `ecrecover` along with a signature to recover the public key
 * used to produce the signature.
 *
 * @param message
 * @returns {Buffer} hash
 */
export const hashPersonalMessage = function (message) {
  const prefix = toBuffer("\u0019Ethereum Signed Message:\n" + message.length.toString());

  return keccak(Buffer.concat([prefix, message]));
};

/**
 * ECDSA public key recovery from signature
 *
 * @param {Buffer} msgHash
 * @param {number} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @return {Buffer} publicKey
 */
export const ecrecover = function (msgHash, v, r, s) {
  const signature = Buffer.concat([setLength(r, 32), setLength(s, 32)], 64);
  const recovery = v - 27;

  if (recovery !== 0 && recovery !== 1) {
    throw new Error("Invalid signature v value");
  }
  const senderPubKey = secp256k1.recover(msgHash, signature, recovery);

  return secp256k1.publicKeyConvert(senderPubKey, false).slice(1);
};

/**
 * Convert signature parameters into the format of `eth_sign` RPC method
 *
 * @param {number} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @return {string} sig
 */
export const toRpcSig = function (v, r, s) {
  // NOTE: with potential introduction of chainId this might need to be updated
  if (v !== 27 && v !== 28) {
    throw new Error("Invalid recovery id");
  }

  // geth (and the RPC eth_sign method) uses the 65 byte format used by Bitcoin
  // FIXME: this might change in the future - https://github.com/ethereum/go-ethereum/issues/2053
  return bufferToHex(Buffer.concat([
    setLengthLeft(r, 32),
    setLengthLeft(s, 32),
    toBuffer(v - 27)
  ]));
};

/**
 * Convert signature format of the `eth_sign` RPC method to signature parameters
 * NOTE: all because of a bug in geth: https://github.com/ethereum/go-ethereum/issues/2053
 *
 * @param {string} sig
 * @return {Object}
 */
export const fromRpcSig = function (sig) {
  sig = toBuffer(sig);

  // NOTE: with potential introduction of chainId this might need to be updated
  if (sig.length !== 65) {
    throw new Error("Invalid signature length");
  }

  let v = sig[64];

  // support both versions of `eth_sign` responses

  if (v < 27) {
    v += 27;
  }

  return {
    v,
    r: sig.slice(0, 32),
    s: sig.slice(32, 64)
  };
};

/**
 * Returns the ethereum address of a given private key
 *
 * @param {Buffer} privateKey A private key must be 256 bits wide
 * @return {Buffer}
 */
export const privateToAddress = function (privateKey) {
  return publicToAddress(privateToPublic(privateKey));
};

/**
 * Checks if the address is a valid. Accepts checksummed addresses too
 *
 * @param {string} address
 * @return {boolean}
 */
export const isValidAddress = function (address) {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
};

/**
  * Checks if a given address is a zero address
 *
  * @method isZeroAddress
  * @param {string} address
  * @return {boolean}
  */
export const isZeroAddress = function (address) {
  const zeroAddr = zeroAddress();

  return zeroAddr === addHexPrefix(address);
};

/**
 * Returns a checksummed address
 *
 * @param {string} address
 * @return {string}
 */
export const toChecksumAddress = function (address) {
  address = stripHexPrefix(address).toLowerCase();
  const hash = keccak(address).toString("hex");
  let ret = "0x";

  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase();
    } else {
      ret += address[i];
    }
  }

  return ret;
};

/**
 * Checks if the address is a valid checksummed address
 *
 * @param {Buffer} address
 * @return {boolean}
 */
export const isValidChecksumAddress = function (address) {
  return isValidAddress(address) && toChecksumAddress(address) === address;
};

/**
 * Generates an address of a newly created contract
 *
 * @param {Buffer} from the address which is creating this new address
 * @param {Buffer} nonce the nonce of the from account
 * @return {Buffer}
 */
export const generateAddress = function (from, nonce) {
  from = toBuffer(from);
  nonce = new BN(nonce);

  if (nonce.isZero()) {
    // in RLP we want to encode null in the case of zero nonce
    // read the RLP documentation for an answer if you dare
    nonce = null;
  } else {
    nonce = Buffer.from(nonce.toArray());
  }

  // Only take the lower 160bits of the hash
  return rlphash([from, nonce]).slice(-20);
};

/**
 * Returns true if the supplied address belongs to a precompiled account (Byzantium)
 *
 * @param {Buffer|string} address
 * @return {boolean}
 */
export const isPrecompiled = function (address) {
  const a = unpad(address);

  return a.length === 1 && a[0] >= 1 && a[0] <= 8;
};

/**
 * Adds "0x" to a given `String` if it does not already start with "0x"
 *
 * @param {string} str
 * @return {string}
 */
export const addHexPrefix = function (str) {
  if (typeof str !== "string") {
    return str;
  }

  return isHexPrefixed(str) ? str : "0x" + str;
};

/**
 * Validate ECDSA signature
 * @method isValidSignature
 * @param {Buffer} v
 * @param {Buffer} r
 * @param {Buffer} s
 * @param {Boolean} [homestead=true]
 * @return {Boolean}
 */

export const isValidSignature = function (v, r, s, homestead) {
  const SECP256K1_N_DIV_2 = new BN("7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0", 16);
  const SECP256K1_N = new BN("fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141", 16);

  if (r.length !== 32 || s.length !== 32) {
    return false;
  }

  if (v !== 27 && v !== 28) {
    return false;
  }

  r = new BN(r);
  s = new BN(s);

  if (r.isZero() || r.gt(SECP256K1_N) || s.isZero() || s.gt(SECP256K1_N)) {
    return false;
  }

  if (homestead === false && new BN(s).cmp(SECP256K1_N_DIV_2) === 1) {
    return false;
  }

  return true;
};

/**
 * Converts a `Buffer` or `Array` to JSON
 *
 * @param {Buffer|Array} ba
 * @return {Array|string|null}
 */
export const baToJSON = function (ba) {
  if (Buffer.isBuffer(ba)) {
    return "0x" + ba.toString("hex");
  } else if (Array.isArray(ba)) {
    const array = [];

    for (let i = 0; i < ba.length; i++) {
      array.push(baToJSON(ba[i]));
    }

    return array;
  }
};

/**
 * Defines properties on a `Object`. It make the assumption that underlying data is binary.
 *
 * @param {Object} self the `Object` to define properties on
 * @param {Array} fields an array fields to define. Fields can contain:
 * * `name` - the name of the properties
 * * `length` - the number of bytes the field can have
 * * `allowLess` - if the field can be less than the length
 * * `allowEmpty`
 * @param {*} data data to be validated against the definitions
 */
export const defineProperties = function (self, fields, data) {
  self.raw = [];
  self._fields = [];

  // attach the `toJSON`
  self.toJSON = function (label) {
    if (label) {
      const obj = {};

      self._fields.forEach((field) => {
        obj[field] = "0x" + self[field].toString("hex");
      });

      return obj;
    }

    return baToJSON(this.raw);
  };

  self.serialize = function serialize () {
    return rlp.encode(self.raw);
  };

  fields.forEach((field, i) => {
    self._fields.push(field.name);
    function getter () {
      return self.raw[i];
    }
    function setter (v) {
      v = toBuffer(v);

      if (v.toString("hex") === "00" && !field.allowZero) {
        v = Buffer.allocUnsafe(0);
      }

      if (field.allowLess && field.length) {
        v = stripZeros(v);
        assert(field.length >= v.length, "The field " + field.name + " must not have more " + field.length + " bytes");
      } else if (!(field.allowZero && v.length === 0) && field.length) {
        assert(field.length === v.length, "The field " + field.name + " must have byte length of " + field.length);
      }

      self.raw[i] = v;
    }

    Object.defineProperty(self, field.name, {
      enumerable: true,
      configurable: true,
      get: getter,
      set: setter
    });

    if (field.default) {
      self[field.name] = field.default;
    }

    // attach alias
    if (field.alias) {
      Object.defineProperty(self, field.alias, {
        enumerable: false,
        configurable: true,
        set: setter,
        get: getter
      });
    }
  });

  // if the constuctor is passed data
  if (data) {
    if (typeof data === "string") {
      data = Buffer.from(stripHexPrefix(data), "hex");
    }

    if (Buffer.isBuffer(data)) {
      data = rlp.decode(data);
    }

    if (Array.isArray(data)) {
      if (data.length > self._fields.length) {
        throw new Error("wrong number of fields in data");
      }

      // make sure all the items are buffers
      data.forEach((d, i) => {
        self[self._fields[i]] = toBuffer(d);
      });
    } else if (typeof data === "object") {
      const keys = Object.keys(data);

      fields.forEach((field) => {
        if (keys.indexOf(field.name) !== -1) {
          self[field.name] = data[field.name];
        }
        if (keys.indexOf(field.alias) !== -1) {
          self[field.alias] = data[field.alias];
        }
      });
    } else {
      throw new TypeError("invalid data");
    }
  }
};
