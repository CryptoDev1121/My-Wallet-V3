/* eslint-disable semi */
const BtcSpendable = require('./btc-spendable')
// const BtcShiftPayment = require('../shift/btc-payment');
const H = require('../helpers')

class BtcAccount extends BtcSpendable {
  constructor (btcWallet, wallet, btcAccount) {
    super(btcWallet, wallet)
    this._sync = () => btcWallet.sync()
    this._btcAccount = btcAccount
    this._label = btcAccount.label
    this._archived = btcAccount.archived
  }

  get index () {
    return this._btcAccount.index
  }

  get xpub () {
    // v4 Check
    return this._btcAccount.derivations ?
      this._btcAccount.derivations.find((a) => a.type === 'bech32').xpub
      : this._btcAccount.extendedPublicKey;
  }

  get archived () {
    return this._archived
  }

  set archived (value) {
    if (typeof value !== 'boolean') {
      throw new Error('BtcAccount.archived must be a boolean')
    }
    if (this === this._btcWallet.defaultAccount) {
      throw new Error('Cannot archive default BCH account');
    }
    this._archived = value
    this._sync()
  }

  get label () {
    return this._label
  }

  set label (value) {
    if (!H.isValidLabel(value)) {
      throw new Error('BtcAccount.label must be an alphanumeric string');
    }
    this._label = value
    this._sync()
  }

  get balance () {
    return super.getAddressBalance(this.xpub)
  }

  get receiveAddress () {
    let { receive } = this._btcWallet.getAccountIndexes(this.xpub)
    return this._btcAccount.receiveAddressAtIndex(receive, 'legacy')
  }

  get changeAddress () {
    let { change } = this._btcWallet.getAccountIndexes(this.xpub)
    return this._btcAccount.changeAddressAtIndex(change, 'legacy')
  }

  get coinCode () {
    return 'btc'
  }

  getAvailableBalance (feePerByte) {
    return super.getAvailableBalance(this.index, feePerByte)
  }

  createPayment () {
    return super.createPayment().from(this.index, this.changeAddress)
  }

  // createShiftPayment (wallet) {
  //   return BtcShiftPayment.fromWallet(wallet, this)
  // }

  // toJSON () {
  //   return {
  //     label: this.label,
  //     archived: this.archived
  //   }
  // }

  // static defaultLabel (accountIdx) {
  //   let label = 'My Bitcoin Cash Wallet';
  //   return accountIdx > 0 ? `${label} ${accountIdx + 1}` : label;
  // }
}

module.exports = BtcAccount
