// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    uint256 public faucetAmount;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 _faucetAmount
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        faucetAmount = _faucetAmount;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public {
        _burn(from, amount);
    }

    function faucet(address to) public {
        require(faucetAmount > 0, "Faucet amount must be greater than 0");
        _mint(to, faucetAmount);
    }
}