# Design pattern decisions

This lists best pratices in terms of smart contract: 

`https://consensys.github.io/smart-contract-best-practices/software_engineering/#circuit-breakers-pause-contract-functionality`


## Fail early and fail loud

I used a lot of modifiers that checks the roles of the user and used `requires()` to verify `msg.sender`'s role. I also used `require()` to check other things such that the value entered to buy something on the market place is sufficent etc. `requires` throws an exception if the condition is not met.


## Restricting access

I used modifiers to restrict access to functions depending on user's role (market place owner, administrator, store owner, shopper).


## Auto depreciation and Mortal

I chose mortal over auto depreciation of the contract but I could have implemented both. The owner of the contract can `selfdestruct()`. This is probably not ideal as it introduces an uncertainty on the recoverability of balances for other users and gives too much control to the market place owner.


## Pull over Push” pattern

As advocated by the course, I used the Pull over Push Pattern. When a shopper wants to purchase an item, his balance is incremented and no external calls are performed. When a store owner wants to cashout his balance, he calls a function to activate the funds transfer. If the external call to `transfer()` fails, then the store owner balance is not modified.


## Circuit Breaker

Circuit breakers stop execution if certain conditions are met, and can be useful when new errors are discovered. Not perfomed here. Administrators should be the ones allowed to stop/pause a given set of functionalities.


## Speed Bump

Speed bumps slow down actions, so that if malicious actions occur, there is time to recover. I did not implement any speed bump functionalities. 



