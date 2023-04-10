// SPDX-License-Identifier: MIT

// pragma
pragma solidity ^0.8.9;

// imports
import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";

// Errors
error FundMe__NotOwner();
error FundMe__CallFailed();

// Intrfaces, Libraries, Contracts

/**
 * @title A contract for crowd funding
 * @author Amir Codder
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // state variables
    mapping(address => uint256) public s_addressToAmountFunded;
    address[] public s_funders;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    /**
     * @notice This function fund this contract
     * @dev this impelemnts price feeds as our library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You Need to spend more ETH!"
        );
        s_addressToAmountFunded[msg.sender] = msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        for (
            uint256 fundersIndex = 0;
            fundersIndex < s_funders.length;
            fundersIndex++
        ) {
            address funder = s_funders[fundersIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        // require(callSuccess, "Call Failed!");
        if (!callSuccess) {
            revert FundMe__CallFailed();
        }
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = payable(i_owner).call{value: address(this).balance}(
            ""
        );
        // require(seccess, "Call Failed!");
        if (!success) {
            revert FundMe__CallFailed();
        }
    }

    // view and pure functions
    // getter functions

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountfunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getAllFunders() public view returns (address[] memory) {
        return s_funders;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
