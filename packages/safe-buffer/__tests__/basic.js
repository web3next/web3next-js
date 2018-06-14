/* eslint-disable node/no-deprecated-api */

const test = require("tape");
const SafeBuffer = require("..").Buffer;

test("new SafeBuffer(value) works just like Buffer", (t) => {
  t.deepEqual(new SafeBuffer("hey"), Buffer.from("hey"));
  t.deepEqual(new SafeBuffer("hey", "utf8"), Buffer.from("hey", "utf8"));
  t.deepEqual(new SafeBuffer("686579", "hex"), Buffer.from("686579", "hex"));
  t.deepEqual(new SafeBuffer([1, 2, 3]), Buffer.from([1, 2, 3]));
  t.deepEqual(new SafeBuffer(new Uint8Array([1, 2, 3])), Buffer.from(new Uint8Array([1, 2, 3])));

  t.equal(typeof SafeBuffer.isBuffer, "function");
  t.equal(SafeBuffer.isBuffer(new SafeBuffer("hey")), true);
  t.equal(Buffer.isBuffer(new SafeBuffer("hey")), true);
  t.notOk(SafeBuffer.isBuffer({}));

  t.end();
});

test("SafeBuffer.from(value) converts to a Buffer", (t) => {
  t.deepEqual(SafeBuffer.from("hey"), Buffer.from("hey"));
  t.deepEqual(SafeBuffer.from("hey", "utf8"), Buffer.from("hey", "utf8"));
  t.deepEqual(SafeBuffer.from("686579", "hex"), Buffer.from("686579", "hex"));
  t.deepEqual(SafeBuffer.from([1, 2, 3]), Buffer.from([1, 2, 3]));
  t.deepEqual(SafeBuffer.from(new Uint8Array([1, 2, 3])), Buffer.from(new Uint8Array([1, 2, 3])));

  t.end();
});

test("SafeBuffer.alloc(number) returns zeroed-out memory", (t) => {
  for (let i = 0; i < 10; i++) {
    const expected1 = Buffer.alloc(1000);

    expected1.fill(0);
    t.deepEqual(SafeBuffer.alloc(1000), expected1);

    const expected2 = Buffer.from(1000 * 1000);

    expected2.fill(0);
    t.deepEqual(SafeBuffer.alloc(1000 * 1000), expected2);
  }
  t.end();
});

test("SafeBuffer.allocUnsafe(number)", (t) => {
  const buf = SafeBuffer.allocUnsafe(100); // unitialized memory

  t.equal(buf.length, 100);
  t.equal(SafeBuffer.isBuffer(buf), true);
  t.equal(Buffer.isBuffer(buf), true);
  t.end();
});

test("SafeBuffer.from() throws with number types", (t) => {
  t.plan(5);
  t.throws(() => {
    SafeBuffer.from(0);
  });
  t.throws(() => {
    SafeBuffer.from(-1);
  });
  t.throws(() => {
    SafeBuffer.from(NaN);
  });
  t.throws(() => {
    SafeBuffer.from(Infinity);
  });
  t.throws(() => {
    SafeBuffer.from(99);
  });
});

test("SafeBuffer.allocUnsafe() throws with non-number types", (t) => {
  t.plan(4);
  t.throws(() => {
    SafeBuffer.allocUnsafe("hey");
  });
  t.throws(() => {
    SafeBuffer.allocUnsafe("hey", "utf8");
  });
  t.throws(() => {
    SafeBuffer.allocUnsafe([1, 2, 3]);
  });
  t.throws(() => {
    SafeBuffer.allocUnsafe({});
  });
});

test("SafeBuffer.alloc() throws with non-number types", (t) => {
  t.plan(4);
  t.throws(() => {
    SafeBuffer.alloc("hey");
  });
  t.throws(() => {
    SafeBuffer.alloc("hey", "utf8");
  });
  t.throws(() => {
    SafeBuffer.alloc([1, 2, 3]);
  });
  t.throws(() => {
    SafeBuffer.alloc({});
  });
});
