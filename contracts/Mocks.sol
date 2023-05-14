// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockERC20 is IERC20 {
    function totalSupply() public view virtual override returns (uint256) {
        return 1000000;
    }

    function balanceOf(address account) public view virtual override returns (uint256) {
        return 1000000;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        return true;
    }

    function allowance(address owner, address spender) public view virtual override returns (uint256) {
        return 1000000;
    }

    function approve(address spender, uint256 amount) public virtual override returns (bool) {
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        return true;
    }
}

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

contract MockOneSplit is IOneSplit {
    function swap(
        IERC20 fromToken,
        IERC20 destToken,
        uint256 amount,
        uint256 minReturn,
        uint256[] calldata distribution,
        uint256 flags
    )
        public
        override
        payable
        returns(uint256 returnAmount) 
    {
        return amount;
    }
}
