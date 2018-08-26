pragma solidity ^0.4.18;
import 'zeppelin/contracts/math/SafeMath.sol';

contract Marketplace {

  using SafeMath for uint256;

    // 4 types of market place users: marketplaceowner,administrator, StoreOwner,shopper
    // by default, every user is a shopper

    enum Role{
      MarketPlaceOwner,
      Administrator,
      StoreOwner,
      Shopper
    }

  ///////////////////////////////////////////////////////////
  // structures: item,store,PurchasedGoods and entitystruct
  ///////////////////////////////////////////////////////////

  // an item has a name, a description, a price and a quantity
    struct Item{
      string name;
      uint256 price;
      uint256 qty;
    }

    // a store belongs to a StoreOwner, has certain balance in ETH and has a list of goods to sell
    struct Store {
      address storeOwner;
      uint256 balance;
      Item[] itemIdList;
    }

    // every shopper has a list of purchased goods
    struct PurchasedGoods {
      address goodsShopper;
      Item[] itemIdList;
    }

    address MarketPlaceOwner;

    //
    struct EntityStruct {
      bool entityData;
      uint256 listPointer;
    }

    ///////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////
    // Mapping and Lists
    ///////////////////////////////////////////////////////////
    // Administrator to Be by MarketPlaceOwner
    mapping(address => EntityStruct) public administratorsToBe;
    address[] public administratorsToBeList;
    // Administrator
    mapping(address => EntityStruct) public administrators;
    address[] public administratorsList;
    // storeOwners to Be
    mapping(address => EntityStruct) public storeOwnersToBe;
    address[] public storeOwnersToBeList;
    // storeOwners
    mapping(address => EntityStruct) public storeOwners;
    address[] public storeOwnersList;
    // Link stores to store marketplaceowners
    mapping (address => Store) storeOfMarketPlaceOwner;
    // Link shopper to purchased goods
    mapping (address => PurchasedGoods) purchasedGoodsOfShopper;
    ///////////////////////////////////////////////////////////



    ///////////////////////////////////////////////////////////
    // Modifiers
    ///////////////////////////////////////////////////////////

    modifier m_ismarketplaceowner (address _address) {require(_address == MarketPlaceOwner); _;}
    modifier m_isNotmarketplaceowner (address _address) {require(_address != MarketPlaceOwner); _;}

    modifier m_isAdministrator(address _address) {require(isAdministrator(_address)); _;}
    modifier m_isNotadministrator(address _address) {require(!isAdministrator(_address)); _;}

    modifier m_isAdministratorToBe(address _address) {require(isAdministratorToBe(_address));_;}
    modifier m_isNotadministratorToBe(address _address) {require(!isAdministratorToBe(_address));_;}

    modifier m_isStoreOwnerToBe(address _address) {require(isStoreOwnerToBe(_address));_;}
    modifier m_isNotStoreOwnerToBe(address _address) {require(!isStoreOwnerToBe(_address));_;}

    modifier m_isStoreOwner(address _address) {require(isStoreOwner(_address)); _;}
    modifier m_isNotStoreOwner(address _address) {require(!isStoreOwner(_address)); _;}

    ///////////////////////////////////////////////////////////


    // Constructor
    constructor() public {
        /* Set the marketplaceowner to the creator of this contract */
        MarketPlaceOwner = msg.sender;
    }


    ///////////////////////////////////////////////////////////
    // Functions Related to Store Owners
    ///////////////////////////////////////////////////////////

    // Create Store
    function createStore()
    public
    m_isStoreOwner(msg.sender)
    returns(bool) {
      storeOfMarketPlaceOwner[msg.sender].storeOwner = msg.sender;
      return true;
    }

    // Check if store exists
    function storeCreated(address _store_marketplaceowner)
    public
    view
    m_isStoreOwner(_store_marketplaceowner)
    returns(bool) {
      if (storeOfMarketPlaceOwner[_store_marketplaceowner].storeOwner == _store_marketplaceowner) {
        return true;
      }
      return false;
    }

    // retrieve number of items
    function nbItemsInStore(address _StoreOwner)
    public
    view
    returns(uint256) {
      return storeOfMarketPlaceOwner[_StoreOwner].itemIdList.length;
    }

    // retrieve item name with Idx
    function nameItemGivenId(address _StoreOwner, uint256 idx)
    public
    view
    returns(string) {
      return storeOfMarketPlaceOwner[_StoreOwner].itemIdList[idx].name;
    }

    // Get item info with Idx
    function infoItemGivenId(address _StoreOwner, uint256 idx)
    public
    view
    returns(uint256, string, uint256, uint256) {
      return (idx, storeOfMarketPlaceOwner[_StoreOwner].itemIdList[idx].name, storeOfMarketPlaceOwner[_StoreOwner].itemIdList[idx].price, storeOfMarketPlaceOwner[_StoreOwner].itemIdList[idx].qty);
    }

    // Add item to store
    function addItemToStore(string _name, uint256 _price, uint256 _qty)
    public
    m_isStoreOwner(msg.sender)
    returns(uint256) {
      require(storeOfMarketPlaceOwner[msg.sender].storeOwner == msg.sender);
      storeOfMarketPlaceOwner[msg.sender].itemIdList.push(Item({name:_name, price:_price, qty:_qty}));
      return nbItemsInStore(msg.sender);
    }

    // Function for a StoreOwner to cash out
    function StoreOwnerWithdrawsFund()
    public
    payable
    m_isStoreOwner(msg.sender)
    returns(uint256) {
      require(storeCreated(msg.sender));
      require(storeOfMarketPlaceOwner[msg.sender].balance > 0);
      uint256 temp = storeOfMarketPlaceOwner[msg.sender].balance;
      storeOfMarketPlaceOwner[msg.sender].balance = 0;
      msg.sender.transfer(temp);
      return storeOfMarketPlaceOwner[msg.sender].balance;
    }

    function getStoreOwnerBalance()
    public
    m_isStoreOwner(msg.sender)
    view
    returns(uint256) {
      return storeOfMarketPlaceOwner[msg.sender].balance;
    }

    function isStoreOwner(address entityAddress)
    public
    constant
    returns(bool isIndeed) {
      if(storeOwnersList.length == 0) return false;
      return (storeOwnersList[storeOwners[entityAddress].listPointer] == entityAddress);
    }

    function nbStoreOwners()
    public
    constant
    returns(uint256 entityCount) {
      return storeOwnersList.length;
    }

    function newStoreOwner(address entityAddress, bool entityData)
    private
    m_isAdministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotmarketplaceowner(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotStoreOwnerToBe(entityAddress) // depends on how we ordernance the calls
    m_isNotStoreOwner(entityAddress)
    m_isNotadministrator(entityAddress)
    m_isNotadministratorToBe(entityAddress)
    m_isNotmarketplaceowner(entityAddress)
    returns(bool success) {
      storeOwners[entityAddress].entityData = entityData;
      storeOwners[entityAddress].listPointer = storeOwnersList.push(entityAddress) - 1;
      return true;
    }

    ///////////////////////////////////////////////////////////
    // Functions Related to Shopper
    ///////////////////////////////////////////////////////////

    //  number of purchased goods
    function nbPurchasedGoods(address _goods)
    public
    view
    returns(uint256) {
      return purchasedGoodsOfShopper[_goods].itemIdList.length;
    }

    // retrieve purchased goods info with Idx
    function infoPurchasedGoodsGivenId(address _goods, uint256 idx)
    public
    view
    returns(uint256, string, uint256, uint256) {
      return (idx, purchasedGoodsOfShopper[_goods].itemIdList[idx].name, purchasedGoodsOfShopper[_goods].itemIdList[idx].price, purchasedGoodsOfShopper[_goods].itemIdList[idx].qty);
    }

    // Function for shopper to purchase an item
    function shopperPurchaseItemFromStore(address _StoreOwner, uint256 _item_idx, uint256 _qty)
    public
    payable
    m_isNotmarketplaceowner(msg.sender)
    m_isNotadministrator(msg.sender)
    m_isNotStoreOwner(msg.sender)
    returns(uint256) {
      require(storeCreated(_StoreOwner));
      require(storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].qty >= _qty);
      require(msg.value >= storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].price * _qty);
      // change storeOfMarketPlaceOwner info
      uint256 _price = storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].price;
      storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].qty = storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].qty.sub(_qty);
      storeOfMarketPlaceOwner[_StoreOwner].balance = storeOfMarketPlaceOwner[_StoreOwner].balance.add(msg.value);
      // change shopper infos
      purchasedGoodsOfShopper[msg.sender].itemIdList.push(Item({name:storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].name, price:_price,qty:_qty}));
      return storeOfMarketPlaceOwner[_StoreOwner].itemIdList[_item_idx].qty;
    }


    ///////////////////////////////////////////////////////////
    // Functions Related to administrators
    ///////////////////////////////////////////////////////////

    function deleteStoreOwnerToBe(address entityAddress)
    private
    m_isAdministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotmarketplaceowner(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isStoreOwnerToBe(entityAddress)
    m_isNotStoreOwner(entityAddress)
    m_isNotadministrator(entityAddress)
    m_isNotadministratorToBe(entityAddress)
    m_isNotmarketplaceowner(entityAddress)
    returns(bool) {
      uint256 rowToDelete = storeOwnersToBe[entityAddress].listPointer;
      address keyToMove   = storeOwnersToBeList[storeOwnersToBeList.length-1];
      storeOwnersToBeList[rowToDelete] = keyToMove;
      storeOwnersToBe[keyToMove].listPointer = rowToDelete;
      delete storeOwnersToBe[entityAddress];
      storeOwnersToBeList.length--;
      return true;
    }
    ///////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////
    // Transition functions
    ///////////////////////////////////////////////////////////

    // Shopper to Store marketplaceowner
    function isStoreOwnerToBe(address entityAddress)
    public
    constant
    returns(bool isIndeed) {
      if(storeOwnersToBeList.length == 0) return false;
      return (storeOwnersToBeList[storeOwnersToBe[entityAddress].listPointer] == entityAddress);
    }

    function nbStoreOwnersToBe()
    public
    constant
    returns(uint256 entityCount) {
      return storeOwnersToBeList.length;
    }

    function newStoreOwnerToBe(bool entityData)
    private
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotmarketplaceowner(msg.sender)
    returns(bool success) {
      storeOwnersToBe[msg.sender].entityData = entityData;
      storeOwnersToBe[msg.sender].listPointer = storeOwnersToBeList.push(msg.sender) - 1;
      return true;
    }



    // Shopper to administrator

    function isAdministratorToBe(address entityAddress)
    public
    constant
    returns(bool isIndeed){
      if (administratorsToBeList.length == 0) return false;
      return (administratorsToBeList[administratorsToBe[entityAddress].listPointer] == entityAddress);
    }

    function nbAdministratorsToBe()
    public
    constant
    returns(uint256 entityCount) {
      return administratorsToBeList.length;
    }
    function newAdministratorToBe(bool entityData)
    private
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotmarketplaceowner(msg.sender)
    returns(bool) {
      administratorsToBe[msg.sender].entityData = entityData;
      administratorsToBe[msg.sender].listPointer = administratorsToBeList.push(msg.sender) - 1;
      return true;
    }

    function deleteAdministratorToBe(address entityAddress)
    private
    m_ismarketplaceowner(msg.sender)
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotStoreOwnerToBe(entityAddress)
    m_isNotStoreOwner(entityAddress)
    m_isNotadministrator(entityAddress)
    m_isAdministratorToBe(entityAddress)
    m_isNotmarketplaceowner(entityAddress)
    returns(bool) {
      uint256 rowToDelete = administratorsToBe[entityAddress].listPointer;
      address keyToMove   = administratorsToBeList[administratorsToBeList.length-1];
      administratorsToBeList[rowToDelete] = keyToMove;
      administratorsToBe[keyToMove].listPointer = rowToDelete;
      // administratorsToBe[entityAddress].entityData = false;
      delete administratorsToBe[entityAddress];
      administratorsToBeList.length--;
      return true;
    }

    function isAdministrator(address entityAddress)
    public
    constant
    returns(bool isIndeed) {
      if(administratorsList.length == 0) return false;
      return (administratorsList[administrators[entityAddress].listPointer] == entityAddress);
    }
    function nbAdministrators()
    public
    constant
    returns(uint256 entityCount) {
      return administratorsList.length;
    }
    function newAdministrator(address entityAddress, bool entityData)
    private
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_ismarketplaceowner(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotStoreOwnerToBe(entityAddress)
    m_isNotStoreOwner(entityAddress)
    m_isNotadministrator(entityAddress)
    m_isNotadministratorToBe(entityAddress) // Has to be removed first
    m_isNotmarketplaceowner(entityAddress)
    returns(bool success) {
      administrators[entityAddress].entityData = entityData;
      administrators[entityAddress].listPointer = administratorsList.push(entityAddress) - 1;
      return true;
    }

    function updateAdministrator(address entityAddress, bool entityData)
    private
    returns(bool success) {
      administrators[entityAddress].entityData = entityData;
      return true;
    }

    function shopperWantsToBeAdministrator ()
    public
    m_isNotmarketplaceowner(msg.sender)
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    returns (bool) {
        return newAdministratorToBe(true);
    }

    function administratorEnroll(address _administratorToBe)
    public
    m_ismarketplaceowner(msg.sender)
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotadministrator(_administratorToBe)
    m_isAdministratorToBe(_administratorToBe)
    m_isNotStoreOwner(_administratorToBe)
    m_isNotStoreOwnerToBe(_administratorToBe)
    m_isNotmarketplaceowner(_administratorToBe)
    returns(uint256) {
      if (!deleteAdministratorToBe(_administratorToBe)) {
        revert();
      }
      if (!newAdministrator(_administratorToBe, true)) {
        revert();
      }
      return nbAdministrators();
    }


    // Shopper to Store marketplaceowner
    function shopperWantsToBeStoreOwner()
    public
    m_isNotmarketplaceowner(msg.sender)
    m_isNotadministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    returns(bool){
      return newStoreOwnerToBe(true);
    }

    function administratorApprovesStoreOwner(address _StoreOwner)
    public
    m_isNotmarketplaceowner(msg.sender)
    m_isAdministrator(msg.sender)
    m_isNotadministratorToBe(msg.sender)
    m_isNotStoreOwner(msg.sender)
    m_isNotStoreOwnerToBe(msg.sender)
    m_isNotadministrator(_StoreOwner)
    m_isNotadministratorToBe(_StoreOwner)
    m_isNotStoreOwner(_StoreOwner)
    m_isStoreOwnerToBe(_StoreOwner)
    m_isNotmarketplaceowner(_StoreOwner)
    returns(uint256) {
      if (!deleteStoreOwnerToBe(_StoreOwner)) {
        revert();
      }
      if (!newStoreOwner(_StoreOwner, true)) {
        revert();
      }
      return nbStoreOwners();
    }
    ///////////////////////////////////////////////////////////


    ///////////////////////////////////////////////////////////
    // Other Functions
    ///////////////////////////////////////////////////////////
    function getRole()
    public view
    returns (uint256) {
      if (msg.sender == MarketPlaceOwner) {
        return(0);
      }
      if (isAdministrator(msg.sender)) {
        return(1);
      }
      if (isStoreOwner(msg.sender)) {
        return(2);
      }
      return(3);
    }

    function getMarketPlaceOwner()
    public view
    returns(address) {
      return(MarketPlaceOwner);
    }

    // Kill deployed contract
        function kill() public {
          if (msg.sender == MarketPlaceOwner) {
            selfdestruct(MarketPlaceOwner);
          }
        }

    // Fallback function
    function () public {
        revert();
    }
}
