// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IOneSplit {
    function swap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        uint256[] calldata distribution,
        uint256 flags
    )
        external
        payable
        returns(uint256 returnAmount);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract SwapContract is Ownable {
    IOneSplit public onesplit;

    mapping(address => uint256) public deposits;
    mapping(address => mapping(IERC20 => uint256)) public balances;
    mapping(address => address) public followers;

    event SwapExecuted(address indexed user, address destToken, address toToken, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(IOneSplit _onesplit) {
        onesplit = _onesplit;
    }

    function depositERC20(IERC20 token, uint256 amount, address follower) external {
        require(amount > 0, "Must send positive value");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    
        balances[msg.sender][token] += amount;
        followers[msg.sender] = follower;

        deposits[msg.sender] += amount;
    }

    function withdrawERC20(IERC20 token, uint256 amount) external {
        require(balances[msg.sender][token] >= amount, "Insufficient funds");

        balances[msg.sender][token] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    function executeSwap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        uint256[] calldata distribution,
        uint256 flags
    ) external onlyOwner(){
        require(fromToken.approve(address(onesplit), amount), "Approval failed");
        require(fromToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        onesplit.swap(fromToken, destToken, amount, minReturn, distribution, flags);

        address follower = followers[msg.sender];
        uint256 followerAmount = balances[follower][fromToken];

        if (followerAmount >= amount && amount > (balances[msg.sender][fromToken] / 2)) {
            require(fromToken.approve(address(onesplit), followerAmount), "Approval failed");
            require(fromToken.transferFrom(follower, address(this), followerAmount), "Transfer failed");
            
            onesplit.swap(fromToken, destToken, followerAmount, minReturn, distribution, flags);
            emit SwapExecuted(follower, address(fromToken), address(destToken), followerAmount);
        }

        emit SwapExecuted(msg.sender, address(fromToken), address(destToken), amount);
    }

}
