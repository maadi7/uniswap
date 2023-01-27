// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.0 <0.9.0;
pragma abicoder v2;

contract UserStorageData {
    struct TransferStruct {
        address caller;
        address poolAddress;
        address tokenAddress0;
        address tokenAddress1;
    }

    TransferStruct[] transactions;

    function addToBlockchain(
        address poolAddress,
        address tokenAddress0,
        address tokenAddress1
    ) public {
        transactions.push(
            TransferStruct(
                msg.sender,
                poolAddress,
                tokenAddress0,
                tokenAddress1
            )
        );
    }

    function getAllTransactions()
        public
        view
        returns (TransferStruct[] memory)
    {
        return transactions;
    }
}
