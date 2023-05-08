// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ETHSplitter
 * @notice A smart contract to split ETH or ERC20 tokens between multiple recipients.
 * @dev This is intended for research and development purposes only. Use this contract at your
 * own risk and discretion.
 */

contract ETHSplitter is ReentrancyGuard {
  address private _owner;

  // Events
  event EthSplit(address indexed sender, uint256 totalAmount, address[] recipients, uint256[] amounts);
  event EthSplitEqual(address indexed sender, uint256 totalAmount, address[] recipients);
  event Erc20Split(address indexed sender, address[] recipients, uint256[] amounts);
  event Erc20SplitEqual(address indexed sender, uint256 totalAmount, address[] recipients);

  /**
   * @notice The constructor sets the owner of the contract
   */
  constructor() {
    _owner = msg.sender;
  }

  /**
   * @notice A modifier to ensure that only the owner can perform certain actions
   */
  modifier onlyOwner() {
    require(msg.sender == _owner, "Owner Only");
    _;
  }

  /**
   * @notice Splits the ETH amongst the given recipients, according to the specified amounts
   * @param recipients The noble recipients of the ETH
   * @param amounts The amounts each recipient shall receive
   */
  function splitETH(address payable[] calldata recipients, uint256[] calldata amounts) external payable nonReentrant {
    uint256 remainingAmount = _splitETH(recipients, amounts, msg.value);
    emit EthSplit(msg.sender, msg.value, _convertToAddresses(recipients), amounts);

    if (remainingAmount > 0) {
      (bool success, ) = msg.sender.call{value: remainingAmount}("");
      require(success, "Refund failed");
    }
  }

  /**
   * @notice Splits the ETH equally amongst the given recipients
   * @param recipients The noble recipients of the ETH
   */
  function splitEqualETH(address payable[] calldata recipients) external payable nonReentrant {
    uint256 totalAmount = msg.value;
    uint256 rLength = recipients.length;
    uint256 equalAmount = totalAmount / rLength;
    uint256 remainingAmount = totalAmount % rLength;

    require(msg.value >= rLength, "Min. 1 wei/recipient for splitting");
    require(rLength <= 25 && rLength >= 2, "Recipients: min. 2, max. 25");

    uint256 sentAmount = 0;
    for (uint256 i = 0; i < rLength; ++i) {
      require(recipients[i] != address(0), "Invalid recipient address");
      uint256 amountToSend = equalAmount;
      if (i == 0) {
        amountToSend = amountToSend + remainingAmount;
      }
      (bool success, ) = recipients[i].call{value: amountToSend}("");
      require(success, "Transfer failed");
      sentAmount = sentAmount + amountToSend;
    }

    emit EthSplitEqual(msg.sender, msg.value, _convertToAddresses(recipients));
  }

  /**
   * @notice Splits the ERC20 tokens amongst the given recipients, according to the specified amounts
   * @param token The token of friendship to be shared amongst the recipients
   * @param recipients The noble recipients of the ERC20 tokens
   * @param amounts The amounts each recipient shall receive
   */
  function splitERC20(address token, address[] calldata recipients, uint256[] calldata amounts) external nonReentrant {
    IERC20 erc20Token = IERC20(token);
    _transferTokensFromSenderToRecipients(erc20Token, recipients, amounts);
    emit Erc20Split(msg.sender, recipients, amounts);
  }

  /**
   * @notice Splits the ERC20 tokens equally amongst the given recipients
   * @param token The token of friendship to be shared amongst the recipients
   * @param recipients The noble recipients of the ERC20 tokens
   * @param totalAmount The total amount to be shared
   */
  function splitEqualERC20(address token, address[] calldata recipients, uint256 totalAmount) external nonReentrant {
    IERC20 erc20Token = IERC20(token);

    uint256 rLength = recipients.length;
    require(rLength <= 25 && rLength >= 2, "Recipients: min. 2, max. 25");
    uint256 equalAmount = totalAmount / rLength;
    require(equalAmount >= 1, "Split amt >= smallest unit");
    uint256 remainingAmount = totalAmount % rLength;

    uint256 sentAmount = 0;
    for (uint256 i = 0; i < rLength; ++i) {
      require(recipients[i] != address(0), "Invalid recipient address");

      uint256 amountToSend = equalAmount;
      if (i == 0) {
        amountToSend = amountToSend + remainingAmount;
      }
      SafeERC20.safeTransferFrom(erc20Token, msg.sender, recipients[i], amountToSend);
      sentAmount = sentAmount + amountToSend;
    }

    emit Erc20SplitEqual(msg.sender, sentAmount, recipients);
  }

  /**
   * @notice Internal function to split the ETH amongst the given recipients, according to the specified amounts
   * @dev The contract gracefully returns any leftover dust to the sender
   * @param recipients The noble recipients of the ETH
   * @param amounts The amounts each recipient shall receive
   * @param totalAvailable The total available ETH to be split
   * @return remainingAmount The remaining ETH dust
   */
  function _splitETH(
    address payable[] calldata recipients,
    uint256[] memory amounts,
    uint256 totalAvailable
  ) internal returns (uint256 remainingAmount) {
    uint256 length = recipients.length;
    require(length == amounts.length, "Array lengths must be equal");
    require(length >= 2 && length <= 25, "Recipients: min. 2, max. 25"); //TODO: need to consider reasonable limits

    uint256 totalAmount = 0;
    for (uint256 i = 0; i < length; ++i) {
      require(recipients[i] != address(0), "Invalid recipient address");
      require(amounts[i] >= 1 wei, "Split amt >= smallest unit");
      totalAmount = totalAmount + amounts[i];
      require(totalAmount <= totalAvailable, "Total split <= available balance");

      (bool success, ) = recipients[i].call{value: amounts[i]}("");
      require(success, "Transfer failed");
    }

    return totalAvailable - totalAmount;
  }

  /**
   * @notice Internal function to transfer ERC20 tokens from the sender to the recipients
   * @param erc20Token The ERC20 token to be shared
   * @param recipients The noble recipients of the tokens
   * @param amounts The amounts each recipient shall receive
   */
  function _transferTokensFromSenderToRecipients(
    IERC20 erc20Token,
    address[] calldata recipients,
    uint256[] memory amounts
  ) internal {
    uint256 length = recipients.length;

    require(length == amounts.length, "Array lengths must be equal");
    require(length >= 2 && length <= 25, "Recipients: min. 2, max. 25"); //TODO: need to consider reasonable limits
    uint256 totalAmount = 0;
    for (uint256 i = 0; i < length; ++i) {
      require(recipients[i] != address(0), "Invalid recipient address");
      require(amounts[i] >= 1, "Split amt >= smallest unit");
      SafeERC20.safeTransferFrom(erc20Token, msg.sender, recipients[i], amounts[i]);
      totalAmount = totalAmount + amounts[i];
    }
  }

  /**
   * @notice Internal function to convert an array of payable addresses to an array of regular addresses
   * @param recipients The array of payable addresses
   * @return _recipients The array of regular addresses
   */
  function _convertToAddresses(address payable[] memory recipients) internal pure returns (address[] memory) {
    address[] memory _recipients = new address[](recipients.length);
    for (uint256 i = 0; i < recipients.length; ++i) {
      _recipients[i] = recipients[i];
    }
    return _recipients;
  }

  /**
   * @notice Withdraws the remaining ETH or ERC20 tokens to the owner's address
   * @param token The address of the ERC20 token, or 0 for ETH
   */
  function withdraw(address token) external onlyOwner {
    if (token == address(0)) {
      (bool success, ) = _owner.call{value: address(this).balance}("");
      require(success, "Withdrawal failed");
    } else {
      IERC20 erc20Token = IERC20(token);
      erc20Token.transfer(_owner, erc20Token.balanceOf(address(this)));
    }
  }

  receive() external payable {}
}
