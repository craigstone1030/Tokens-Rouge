
var TGE = artifacts.require("./RougeTGE.sol");
var RGEToken = artifacts.require("./RGEToken.sol");

var RGXB = artifacts.require("./RGXBonus.sol");
var RGX9 = artifacts.require("./RGXToken.sol");

contract('RougeTGE', function(accounts) {

  var creator = accounts[0];
  //const initialBalance_creator = web3.eth.getBalance(creator);
  //console.log('creator eth balance = ' + web3.fromWei(initialBalance_creator).toString())

  it("TGE is open and set up correctly", async function() {

    let rge = await RGEToken.deployed();
    let tge = await TGE.deployed();

    let isOpen = await tge.isFundingOpen.call();
    assert.equal(isOpen, true, "funding is not open");

    let tokenPrice = await tge.tokenPrice.call();
    assert.equal(tokenPrice, 152000000000000, "tokenprice is not correct");

    let crowdsale = await rge.crowdsale.call();
    assert.equal(crowdsale, tge.address, "TGE address is not stored in RGE contract");

  });

  it("basic 0.2 ETH contribution to TGE", async function() {

    var user = accounts[1];
    var expected = Math.floor( 0.2 * 500 * 1000000 / 0.076 );

    let rge = await RGEToken.deployed();
    let tge = await TGE.deployed();

    let user_tokens_before = await tge.tokensOf.call(user);
    assert.equal(user_tokens_before.toNumber(), 0, "user has no tokens before contribution");

    await tge.sendTransaction({from: user, gas: 100000, gasPrice: web3.toWei(1, "gwei"), value: web3.toWei(200, "finney")});

    let user_tokens_after = await tge.tokensOf.call(user);
    assert.equal(user_tokens_after.toNumber(), expected, "user get tokens reserved in TGE contract after contribution");

    let user_balance_before = await rge.balanceOf.call(user);
    assert.equal(user_balance_before.toNumber(), 0, "null tokens balance before withdrawal");

    await tge.toggleKYC(user, true);
    await tge.withdraw({from: user});

    let user_balance_after = await rge.balanceOf.call(user);
    assert.equal(user_balance_after.toNumber(), expected, "tokens created after withdrawal");

    let user_tokens_final = await tge.tokensOf.call(user);
    assert.equal(user_tokens_final.toNumber(), 0, "no more tokens in TGE contract after withdrawal");

  });  
  
  it("2 ETH contribution to TGE with 1000 RGXB", async function() {

    var user = accounts[4];
    var rgx_amount = 1000; // RGX tokens number (1 token = 1 finney)
    var contribution = 2000; // in finney
    var expected =  Math.floor( contribution / 2 / 1000 * 500 * 1000000 / 0.076 ) * 20
                  + Math.floor( contribution / 2 / 1000 * 500 * 1000000 / 0.076 );

    // 78,947
    
    let rgx = await RGXB.deployed();
    let rge = await RGEToken.deployed();
    let tge = await TGE.deployed();

    let stored_symbol = await rgx.symbol.call();
    assert.equal(stored_symbol, 'RGXB', "the discount token is not correct");

    let user_rgx_before = await rgx.balanceOf.call(user);
    assert.equal(user_rgx_before.toNumber(), 0, "user has no rgx before distribution");

    await rgx.distribute( user, rgx_amount );

    let user_rgx_after = await rgx.balanceOf.call(user);
    assert.equal(user_rgx_after.toNumber(), rgx_amount, "user has rgx after distribution");

    let user_tokens_before = await tge.tokensOf.call(user);
    assert.equal(user_tokens_before.toNumber(), 0, "user has no tokens before contribution");

    await tge.sendTransaction({from: user, gas: 1000000, gasPrice: web3.toWei(1, "gwei"), value: web3.toWei(contribution, "finney")});

    let user_tokens_after = await tge.tokensOf.call(user);
    assert.equal(user_tokens_after.toNumber(), expected, "user get tokens reserved in TGE contract after contribution");

    let user_balance_before = await rge.balanceOf.call(user);
    assert.equal(user_balance_before.toNumber(), 0, "null tokens balance before withdrawal");

    await tge.toggleKYC(user, true);
    await tge.withdraw({from: user});

    let user_balance_after = await rge.balanceOf.call(user);
    assert.equal(user_balance_after.toNumber(), expected, "tokens created after withdrawal");

    let user_tokens_final = await tge.tokensOf.call(user);
    assert.equal(user_tokens_final.toNumber(), 0, "no more tokens in TGE contract after withdrawal");

  });  

  it("9 ETH contribution to TGE with 2000 RGX9", async function() {

    var user = accounts[3];
    var rgx_amount = 2000; // RGX tokens number (1 token = 1 finney)
    var contribution = 9000; // in finney
    var expected =  Math.floor( 2 * 500 * 1000000 / 0.076 ) * 19
                  + Math.floor( 9 * 500 * 1000000 / 0.076 );

    let rgx = await RGX9.deployed();
    let rge = await RGEToken.deployed();
    let tge = await TGE.deployed();

    let stored_symbol = await rgx.symbol.call();
    assert.equal(stored_symbol, 'RGX9', "the discount token is not correct");

    let user_rgx_before = await rgx.balanceOf.call(user);
    assert.equal(user_rgx_before.toNumber(), 0, "user has no rgx before distribution");

    let user_balance_before = await rge.balanceOf.call(user);
    assert.equal(user_balance_before.toNumber(), 0, "null tokens balance before distribution/withdrawal");

    await rgx.sendTransaction({from: user, gas: 1000000, gasPrice: web3.toWei(1, "gwei"), value: web3.toWei(rgx_amount, "finney")});

    let user_rgx_after = await rgx.balanceOf.call(user);
    assert.equal(user_rgx_after.toNumber(), rgx_amount, "user has rgx after distribution");

    let user_tokens_before = await tge.tokensOf.call(user);
    assert.equal(user_tokens_before.toNumber(), 0, "user has no tokens before contribution");

    await tge.sendTransaction({from: user, gas: 100000, gasPrice: web3.toWei(1, "gwei"), value: web3.toWei(contribution, "finney")});

    let user_tokens_after = await tge.tokensOf.call(user);
    assert.equal(user_tokens_after.toNumber(), expected, "user get tokens reserved in TGE contract after contribution");

    await tge.toggleKYC(user, true);
    await tge.withdraw({from: user});

    let user_balance_after = await rge.balanceOf.call(user);
    assert.equal(user_balance_after.toNumber(), expected, "tokens created after withdrawal");

    let user_tokens_final = await tge.tokensOf.call(user);
    assert.equal(user_tokens_final.toNumber(), 0, "no more tokens in TGE contract after withdrawal");

  });  
  
});
