// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IOneSplit {
    function swap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        uint256[] memory distribution,
        uint256 flags
    )
        external
        payable
        returns(uint256 returnAmount);

    function getExpectedReturn(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 parts,
        uint256 flags
    )
        external
        view
        returns(
            uint256 returnAmount,
            uint256[] memory distribution
        );
}

contract SwapContract is Ownable {
    IOneSplit public onesplit;

    mapping(address => mapping(IERC20 => uint256)) public balances;
    mapping(address => address) public followers;

    event Deposit(address indexed user, address token, uint256 amount);
    event SwapExecuted(address indexed user, address fromToken, uint256 fromTokenAmount, address destToken, uint256 destTokenAmount);
    event Withdrawal(address indexed user, uint256 amount);

    constructor(IOneSplit _onesplit) {
        onesplit = _onesplit;
    }

    function depositERC20(IERC20 token, uint256 amount, address follower) external {
        require(amount > 0, "Must send positive value");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    
        balances[msg.sender][token] += amount;
        followers[msg.sender] = follower;
        emit Deposit(msg.sender, address(token), amount);
    }

    function withdrawERC20(IERC20 token, uint256 amount) external {
        require(balances[msg.sender][token] <= amount, "Insufficient funds");

        balances[msg.sender][token] -= amount;
        require(token.transfer(msg.sender, amount), "Transfer failed");

        emit Withdrawal(msg.sender, amount);
    }

    function executeSwap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 parts,
        uint256 flags
    ) external onlyOwner() {

        (uint256 returnAmount, uint256[] memory distribution) = onesplit.getExpectedReturn(fromToken, destToken, amount, parts, flags);

        uint256 destTokenAmount = onesplit.swap(fromToken, destToken, amount, returnAmount, distribution, flags);

        emit SwapExecuted(msg.sender, address(fromToken), amount, address(destToken), destTokenAmount);
    }   
}
