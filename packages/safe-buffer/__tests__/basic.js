/* eslint-disable node/no-deprecated-api */

const SafeBuffer = require("..").Buffer;

test("new SafeBuffer(value) works just like Buffer", () => {
  expect(new SafeBuffer("hey")).toEqual(Buffer.from("hey"));
  expect(new SafeBuffer("hey", "utf8")).toEqual(Buffer.from("hey", "utf8"));
  expect(new SafeBuffer("686579", "hex")).toEqual(Buffer.from("686579", "hex"));
  expect(new SafeBuffer([1, 2, 3])).toEqual(Buffer.from([1, 2, 3]));
  expect(new SafeBuffer(new Uint8Array([1, 2, 3]))).toEqual(Buffer.from(new Uint8Array([1, 2, 3])));

  expect(typeof SafeBuffer.isBuffer).toBe("function");
  expect(SafeBuffer.isBuffer(new SafeBuffer("hey"))).toBe(true);
  expect(Buffer.isBuffer(new SafeBuffer("hey"))).toBe(true);
  expect(SafeBuffer.isBuffer({})).toBeFalsy();
});

test("SafeBuffer.from(value) converts to a Buffer", () => {
  expect(SafeBuffer.from("hey")).toEqual(Buffer.from("hey"));
  expect(SafeBuffer.from("hey", "utf8")).toEqual(Buffer.from("hey", "utf8"));
  expect(SafeBuffer.from("686579", "hex")).toEqual(Buffer.from("686579", "hex"));
  expect(SafeBuffer.from([1, 2, 3])).toEqual(Buffer.from([1, 2, 3]));
  expect(SafeBuffer.from(new Uint8Array([1, 2, 3]))).toEqual(Buffer.from(new Uint8Array([1, 2, 3])));
});

test("SafeBuffer.alloc(number) returns zeroed-out memory", () => {
  for (let i = 0; i < 10; i++) {
    const expected1 = Buffer.alloc(1000);

    expected1.fill(0);
    expect(SafeBuffer.alloc(1000)).toEqual(expected1);

    const expected2 = Buffer.alloc(1000 * 1000);

    expected2.fill(0);
    expect(SafeBuffer.alloc(1000 * 1000)).toEqual(expected2);
  }
});

test("SafeBuffer.allocUnsafe(number)", () => {
  const buf = SafeBuffer.allocUnsafe(100); // unitialized memory

  expect(buf.length).toBe(100);
  expect(SafeBuffer.isBuffer(buf)).toBe(true);
  expect(Buffer.isBuffer(buf)).toBe(true);
});

test("SafeBuffer.from() throws with number types", () => {
  expect(() => {
    SafeBuffer.from(0);
  }).toThrow();
  expect(() => {
    SafeBuffer.from(-1);
  }).toThrow();
  expect(() => {
    SafeBuffer.from(NaN);
  }).toThrow();
  expect(() => {
    SafeBuffer.from(Infinity);
  }).toThrow();
  expect(() => {
    SafeBuffer.from(99);
  }).toThrow();
});

test("SafeBuffer.allocUnsafe() throws with non-number types", () => {
  expect(() => {
    SafeBuffer.allocUnsafe("hey");
  }).toThrow();
  expect(() => {
    SafeBuffer.allocUnsafe("hey", "utf8");
  }).toThrow();
  expect(() => {
    SafeBuffer.allocUnsafe([1, 2, 3]);
  }).toThrow();
  expect(() => {
    SafeBuffer.allocUnsafe({});
  }).toThrow();
});

test("SafeBuffer.alloc() throws with non-number types", () => {
  expect(() => {
    SafeBuffer.alloc("hey");
  }).toThrow();
  expect(() => {
    SafeBuffer.alloc("hey", "utf8");
  }).toThrow();
  expect(() => {
    SafeBuffer.alloc([1, 2, 3]);
  }).toThrow();
  expect(() => {
    SafeBuffer.alloc({});
  }).toThrow();
});
