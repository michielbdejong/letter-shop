const superagent = require('superagent')
const Plugin = require('ilp-plugin-btp')
const plugin = new Plugin({ server: 'btp+wss://:asdf@letter-shop.herokuapp.com' })
const superagentIlp = require('superagent-ilp')(superagent, plugin)

async function run () {
  await plugin.connect()
  const res = await superagentIlp
    .get('https://letter-shop.herokuapp.com')
    .pay(2000) // pays _up to_ 2000 base units of your ledger, as configured for ilp-plugin

  console.log(res.body)
  // -> { message: 'Hello World!' }
}

run()
