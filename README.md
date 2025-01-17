# minimal-slp-wallet

This is a minimalist Bitcoin Cash (BCH) wallet 'engine' for use with front end web apps. It contains all the core functionality needed by a wallet:

- Create a new BCH wallet or import a mnemonic
- Encrypt a wallets mnemonic for safe storage
- Send and receive BCH
- Send and receive SLP tokens
- Get balances and UTXOs
- Retrieve transaction history & transaction details
- Burn tokens
- Price BCH in USD
- Send messages on the blockchain via OP_RETURN data

It is 'token aware' and can work with all SLP tokens. It can interface with Web 2 infrastructure like [FullStack.cash](https://fullstack.cash) or with the [PSF Web 3 infrastructure](https://psfoundation.cash/blog/realizing-the-web-3-cash-stack) via the [bch-consumer library](https://www.npmjs.com/package/bch-consumer).

This target consumers for this library is:

- [gatsby-theme-bch-wallet](https://github.com/Permissionless-Software-Foundation/gatsby-theme-bch-wallet) Gatsby web wallet theme.
- [psf-bch-wallet](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet) command line wallet.

The default derivation path for the wallet keypair is `m/44'/245'/0'/0/0`. This is the BIP44 standard for SLP token-aware BCH wallets.

## Examples

The [examples](./examples) directory shows how to write node.js JavaScript apps that use this library to work with BCH:

- [Create a wallet](./examples/create-wallet.js)
- [Send BCH](./examples/send-bch.js)
- [List Tokens](./examples/list-tokens.js)
- [Send Tokens](./examples/send-tokens.js)

## How to use it?

### Import

#### Add to your HTML scripts

```js
<script src="https://unpkg.com/minimal-slp-wallet"></script>
```

#### Node module

```bash
npm install minimal-slp-wallet --save
```

```js
// module import
import BchWallet from 'minimal-slp-wallet'

// nodejs modules
const BchWallet = require('minimal-slp-wallet/index')
```

### Instantiate Library

#### Using Web 2 Infrastructure

```js
const BCHJS = require('@psf/bch-js')
const BchWallet = require('minimal-slp-wallet/index')

const bchjs = new BCHJS({ restURL: 'https://api.fullstack.cash/v5/' })
const bchWallet = new BchWallet(undefined, {
  interface: 'rest-api',
  restURL: 'https://api.fullstack.cash'
})
```

#### Using Web 3 Interface

```js
const BCHJS = require('@psf/bch-js')
const BchWallet = require('minimal-slp-wallet/index')

const bchjs = new BCHJS()
const bchWallet = new BchWallet(undefined, {
  interface: 'consumer-api',
  restURL: 'https://free-bch.fullstack.cash'
  // Connect to your own instance of ipfs-bch-wallet-consumer:
  // restURL: 'http://localhost:5005'
})
```

### Create new wallets

```js
const bchWallet = new BchWallet()
await bchWallet.walletInfoPromise // Wait for wallet to be created.

// 12 words seed phrase for the wallet
console.log(bchWallet.walletInfo.mnemonic)

// cash address derived from the seed (derivation path: m/44'/245'/0'/0/0)
console.log(bchWallet.walletInfo.cashAddress)

// legacy address derived from the seed (derivation path: m/44'/245'/0'/0/0)
console.log(bchWallet.walletInfo.legacyAddress)

// private key for the BCH address derived from the seed (derivation path: m/44'/245'/0'/0/0)
console.log(bchWallet.walletInfo.privateKey)
```

### Mnemonic encryption

```js
const bchWallet = new BchWallet(null, {
  password: 'myStrongPassword'
})

// 12 words seed phrase for the wallet
console.log(bchWallet.walletInfo.mnemonic)

// encrypted mnemonic
console.log(bchWallet.walletInfo.mnemonicEncrypted)

const bchWallet2 = new BchWallet(bchWallet.walletInfo.mnemonicEncrypted, {
  password: 'myStrongPassword'
})

// decrypted mnemonic
console.log(bchWallet2.walletInfo.mnemonic)
```

### Initialize wallet with mnemonic

```js
// initialize with 12 words seed phrase for the wallet
const bchWallet = new BchWallet(
  'minor bench until split suffer shine series bag avoid cruel orient aunt'
)

// initialize for specific HD derivation path
const bchWallet2 = new BchWallet(
  'minor bench until split suffer shine series bag avoid cruel orient aunt',
  {
    HdPath: "m/44'/245'/0'/1'"
  }
)
```

### Send transactions

You can send funds to other BCH wallets. You can distribute funds to N users by simply extending the receiver array.

```js
const bchWallet = new BchWallet()

const receivers = [
  {
    address: 'bitcoincash:qp2rmj8heytjrksxm2xrjs0hncnvl08xwgkweawu9h',
    // amount in satoshis, 1 satoshi = 0.00000001 Bitcoin
    amountSat: 100000
  }
]

const txid = await bchWallet.send(receivers)

// Transaction ID
// you can then see the transaction in one of the explorers
// example: `https://explorer.bitcoin.com/bch/tx/${tx.txid}`;
console.log(txid)
```

### Send Tokens

You can send tokens in a similar way:

```js
const receiver = {
  address: 'simpleledger:qpeq7xx5x3a2jfa0x0w8cjqp4v9cm842vgsjqwzvfk',
  tokenId: 'a4fb5c2da1aa064e25018a43f9165040071d9e984ba190c222a7f59053af84b2',
  qty: 1.25
}

const txid = await bchWallet.sendTokens(receiver)

// Transaction ID
console.log(txid)
```

_Note:_ Only single token sends are supported at the moment. i.e. One token type
per receiver per transaction.

### Get Wallet Balance

Gets balance (confirmed + unconfirmed) for an BCH address

```js
// will get a balance for bchWallet.cashAddress
const myBalance = await bchWallet.getBalance()

// will get a balance for any address
const balanceOfOtherAddress = await bchWallet.getBalance(
  'bitcoincash:qp2rmj8heytjrksxm2xrjs0hncnvl08xwgkweawu9h'
)
```

### List Tokens

List the SLP tokens held by an address.

```js
// will get token balance for bchWallet.cashAddress
const myBalance = await bchWallet.listTokens()

// will get a balance for any address
const balanceOfOtherAddress = await bchWallet.listTokens(
  'simpleledger:qpeq7xx5x3a2jfa0x0w8cjqp4v9cm842vgsjqwzvfk'
)
```

### Get Wallet Transaction History

Get an array of TXIDs of the transactions involving this wallet.

```js
// will get transaction history for bchWallet.cashAddress
const myTransactions = await bchWallet.getTransactions()

// will get transaction history for any address
const txHistoryOfOtherAddress = await bchWallet.getTransactions(
  'bitcoincash:qp2rmj8heytjrksxm2xrjs0hncnvl08xwgkweawu9h'
)
```

### Get Detailed Transaction Data

Get transactions details for an array of up to 20 TXIDs.

```js
// Input is an array of up to 20 TXIDs.
const txids = [
  '01517ff1587fa5ffe6f5eb91c99cf3f2d22330cd7ee847e928ce90ca95bf781b'
]

const result = await bchWallet.getTxData(txids)
```

### Get the Price of BCH in USD

```js
// Get the current spot price of BCH in USD
const result = await bchWallet.getUsd()
```

### Send Memo.cash TX with OP_RETURN Data

```js
// Write a small amount of text to the blockchain, compatible with memo.cash.
const result = await bchWallet.sendOpReturn('This is a memo.cash post.')
```

### Error Handling

```js
try {
  tx = await bchWallet.send([
    {
      address: 'bitcoincash:qrlhkg4d9z3y88j246a6482xzregxaxnfsagmd2kh3',
      amountSat: 1000
    }
  ])
} catch (err) {
  console.error(err)

  if (err.message && err.message.indexOf('Insufficient') > -1) {
    return alert('Insufficient balance on your BCH account.')
  }

  return alert('Error. Try again later.')
}
```

### Save keys in the browser

While developing BCH apps, remember to never send the private keys / mnemonic / seed phrase to your servers.

1. Your servers can be hacked
2. Depending on your jurisdiction you may not have the allowance to manage the funds of your users

```js
const bchWallet1 = new BchWallet()

// save the mnemonic for later
localStorage.setItem('BCH_MNEMONIC', bchWallet1.walletInfo.mnemonic)

// retrieve mnemonic to initialize the wallet
const bchWallet2 = new BchWallet(localStorage.getItem('BCH_MNEMONIC'))
```

# Licence

[MIT](LICENSE.md)
