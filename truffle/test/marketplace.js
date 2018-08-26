var Marketplace = artifacts.require("./Marketplace.sol");
var market;

contract('Marketplace', function(accounts) {
  // test 1
  it("add a shopper to the list of users wishing to be administrator", function() {
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.shopperWantsToBeAdministrator({from:accounts[1]})
    }).then(function () {
      return market.nbAdministratorsToBe.call({from:accounts[0]})
    }).then(function(N) {
      assert.equal(N, 1, "adding a shopper to the list of users wishing to be administrator: FAILED");
    })
  });

  // test 2
  it("Administrator to be becomes an Administrator",function(){
    //var market;
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.administratorEnroll(accounts[1],{from:accounts[0]})
    }).then(function () {
      return market.nbAdministrators.call({from:accounts[0]})
    }).then(function(N) {
      assert.equal(N, 1, "Administrator to be becomes an Administrator: FAILED");
    })
  });

  // test 3
  it("add a shopper to the list of users wishing to be store owner",function(){
    //var market;
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.shopperWantsToBeStoreOwner({from:accounts[2]})
    }).then(function () {
      return market.nbStoreOwnersToBe.call({from:accounts[0]})
    }).then(function(N) {
      assert.equal(N, 1, "add a shopper to the list of users wishing to be store owner: FAILED");
    })
  });



  // test 4
  it("Store Owner to be becomes an Store Owner",function(){
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.administratorApprovesStoreOwner(accounts[2],{from:accounts[1]})
    }).then(function () {
      return market.nbStoreOwners.call({from:accounts[0]})
    }).then(function(N) {
      assert.equal(N, 1, "Store Owner to be becomes an Store Owner: FAILED");
    })
  });

  // test 5
  it("Store Owner adds an item to his store",function(){
    //var market;
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.createStore({from:accounts[2]})
    }).then(function() {
      return market.addItemToStore('BobMarley', 2, 10,{from:accounts[2]})
    }).then(function () {
      return market.nbItemsInStore.call(accounts[2])
    }).then(function(N) {
      assert.equal(N, 1, "Store Owner adds an item to his store: FAILED");
    })
  });

  // test 6
  it("Shopper buys an item",function(){
    //var market;
    return Marketplace.deployed().then(function(instance) {
      market = instance;
      return market.shopperPurchaseItemFromStore(accounts[2], 0, 1, {from:accounts[3], value:2, gasLimit: 300000, gasPrice: 2000000000})
    }).then(function () {
      console.log('bla')
      return market.nbPurchasedGoods.call(accounts[3])
    }).then(function(N) {
      console.log('bli')
      assert.equal(N, 1, "Shopper buys an item: FAILED");
    })
  });

  // test 7
  it("Shop Owner withdraws his funds",function(){
      var balanceBeforeWithdraw;
      var balanceAfterWithdraw;
      return Marketplace.deployed().then(function(instance) {
        market = instance;
        return market.getStoreOwnerBalance.call({from:accounts[2]});
      }).then(function(result){
        balanceBeforeWithdraw = result;
        return market.StoreOwnerWithdrawsFund({from:accounts[2]});
      }).then(function(){
        return market.getStoreOwnerBalance.call({from:accounts[2]});
      }).then(function(result){
        balanceAfterWithdraw = result;
        return;
      }).then(function() {
        assert.equal(balanceAfterWithdraw.c[0], balanceBeforeWithdraw.c[0]-2, "Shop Owner withdraws his funds: FAILED");
      })
    });


// last
});
