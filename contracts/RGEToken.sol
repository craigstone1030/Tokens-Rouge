/*

  Contract to implement Rouge ERC20 tokens for the Rouge Project.
  They are based on StandardToken from (https://github.com/ConsenSys/Tokens).

*/

import "./EIP20.sol";

pragma solidity ^0.4.23;

contract RGEToken is EIP20 {
    
    /* ERC20 */
    string public name = 'Rouge';
    string public symbol = 'RGE';
    uint8 public decimals = 6;
    
    /* RGEToken */
    address owner; 
    address public crowdsale;
    uint public endTGE;
    string public version = 'v1';
    uint256 public totalSupply = 1000000000 * 10**uint(decimals);
    uint256 public   reserveY1 =  300000000 * 10**uint(decimals);
    uint256 public   reserveY2 =  200000000 * 10**uint(decimals);

    modifier onlyBy(address _address) {
        require(msg.sender == _address);
        _;
    }
    
    constructor(uint _endTGE) EIP20 (totalSupply, name, decimals, symbol) public {
        owner = msg.sender;
        endTGE = _endTGE;
        crowdsale = address(0);
        balances[owner] = 0;
        balances[crowdsale] = totalSupply;
    }
    
    function startCrowdsaleY0(address _crowdsale) onlyBy(owner) public {
        require(_crowdsale != address(0));
        require(crowdsale == address(0));
        require(now < endTGE);
        crowdsale = _crowdsale;
        balances[crowdsale] = totalSupply - reserveY1 - reserveY2;
        balances[address(0)] -= balances[crowdsale];
        emit Transfer(address(0), crowdsale, balances[crowdsale]);
    }

    function startCrowdsaleY1(address _crowdsale) onlyBy(owner) public {
        require(_crowdsale != address(0));
        require(crowdsale == address(0));
        require(reserveY1 > 0);
        require(now >= endTGE + 31536000); /* Y+1 crowdsale can only start after a year */
        crowdsale = _crowdsale;
        balances[crowdsale] = reserveY1;
        balances[address(0)] -= reserveY1;
        emit Transfer(address(0), crowdsale, reserveY1);
        reserveY1 = 0;
    }

    function startCrowdsaleY2(address _crowdsale) onlyBy(owner) public {
        require(_crowdsale != address(0));
        require(crowdsale == address(0));
        require(reserveY2 > 0);
        require(now >= endTGE + 63072000); /* Y+2 crowdsale can only start after 2 years */
        crowdsale = _crowdsale;
        balances[crowdsale] = reserveY2;
        balances[address(0)] -= reserveY2;
        emit Transfer(address(0), crowdsale, reserveY2);
        reserveY2 = 0;
    }

    // in practice later than end of TGE to let people withdraw
    function endCrowdsale() onlyBy(owner) public {
        require(crowdsale != address(0));
        require(now > endTGE);
        reserveY2 += balances[crowdsale];
        emit Transfer(crowdsale, address(0), balances[crowdsale]);
        balances[address(0)] += balances[crowdsale];
        balances[crowdsale] = 0;
        crowdsale = address(0);
    }

    /* coupon campaign factory */

    address public factory;

    function setFactory(address _factory) onlyBy(owner) public {
        factory = _factory;
    }

    function newCampaign(uint32 _issuance, uint256 _value) public {
        transfer(factory,_value);
        require(factory.call(bytes4(keccak256("createCampaign(address,uint32,uint256)")),msg.sender,_issuance,_value));
    }

    event Burn(address indexed burner, uint256 value);

    function burn(uint256 _value) public returns (bool success) {
        require(_value > 0);
        require(balances[msg.sender] >= _value);
        balances[msg.sender] -= _value;
        totalSupply -= _value;
        emit Transfer(msg.sender, address(0), _value);
        emit Burn(msg.sender, _value);
        return true;
    }

}
