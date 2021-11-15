var RGXBonus = artifacts.require("./RGXBonus.sol");

contract('RGXBonus', function(accounts) {

  var owner = accounts[0];
  var user1 = accounts[1];

  it("should have funding opened at contract creation", function() {
    return RGXBonus.deployed().then(function(instance) {
      RGX = instance;
      return RGX.isFundingOpen.call();
    }).then(function(isOpen) {
      assert.equal(isOpen, true, "funding is closed at contract creation");
    });
  });
  
  it("distributing 2500 RGXB should credit the user account and raise supply", function() {
    var RGX;

    var amount = 2500;

    var RGX_start_supply;
    var RGX_end_supply;
    var user1_RGX_start_balance;
    var user1_RGX_end_balance;
    
    return RGXBonus.deployed().then(function(instance) {
      RGX = instance;
      return RGX.totalSupply.call();
    }).then(function(supply) {
      RGX_start_supply = supply.toNumber();
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_start_balance = balance.toNumber();
      return RGX.distribute( user1, amount );
    }).then(function() {
      return RGX.totalSupply.call();
    }).then(function(supply) {
      RGX_end_supply = supply.toNumber();
      assert.equal(RGX_end_supply, RGX_start_supply + amount, "Amount was not added to supply");
      return RGX.balanceOf.call(user1);
    }).then(function(balance) {
      user1_RGX_end_balance = balance.toNumber();
      assert.equal(user1_RGX_end_balance, user1_RGX_start_balance + amount, "Amount wasn't correctly distribute to the receiver");
    });
  });

  it("has funding close after owner set a ending timestamp in the past", function() {
    var timestamp = 946684801; // Saturday, January 1, 2000 12:00:01 AM

    return RGXBonus.deployed().then(function(instance) {
      RGX = instance;
      return RGX.endFunding( timestamp ); 
    }).then(function() {
      return RGX.isFundingOpen.call();
    }).then(function(isOpen) {
      assert.equal(isOpen, false, "funding is still opened after owner set endFunding");
      return RGX.fundingEnd.call();
    }).then(function(end) {
      assert.equal(end, timestamp, "the funding end timestamp was not correctly set up");
    });
  });

});
