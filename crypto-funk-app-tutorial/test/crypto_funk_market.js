const CryptoFunkMarket = artifacts.require("CryptoFunkMarket");
const BigNumber = web3.utils.BN;
const BN = require('bn.js');
const { expect } = require('chai');
var chai = require('chai');

// Enable and inject BN dependency
chai.use(require('chai-bignumber')(BN));

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("CryptoFunkMarket", function (accounts) {
  let [alice, bob] = accounts;
  let instance;
  beforeEach(async () => {
    instance = await CryptoFunkMarket.new(
      "CRYPTOFUNK",
      "☮",
      "f50027cdefc8f564d4c1fac14b5a656c5e452476e490acac827dd00e5d9b0f8e",
      4
    );
  });

  it("should have punks remaining to assign", async function() {
    const balance = await instance.punksRemainingToAssign();
    expect(balance.toNumber()).to.equal(4);
  });
  it("should be able to reserve, buy and sell punks", async function() {
    let owner;
    let balance;

    await instance.getPunk(0, {from: alice});
    balance = await instance.punksRemainingToAssign();
    expect(balance.toNumber()).to.equal(3);

    owner = await instance.punkIndexToAddress(0);
    expect(owner).to.equal(alice);

    var reason = '';
    try {
      await instance.transferPunk(bob, 0, {from: bob});
    } catch(err) {
      reason = err.reason;
    }
    expect(reason).to.equal("Transferer doesn't own punk");

    await instance.transferPunk(bob, 0, {from: alice});
    owner = await instance.punkIndexToAddress(0);
    expect(owner).to.equal(bob);

    await instance.offerPunkForSale(0, web3.utils.toWei('1'), {from: bob});
    let forSale = await instance.punksOfferedForSale(0);
    expect(forSale.isForSale).to.equal(true);

    try {
      await instance.buyPunk(0, {from: alice, value: web3.utils.toWei('0.5', "ether")});
      expect("").to.equal("Should not arrive here as buying for too low price");
    } catch(err) {
      reason = err.reason;
    }
    expect(reason).to.equal("Sale price not met");

    reason = '';
    try {
      await instance.buyPunk(0, {from: alice, value: web3.utils.toWei('1', "ether")});
    } catch(err) {
      reason = err.reason;
    }
    expect(reason).to.equal('');

    owner = await instance.punkIndexToAddress(0);
    expect(owner).to.equal(alice);
  });
});
