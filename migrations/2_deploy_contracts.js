
var RGXA = artifacts.require("./RGXBonus.sol");
var RGXB = artifacts.require("./RGXBonus.sol");
var RGXD = artifacts.require("./RGXBonus.sol");

var RGX20 = artifacts.require("./RGXToken.sol");
var RGX15 = artifacts.require("./RGXToken.sol");
var RGX12 = artifacts.require("./RGXToken.sol");
var RGX9 = artifacts.require("./RGXToken.sol");
var RGX8 = artifacts.require("./RGXToken.sol");
var RGX7 = artifacts.require("./RGXToken.sol");
var RGX6 = artifacts.require("./RGXToken.sol");
var RGX5 = artifacts.require("./RGXToken.sol");
var RGX4 = artifacts.require("./RGXToken.sol");
var RGX3 = artifacts.require("./RGXToken.sol");

var TGE = artifacts.require("./RougeTGE.sol");
var RGEToken = artifacts.require("./RGEToken.sol");

var Factory = artifacts.require("./CouponFactory.sol");

module.exports = async function(deployer) {
  let aInst, bInst;

  var now = Math.floor(Date.now() / 1000)

  // $0.076 / 500 = 0.000152 ETH = 152000000000000 wei
  var price = 152000000000000

  await Promise.all([

    // RGX endFunding set to 19 January, 2038 03:14:07 UT ( 2147483647 )

    deployer.deploy(RGXA, 'RGXA Test Token (x20 discount)', 'RGXA', 2147483647, 20, 0),
    deployer.deploy(RGXD, 'RGXD Test Token (x11 discount)', 'RGXD', 2147483647, 1, 0),

    deployer.deploy(RGX20, 'RGX20 Test Token (x20 discount)', 'RGX20', 200000, now, 20),
    deployer.deploy(RGX15, 'RGX15 Test Token (x15 discount)', 'RGX15', 200000, now, 15),
    deployer.deploy(RGX12, 'RGX12 Test Token (x12 discount)', 'RGX12', 200000, now, 12),
    deployer.deploy(RGX8, 'RGX8 Test Token (x8 discount)', 'RGX8', 200000, now, 8),
    deployer.deploy(RGX7, 'RGX7 Test Token (x7 discount)', 'RGX7', 200000, now, 7),
    deployer.deploy(RGX6, 'RGX6 Test Token (x6 discount)', 'RGX6', 200000, now, 6),
    deployer.deploy(RGX5, 'RGX5 Test Token (x5 discount)', 'RGX5', 200000, now, 5),
    deployer.deploy(RGX4, 'RGX4 Test Token (x4 discount)', 'RGX4', 200000, now, 4),
    deployer.deploy(RGX3, 'RGX3 Test Token (x3 discount)', 'RGX3', 200000, now, 3),

    deployer.deploy(RGXB, 'RGXB Test Token (x11 discount)', 'RGXB', 2147483647, 11, 0),
    deployer.deploy(RGX9, 'RGX9 Test Token (x9 discount)', 'RGX9', 200000, now, 9),

    // TEST TGE => 1 hour crowdfounding starting from now

    deployer.deploy(TGE, now, now+3600, price),
    deployer.deploy(RGEToken, now+3600),

    deployer.deploy(Factory)

  ]);

  instances = await Promise.all([
    RGXA.deployed(),
    RGXB.deployed(),
    RGXD.deployed(),
    RGX20.deployed(),
    RGX15.deployed(),
    RGX12.deployed(),
    RGX9.deployed(),
    RGX8.deployed(),
    RGX7.deployed(),
    RGX6.deployed(),
    RGX5.deployed(),
    RGX4.deployed(),
    RGX3.deployed(),
    TGE.deployed(),
    RGEToken.deployed(),
    Factory.deployed()
  ])

  rgxa = instances[0];
  rgxb = instances[1];
  rgxd = instances[2];

  rgx20 = instances[3];
  rgx15 = instances[4];
  rgx12 = instances[5];
  rgx9 = instances[6];
  rgx8 = instances[7];
  rgx7 = instances[8];
  rgx6 = instances[9];
  rgx5 = instances[10];
  rgx4 = instances[11];
  rgx3 = instances[12];

  tge = instances[13];
  rge = instances[14];

  factory = instances[15];

  results = await Promise.all([
    tge.init(
      rge.address,
      rgxa.address, rgxb.address, rgxd.address,
      rgx20.address, rgx15.address, rgx12.address, 
      rgx9.address, rgx8.address, rgx7.address, rgx6.address, rgx5.address, rgx4.address, rgx3.address
    ),
    rge.startCrowdsaleY0(tge.address),
    factory.set_params(rge.address)
  ]);

};
