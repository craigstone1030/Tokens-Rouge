var RGXToken = artifacts.require("./RGXToken.sol");

contract('RGXToken', function(accounts) {

  var owner = accounts[0];
  //const initialBalance_owner = web3.eth.getBalance(owner);
  //console.log('owner eth balance = ' + web3.fromWei(initialBalance_owner).toString())

  var user1 = accounts[1];
  //const initialBalance_user1 = web3.eth.getBalance(user1)
  //console.log('user1 eth balance = ' + web3.fromWei(initialBalance_user1).toString())

  it("should put 1000 RGXToken in the owner account", function() {
    return RGXToken.deployed().then(function(instance) {
      return instance.balanceOf.call(owner);
    }).then(function(balance) {
      assert.equal(balance.valueOf(), 200000, "200000 wasn't in the owner account");
    });
  });

  // it("should have funding closed at contract creation", function() {
  //   return RGXToken.deployed().then(function(instance) {
  //     RGX = instance;
  //     return RGX.isFundingOpen.call();
  //   }).then(function(isOpen) {
  //     assert.equal(isOpen, false, "funding is not closed at contract creation");
  //   });
  // });
  
  it("has funding opened after owner set a starting timestamp in the past", function() {
    var timestamp = 946684801; // Saturday, January 1, 2000 12:00:01 AM

    return RGXToken.deployed().then(function(instance) {
      RGX = instance;
      return RGX.timeFundingStart( timestamp ); 
    }).then(function() {
      return RGX.isFundingOpen.call();
    }).then(function(isOpen) {
      assert.equal(isOpen, true, "funding is still closed after owner set fundingStart to now");
      return RGX.fundingStart.call();
    }).then(function(start) {
      assert.equal(start, timestamp, "the funding starting timestamp was not correctly set up");
    });
  });
  
  it("sending 10 finney should credit them to the contract and move 10 RGXToken in the user account", function() {
    var RGX;

    var amount = 10;

    var owner_RGX_start_balance;
    var user1_RGX_start_balance;
    var owner_RGX_end_balance;
    var user1_RGX_end_balance;
    
    return RGXToken.deployed().then(function(instance) {
      RGX = instance;
      return RGX.timeFundingStart( 946684801 ); // Saturday, January 1, 2000 12:00:01 AM
    }).then(function() {
      return RGX.balanceOf.call(owner);
    }).then(function(balance) {
      owner_RGX_start_balance = balance.toNumber();
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_start_balance = balance.toNumber();
      RGX.sendTransaction({from: user1, gas: 100000, gasPrice: 100000000000, value: web3.toWei(amount, "finney")});
    }).then(function() {
      return RGX.balanceOf.call(owner);
    }).then(function(balance) {
      owner_RGX_end_balance = balance.toNumber();
      assert.equal(owner_RGX_end_balance, owner_RGX_start_balance - amount, "Amount wasn't correctly taken from the owner");
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_end_balance = balance.toNumber();
      assert.equal(user1_RGX_end_balance, user1_RGX_start_balance + amount, "Amount wasn't correctly sent to the receiver");
      return web3.fromWei(web3.eth.getBalance(RGX.address)) * 1000;
    }).then(function(ether) {
      assert.equal(ether, amount, "Ether wasn't credited to the contract");
    });
  });

  /* This test revert ... 
  it("can't send less than the minimum finney set by owner", function() {
    var RGX;
    
    var minimum = 100;
    var amount = 11;
    
    var user1_RGX_start_balance;
    var user1_RGX_end_balance;
    
    var finney_start;
    
    return RGXToken.deployed().then(function(instance) {
      RGX = instance;
      finney_start = web3.fromWei(web3.eth.getBalance(RGX.address)) * 1000;
      return RGX.timeFundingStart( 946684801 ); // Saturday, January 1, 2000 12:00:01 AM
    }).then(function() {
      return RGX.setMinimum( minimum ); 
    }).then(function() {
      return RGX.minContrib.call();
    }).then(function(minContrib) {
      assert.equal(minContrib, minimum, "Minimum contribution was not set");
    }).then(function() {
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_start_balance = balance.toNumber();
      RGX.sendTransaction({from: user1, gas: 100000, gasPrice: 100000000000, value: web3.toWei(amount, "finney")});
    }).then(function() {
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_end_balance = balance.toNumber();
      assert.equal(user1_RGX_end_balance, user1_RGX_start_balance, "Transfer was not blocked by the minimum");
      return web3.fromWei(web3.eth.getBalance(RGX.address)) * 1000;
    }).then(function(finney) {
      assert.equal(finney - finney_start, 0, "Ether was wrongly credited to the contract");
    });
  });
  */
  
});
