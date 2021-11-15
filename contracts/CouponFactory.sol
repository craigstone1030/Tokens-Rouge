/*

  Skeleton CouponFactory to test RGEToken

*/

pragma solidity ^0.4.23;

contract RGE {
    function balanceOf(address _owner) public view returns (uint256 balance);
    function transfer(address _to, uint256 _value) public returns (bool success);
    function burn(uint256 _value) public returns (bool success);
}

contract MinimumCouponCampaign {

    address issuer; 
    address public rge; 
    string public name;

    constructor(address _issuer, uint32 _issuance, string _name) public {
        issuer = _issuer;
        name = _name;
    }

    modifier onlyBy(address _address) {
        require(msg.sender == _address);
        _;
    }

    function test() public pure returns (string _result) {
        return "PASS DUMMY";
    }    

    function letsBurn(uint256 _value) onlyBy(issuer) public {

        RGE _rge = RGE(rge);
        _rge.burn(_value);
        
    }    

    function kill() onlyBy(issuer) public {

        RGE _rge = RGE(rge);
        uint256 rgeBalance = _rge.balanceOf(this);
        
        if ( _rge.transfer(issuer, rgeBalance) ) {
            selfdestruct(issuer);
        } 

    }

}

contract CouponFactory {
    
    address owner;
    string public result;

    RGE public rge;

    // index of created contracts
    // address[] public contracts;

    constructor() public {
        owner = msg.sender;
    }

    function set_params (
                   address _rge
                   ) onlyBy(owner) public {
        rge = RGE(_rge);
    }

    modifier onlyBy(address _address) {
        require(msg.sender == _address);
        _;
    }

    function justTest (string _s) public {
        result = _s;
    }

    event NewCampaign(address issuer, address campaign, uint32 _issuance);

    event Test(address x);

    function createCampaign(address _issuer, uint32 _issuance, uint256 _tokens) public {

        rge.transfer(address(0), _tokens);
        
        MinimumCouponCampaign c = new MinimumCouponCampaign(_issuer,_issuance,'DUMMY');

        emit NewCampaign(_issuer, c, _issuance);

        emit Test(this);

        string memory s = c.test();
        
        // contracts.push(c); 
        
        justTest(s);

        // require(false);
        
    }

}
