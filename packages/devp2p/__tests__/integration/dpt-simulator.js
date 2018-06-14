const async = require('async')
const test = require('tape')
const util = require('./util.js')

async function delay (ms) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

test('DPT: new working node', async (t) => {
  const dpts = util.initTwoPeerDPTSetup()

  dpts[0].on('peer:new', function (peer) {
    t.equal(peer.address, '127.0.0.1', 'should have added peer on peer:new')
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: working node added', async (t) => {
  const dpts = util.initTwoPeerDPTSetup()

  dpts[0].on('peer:added', function (peer) {
    t.equal(dpts[0].getPeers().length, 1, 'should have added peer to k-bucket on peer:added')
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: remove node', async (t) => {
  const dpts = util.initTwoPeerDPTSetup()

  async.series([
    function (cb) {
      dpts[0].on('peer:added', function (peer) {
        dpts[0].removePeer(peer)
        cb(null)
      })
    },
    function (cb) {
      dpts[0].on('peer:removed', function (peer) {
        t.equal(dpts[0].getPeers().length, 0, 'should have removed peer from k-bucket on peer:removed')
        cb(null)
      })
    }
  ],
  function (err, results) {
    if (err) {
      t.fail('An unexpected error occured.')
    }
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: ban node', async (t) => {
  const dpts = util.initTwoPeerDPTSetup()

  async.series([
    function (cb) {
      dpts[0].on('peer:added', function (peer) {
        dpts[0].banPeer(peer)
        cb(null)
      })
    },
    function (cb) {
      dpts[0].on('peer:removed', function (peer) {
        t.equal(dpts[0]._banlist.has(peer), true, 'ban-list should contain peer')
        t.equal(dpts[0].getPeers().length, 0, 'should have removed peer from k-bucket on peer:removed')
        cb(null)
      })
    }
  ],
  function (err, results) {
    if (err) {
      t.fail('An unexpected error occured.')
    }
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: k-bucket ping', async (t) => {
  const dpts = util.initTwoPeerDPTSetup()

  async.series([
    function (cb) {
      dpts[0].on('peer:added', function (peer) {
        dpts[0]._onKBucketPing([peer], peer)
        setTimeout(function () {
          cb(null)
        }, 400)
      })
    },
    function (cb) {
      t.equal(dpts[0].getPeers().length, 1, 'should still have one peer in k-bucket')
      cb(null)
    }
  ],
  function (err, results) {
    if (err) {
      t.fail('An unexpected error occured.')
    }
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: add non-available node', async (t) => {
  const dpts = util.getTestDPTs(1)
  const peer = { address: util.localhost, udpPort: util.basePort + 1 }

  await dpts[0].addPeer(peer).catch((e) => {
    t.equal(e.message, 'Timeout error: ping 127.0.0.1:30307', 'should throw Timeout error')
    util.destroyDPTs(dpts)
    t.end()
  })
})

test('DPT: simulate bootstrap', async (t) => {
  const numDPTs = 6
  const dpts = util.getTestDPTs(numDPTs)

  await delay(250)
  await dpts[0].addPeer({ address: util.localhost, udpPort: util.basePort + 1 })
  await delay(100)

  for (let dpt of dpts.slice(2)) {
    await dpt.bootstrap({ address: util.localhost, udpPort: util.basePort + 1 })
  }

  for (let dpt of dpts) {
    dpt.refresh()
    await delay(400)
  }

  await delay(250)
  util.destroyDPTs(dpts)

  // dpts.forEach((dpt, i) => console.log(`${i}:${dpt.getPeers().length}`))
  for (let dpt of dpts) t.equal(dpt.getPeers().length, numDPTs, 'Peers should be distributed to all DPTs')

  t.end()
})
