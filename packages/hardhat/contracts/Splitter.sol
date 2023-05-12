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
  address immutable _owner;

  // Events
  event EthSplit(address indexed sender, uint256 totalAmount, address[] recipients, uint256[] amounts);
  event EthSplitEqual(address indexed sender, uint256 totalAmount, address[] recipients);
  event Erc20Split(address indexed sender, address[] recipients, uint256[] amounts);
  event Erc20SplitEqual(address indexed sender, uint256 totalAmount, address[] recipients);

  //*********************************************************************//
  // --------------------------- custom errors ------------------------- //
  //*********************************************************************//
  error INVALID_INPUT();
  error INSUFFICIENT_RECIPIENT_COUNT();
  error INVALID_RECIPIENT();
  error INSUFFICIENT_SPLIT_AMOUNT();
  error ONLY_OWNER();
  error TRANSFER_FAILED();

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
    if (msg.sender != _owner) revert ONLY_OWNER();
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
      (bool success, ) = msg.sender.call{value: remainingAmount, gas: 2200}("");
      if (!success) revert TRANSFER_FAILED();
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

    if (rLength > 25 || rLength < 2) revert INSUFFICIENT_RECIPIENT_COUNT();

    for (uint256 i = 0; i < rLength;) {
      if (recipients[i] == address(0)) revert INVALID_RECIPIENT();
      uint256 amountToSend = equalAmount;
      if (i == 0) {
        amountToSend = amountToSend + remainingAmount;
      }
      (bool success, ) = recipients[i].call{value: amountToSend, gas: 2200}("");
      if (!success) revert TRANSFER_FAILED();
      unchecked {
        ++i;
      }
    }

    emit EthSplitEqual(msg.sender, msg.value, _convertToAddresses(recipients));
  }

  /**
   * @notice Splits the ERC20 tokens amongst the given recipients, according to the specified amounts
   * @param token The token of friendship to be shared amongst the recipients
   * @param recipients The noble recipients of the ERC20 tokens
   * @param amounts The amounts each recipient shall receive
   */
  function splitERC20(IERC20 token, address[] calldata recipients, uint256[] calldata amounts) external nonReentrant {
    _transferTokensFromSenderToRecipients(token, recipients, amounts);
    emit Erc20Split(msg.sender, recipients, amounts);
  }

  /**
   * @notice Splits the ERC20 tokens equally amongst the given recipients
   * @param token The token of friendship to be shared amongst the recipients
   * @param recipients The noble recipients of the ERC20 tokens
   * @param totalAmount The total amount to be shared
   */
  function splitEqualERC20(IERC20 token, address[] calldata recipients, uint256 totalAmount) external nonReentrant {
    uint256 rLength = recipients.length;

    if (rLength > 25 || rLength < 2) revert INSUFFICIENT_RECIPIENT_COUNT();

    uint256 equalAmount = totalAmount / rLength;

    uint256 remainingAmount = totalAmount % rLength;
    for (uint256 i = 0; i < rLength;) {
      if (recipients[i] == address(0)) revert INVALID_RECIPIENT();

      uint256 amountToSend = equalAmount;
      if (i == 0) {
        amountToSend = amountToSend + remainingAmount;
      }
      SafeERC20.safeTransferFrom(token, msg.sender, recipients[i], amountToSend);
      unchecked {
        ++i;
      }
    }

    emit Erc20SplitEqual(msg.sender, totalAmount, recipients);
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
    uint256[] calldata amounts,
    uint256 totalAvailable
  ) internal returns (uint256 remainingAmount) {
    uint256 length = recipients.length;
    if (length != amounts.length) revert INVALID_INPUT();
    
    if (length > 25 || length < 2) revert INSUFFICIENT_RECIPIENT_COUNT();

    uint256 totalAmount = 0;
    for (uint256 i = 0; i < length;) {
      if (recipients[i] == address(0)) revert INVALID_RECIPIENT();
      if (amounts[i] == 0) revert INSUFFICIENT_SPLIT_AMOUNT();

      totalAmount = totalAmount + amounts[i];

      (bool success, ) = recipients[i].call{value: amounts[i], gas: 2200}("");
      if (!success) revert TRANSFER_FAILED();
      unchecked {
        ++i;
      }
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
    uint256[] calldata amounts
  ) internal {
    uint256 length = recipients.length;

    if (length != amounts.length) revert INVALID_INPUT();
    if (length > 25 || length < 2) revert INSUFFICIENT_RECIPIENT_COUNT();

    for (uint256 i = 0; i < length;) {
      if (recipients[i] == address(0)) revert INVALID_RECIPIENT();
      if (amounts[i] == 0) revert INSUFFICIENT_SPLIT_AMOUNT();

      SafeERC20.safeTransferFrom(erc20Token, msg.sender, recipients[i], amounts[i]);
      unchecked {
        ++i;
      }
    }
  }

  /**
   * @notice Internal function to convert an array of payable addresses to an array of regular addresses
   * @param recipients The array of payable addresses
   * @return _recipients The array of regular addresses
   */
  function _convertToAddresses(address payable[] calldata recipients) internal pure returns (address[] memory) {
    address[] memory _recipients = new address[](recipients.length);
    for (uint256 i = 0; i < recipients.length;) {
      _recipients[i] = recipients[i];
       unchecked {
        ++i;
      }
    }
    return _recipients;
  }

  /**
   * @notice Withdraws the remaining ETH or ERC20 tokens to the owner's address
   * @param token The address of the ERC20 token, or 0 for ETH
   */
  function withdraw(IERC20 token) external onlyOwner {
    if (address(token) == address(0)) {
      (bool success, ) = _owner.call{value: address(this).balance, gas: 2200}("");
      if (!success) revert TRANSFER_FAILED();
    } else {
      token.transfer(_owner, token.balanceOf(address(this)));
    }
  }

  receive() external payable {}
}
