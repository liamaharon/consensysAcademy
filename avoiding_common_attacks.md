# Avoiding Common Attacks

This explains what measures were taken to ensure that the contracts are not susceptible to common attacks.

This lists most common known attacks:

`https://consensys.github.io/smart-contract-best-practices/known_attacks/`

## Logic bugs

I used the truffle framework to perform some logic bugs tests.

## Integer Overflow and Underflow

This was solved bu using safemath library that ensures protection against overflow.

## Race condition 

### Reentrancy

One of the major dangers of calling external contracts is that they can take over the control flow, and make changes to your data that the calling function wasn't expecting. 

The only external functions called are:

* `push()` 

* `selfdestruct()` 

* `transfer()` 

To prevent this attack, I made sure not to call an external function until I had done all the internal work that needed to be done.



## Poison Data

I did not perform any validation checks on input data. This should be considered for future improvements. 

## Off-chain safety

Not covered here

## Cross chain replay

Not covered here

## `tx.origin` & Gas limit

I use `msg.sender` rather than `tx.origin`.

They are no loops in the contract.

## Exposure

* Exposed Functions

User's types are checked before performing the function. Only Administrators can access Administrators functions, only Shop Owner can access Shop Owner functions etc

* Exposed secrets

No secret here :) 

* Timestamp Dependence

The timestamp of the block can be manipulated by the miner, and all direct and indirect uses of the timestamp should be considered.


As recommended, I didn't use the timestamps of the transactions for internal logics.

* Malicious Administrators

The admininistrators are accepted by the contract owner. Once they are accepted, they can accept requests from user to become store owners.

I could have implemented multisig contract managers so that a user would require several administrator approval to become a store owner.



