
var TGE = artifacts.require("./RougeTGE.sol");
var RGEToken = artifacts.require("./RGEToken.sol");
var Factory = artifacts.require("./CouponFactory.sol");

contract('RGEToken', function(accounts) {

  it("first distribute 10 ETH worth of RGE ", async function() {

    var user = accounts[9];
    var expected = Math.floor( 10 * 500 * 1000000 / 0.076 );
    var spent = 5;

    let rge = await RGEToken.deployed();
    let tge = await TGE.deployed();
    let factory = await Factory.deployed();

    //let user_tokens_before = await tge.tokensOf.call(user);
    //assert.equal(user_tokens_before.toNumber(), 0, "user has no tokens before contribution");

    await tge.sendTransaction({from: user, gas: 100000, gasPrice: web3.toWei(1, "gwei"), value: web3.toWei(10000, "finney")});

    //let user_tokens_after = await tge.tokensOf.call(user);
    //assert.equal(user_tokens_after.toNumber(), expected, "user get tokens reserved in TGE contract after contribution");

    //let user_balance_before = await rge.balanceOf.call(user);
    //assert.equal(user_balance_before.toNumber(), 0, "null tokens balance before withdrawal");

    await tge.toggleKYC(user, true);
    await tge.withdraw({from: user});

    let user_balance_after = await rge.balanceOf.call(user);
    assert.equal(user_balance_after.toNumber(), expected, "tokens created after withdrawal");

    //let user_tokens_final = await tge.tokensOf.call(user);
    //assert.equal(user_tokens_final.toNumber(), 0, "no more tokens in TGE contract after withdrawal");

    await rge.setFactory(factory.address);
    
    await rge.newCampaign(10, spent, {from: user, gas: 1000000, gasPrice: web3.toWei(1, "gwei")})

    let user_balance_post = await rge.balanceOf.call(user);
    assert.equal(user_balance_post.toNumber(), expected - spent, "tokens created after campaign creation");

    let test = await factory.result.call();
    assert.equal(test, 'PASS', "checking factory state");
    
  });  
  
  
});

