const Plugin = require('ilp-plugin-xrp-escrow')
const uuid = require('uuid/v4')

const plugin = new Plugin({
  secret: 'sndb5JDdyWiHZia9zv44zSr2itRy1',
  account: 'rGtqDAJNTDMLaNNfq1RVYgPT8onFMj19Aj',
  server: 'wss://s.altnet.rippletest.net:51233',
  prefix: 'test.crypto.xrp.'
})

plugin.connect().then(() => {
  plugin.on('outgoing_fulfill', (transferId, fulfillment) => {
    console.log('Got the fulfillment, you paid for your letter! Go get it at http://localhost:8000/' + fulfillment)
    plugin.disconnect()
    process.exit()
  })

  function sendTransfer(obj) {
    obj.id = uuid()
    obj.from = plugin.getAccount()
    // to
    obj.ledger = plugin.getInfo().prefix
    // amount
    obj.ilp = 'AA'
    obj.noteToSelf = {}
    // executionCondition
    obj.expiresAt = new Date(new Date().getTime() + 1000000).toISOString()
    obj.custom = {}
    return plugin.sendTransfer(obj)
  }

  sendTransfer({
    to: process.argv[2],
    amount: '1',
    executionCondition: process.argv[3]
  }).then(() => {
    console.log('transfer prepared, waiting for fulfillment...')
  }, (err) => {
    console.error(err.message)
  })
})
