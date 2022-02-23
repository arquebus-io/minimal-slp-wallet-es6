/*
  This is a live test for burning tokens with a wallet created from a WIF.
  Customize the constants at the top to run the test.
*/

const WIF = process.env.TEST_WIF
if (!WIF) throw new Error('TEST_WIF env var not found.')

// BCH Address: bitcoincash:qqkg30ryje97al52htqwvveha538y7gttywut3cdqv
const TOKEN_ID =
  '38e97c5d7d3585a2cbf3f9580c82ca33985f9cb0845d4dcce220cb709f9538b0'
const BURN_QTY = 0.01

const BchWallet = require('../../index')

async function burnTest () {
  try {
    // Use bch-api
    // const wallet = new BchWallet(WIF, { interface: 'rest-api' })
    // Use bch-consumer
    const wallet = new BchWallet(WIF, { interface: 'consumer-api' })

    await wallet.walletInfoPromise

    const txid = await wallet.burnTokens(BURN_QTY, TOKEN_ID)
    console.log('txid: ', txid)
  } catch (err) {
    console.error(err)
  }
}
burnTest()
