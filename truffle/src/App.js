import React, { Component } from 'react'
import Marketplace from '../build/contracts/Marketplace.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

function displayRole(role) {
    if (role === 0) {
      document.getElementById("role").innerHTML ="<h1>Market Place Owner of the Vinyl Marketplace</h1><p> You can approve administrator. </p>"
    } else if (role === 1) {
      document.getElementById("role").innerHTML = "<h1>Administrator</h1>"
    } else if (role === 2) {
      document.getElementById("role").innerHTML = "<h1>Store Owner. Start selling some Vinyl!</h1>"
    } else if (role === 3) {
      document.getElementById("role").innerHTML = "<h1>Shopper. Start buying some Vinyl</h1>"
    }
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      contract: null,
      account: null,
      role: null,
      marketplaceowner:null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const marketplace = contract(Marketplace)
    marketplace.setProvider(this.state.web3.currentProvider)

    // Declaring this for later so we can chain functions on SimpleStorage.
    var marketplaceInstance

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      // Marketplace
      marketplace.deployed().then((instance) => {
        marketplaceInstance = instance
        this.setState({account:accounts[0]})
        this.setState({contract:marketplaceInstance})
        return marketplaceInstance.getRole.call({from:accounts[0]})
      }).then((result) => {
        this.setState({role:result.c[0]})
        displayRole(this.state.role)
        if (this.state.role === 0) {
          this.displayMarketPlaceOwnerActions(marketplaceInstance, accounts[0])
        }
        else if (this.state.role === 1) {
          this.displayAdministratorActions(marketplaceInstance, accounts[0])
        }
        else if (this.state.role === 2) {
          this.displayStoreOwnerActions(marketplaceInstance, accounts[0])
        }
        else if (this.state.role === 3) {
          this.displayShopperActions(marketplaceInstance, accounts[0])
        }
        return marketplaceInstance.nbAdministratorsToBe.call({from:accounts[0]})
      }).then((result) => {
      })
    })
  }


  handleShopperBecomeStoreOwner(event) {
    const contract = this.state.contract

    return this.state.web3.eth.getAccounts((error, accounts) => {
      contract.shopperWantsToBeStoreOwner({from:accounts[0]}).then((result) => {
        return contract.nbStoreOwners.call()
      }).then((result) => {
      })
    })
  }

  handleShopperBecomeAdministrator(event) {
    const contract = this.state.contract

    return this.state.web3.eth.getAccounts((error, accounts) => {
      contract.shopperWantsToBeAdministrator({from:accounts[0]}).then((result) => {
        return contract.nbAdministratorsToBe.call()
      }).then((result) => {
      })
    })
  }

  handleCreateStore(event) {
    const contract = this.state.contract

    return this.state.web3.eth.getAccounts((error, accounts) => {
      contract.createStore({from:accounts[0]}).then((result) => {
      })
    })
  }

  handleShopperPurchase(event) {
    const contract = this.state.contract
    return this.state.web3.eth.getAccounts((error, accounts) => {
      var text_purchase_store_marketplaceowner = document.getElementById('purchase_store_marketplaceowner').value
      var text_purchase_item_id = document.getElementById('purchase_item_id').value
      var text_purchase_item_qty = document.getElementById('purchase_item_qty').value
      var text_purchase_value = document.getElementById('purchase_value').value
      contract.shopperPurchaseItemFromStore(text_purchase_store_marketplaceowner, text_purchase_item_id, text_purchase_item_qty, {from:accounts[0], value:this.state.web3.toWei(text_purchase_value, 'ether')}).then((result) => {
      })
    })
  }

  displayShopperActions(marketplaceInstance) {
    const contract = this.state.contract
    // Request to become an administrator
    var btn = document.createElement("INPUT");
    btn.className="btn btn-danger btn-xs";
    btn.type = "button";
    btn.name = "add";
    btn.value="Request to Become an Administrator";
    btn.onclick = this.handleShopperBecomeAdministrator.bind(this);

    // Request to become a Store marketplaceowner
    var btn2 = document.createElement("INPUT");
    btn2.type = "button";
    btn2.name = "add";
    btn2.value="Request to Become a Store Owner";
    btn2.className="btn btn-primary";
    btn2.onclick = this.handleShopperBecomeStoreOwner.bind(this);

    document.getElementById("availableRoleAction").appendChild(btn);
    document.getElementById("availableRoleAction").appendChild(btn2);

    // Display stores
    this.state.web3.eth.getAccounts((error, accounts) => {
      contract.nbStoreOwners.call().then((result) => {
        var nb_store_marketplaceowner = result.c[0];
        for (var i = 0 ; i < nb_store_marketplaceowner ; i++) {
          contract.storeOwnersList(i, {from:accounts[0]}).then((result) => {
            var c_store_marketplaceowner = result;
            contract.storeCreated.call(c_store_marketplaceowner, {from:accounts[0]}).then((result) => {
              if (result) {
                this.displayStore(c_store_marketplaceowner);
              }
            })
          })
        }

        // Display form for Purshase
        var iDiv = document.createElement('div');
        iDiv.className = "container"
        var title = document.createElement('h3')
        iDiv.appendChild(title);
        title.appendChild(document.createTextNode('Purchase an Item'))
        var form = document.createElement('form');
        form.className = "form-horizontal"
        var iDiv2 = document.createElement('div');
        iDiv2.className = "form-group"
        var lbl = document.createElement('label');
        lbl.className = "control-label col-sm-2"
        lbl.appendChild(document.createTextNode("Address"))
        iDiv2.appendChild(lbl)
        var iDiv3 = document.createElement('div');
        iDiv3.className = "col-sm-10"
        var ipt = document.createElement('input')
        ipt.type = "item name"
        ipt.className = "form-control"
        ipt.placeholder = "Enter store owner address"
        ipt.id = "purchase_store_marketplaceowner"
        iDiv3.appendChild(ipt);
        iDiv2.appendChild(iDiv3);
        form.appendChild(iDiv2);

        var iDiv2 = document.createElement('div');
        iDiv2.className = "form-group"
        var lbl = document.createElement('label');
        lbl.className = "control-label col-sm-2"
        lbl.appendChild(document.createTextNode("Id"))
        iDiv2.appendChild(lbl)
        var iDiv3 = document.createElement('div');
        iDiv3.className = "col-sm-10"
        var ipt = document.createElement('input')
        ipt.type = "item name"
        ipt.className = "form-control"
        ipt.placeholder = "Enter item id"
        ipt.id = "purchase_item_id"
        iDiv3.appendChild(ipt);
        iDiv2.appendChild(iDiv3);
        form.appendChild(iDiv2);

        var iDiv2 = document.createElement('div');
        iDiv2.className = "form-group"
        var lbl = document.createElement('label');
        lbl.className = "control-label col-sm-2"
        lbl.appendChild(document.createTextNode("Quantity"))
        iDiv2.appendChild(lbl)
        var iDiv3 = document.createElement('div');
        iDiv3.className = "col-sm-10"
        var ipt = document.createElement('input')
        ipt.type = "item name"
        ipt.className = "form-control"
        ipt.placeholder = "Enter item quantity"
        ipt.id = "purchase_item_qty"
        iDiv3.appendChild(ipt);
        iDiv2.appendChild(iDiv3);
        form.appendChild(iDiv2);
        iDiv.appendChild(form);
        document.getElementById("availableRoleAction").appendChild(iDiv);

        var iDiv2 = document.createElement('div');
        iDiv2.className = "form-group"
        var lbl = document.createElement('label');
        lbl.className = "control-label col-sm-2"
        lbl.appendChild(document.createTextNode("Value"))
        iDiv2.appendChild(lbl)
        var iDiv3 = document.createElement('div');
        iDiv3.className = "col-sm-10"
        var ipt = document.createElement('input')
        ipt.type = "item name"
        ipt.className = "form-control"
        ipt.placeholder = "Enter transaction value"
        ipt.id = "purchase_value"
        iDiv3.appendChild(ipt);
        iDiv2.appendChild(iDiv3);
        form.appendChild(iDiv2);
        iDiv.appendChild(form);
        document.getElementById("availableRoleAction").appendChild(iDiv);

        var br = document.createElement("br");
        document.getElementById("availableRoleAction").appendChild(br);
        var btnPurchase = document.createElement("INPUT");  // BUTTON
        btnPurchase.className="btn btn-success";
        btnPurchase.type = "button";
        btnPurchase.name = "add";
        btnPurchase.value="Purchase";
        btnPurchase.onclick = this.handleShopperPurchase.bind(this);
        document.getElementById("availableRoleAction").appendChild(btnPurchase);

        var white_space = document.createElement("br");
        document.getElementById("availableRoleAction").appendChild(white_space);

        var white_space2 = document.createElement("br");
        document.getElementById("availableRoleAction").appendChild(white_space2);

      })

      var white_space = document.createElement("br");
      document.getElementById("availableRoleAction").appendChild(white_space);


      // Display Purchased Goods
      contract.nbPurchasedGoods.call(accounts[0]).then((result) => {
        if (result) {
          this.displayPurchasedGoods(accounts[0]);

        }
      })
    })
  }


  displayStore(account) {
    const contract = this.state.contract

    this.state.web3.eth.getAccounts((error, accounts) => {
      contract.nbItemsInStore.call(account).then((result) => {
        var nb_items = result.c[0]
        var iDiv = document.createElement('div');
        // header
        var title = document.createElement('p');
        title.appendChild(document.createTextNode('Store: ' + account))
        iDiv.appendChild(title);
        // table caracteristics
        var tbl = document.createElement('table')
        tbl.className = "table table-striped"
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        // table head
        var thead = document.createElement('thead');
        tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode('Id'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Name'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Price'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Quantity'))
        tr.appendChild(td);
        thead.appendChild(tr);

        // table body
        var tbdy = document.createElement('tbody');
        var tr = document.createElement('tr');
        for (var i = 0; i < nb_items; i++) {
          contract.infoItemGivenId(account, i, {from:accounts[0]}).then((result) => {
            var trr = document.createElement('tr');
            var tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[0]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[1]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[2]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[3]))
            trr.appendChild(tdd)
            tbdy.appendChild(trr);
          })
        }

        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        iDiv.appendChild(tbl);
        document.getElementById("availableRoleAction").appendChild(iDiv);
    })
  })

  }

  displayPurchasedGoods(account) {
    const contract = this.state.contract

    this.state.web3.eth.getAccounts((error, accounts) => {
      contract.nbPurchasedGoods.call(account).then((result) => {
        var nb_items = result.c[0]
        var iDiv = document.createElement('div');
        // header
        var title = document.createElement('p');
        title.appendChild(document.createTextNode('Purchased Goods'))
        iDiv.appendChild(title);
        // table characteristics
        var tbl = document.createElement('table')
        tbl.className = "table table-bordered"
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        // table head
        var thead = document.createElement('thead');
        tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode('Id'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Name'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Price'))
        tr.appendChild(td)
        td = document.createElement('td');
        td.appendChild(document.createTextNode('Quantity'))
        tr.appendChild(td);
        thead.appendChild(tr);

        // table body
        var tbdy = document.createElement('tbody');
        var tr = document.createElement('tr');
        var td = document.createElement('td');

        for (var i = 0; i < nb_items; i++) {
          contract.infoPurchasedGoodsGivenId(account, i, {from:accounts[0]}).then((result) => {
            var trr = document.createElement('tr');
            var tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[0]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[1]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[2]))
            trr.appendChild(tdd)
            tdd = document.createElement('td');
            tdd.appendChild(document.createTextNode(result[3]))
            trr.appendChild(tdd)
            tbdy.appendChild(trr);
          })
        }

        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        iDiv.appendChild(tbl);
        document.getElementById("availableRoleAction").appendChild(iDiv);

        var white_space = document.createElement("br");
        document.getElementById("availableRoleAction").appendChild(white_space);

        var white_space2 = document.createElement("br");
        document.getElementById("availableRoleAction").appendChild(white_space2);

    })
  })
  }

  StoreOwnerAddItem(event) {
    const contract = this.state.contract

    return this.state.web3.eth.getAccounts((error, accounts) => {
      var item_name = document.getElementById('item_name').value
      var item_price = document.getElementById('item_price').value
      var item_qty = document.getElementById('item_qty').value
      contract.addItemToStore(item_name, item_price, item_qty, {from:accounts[0]}).then((result) => {
      })
    })
  }

  StoreOwnerWithdrawsFund(event) {
    const contract = this.state.contract
    return this.state.web3.eth.getAccounts((error, accounts) => {
      contract.StoreOwnerWithdrawsFund({from:accounts[0]}).then((res) => {
        contract.getStoreOwnerBalance({from:accounts[0]}).then((res) => {
        })
      });
    })
  }

  displayStoreOwnerActions() {
    const contract = this.state.contract

    this.state.web3.eth.getAccounts((error, accounts) => {
      contract.storeCreated.call(accounts[0], {from:accounts[0]}).then((result) => {
        if (result) {
          // Display Balance :
          contract.getStoreOwnerBalance.call({from:accounts[0]}).then((res) => {
            var t = document.createElement('h4');
            var space = document.createElement('br');
            var space2 = document.createElement('br');
            t.appendChild(space)
            t.appendChild(space2)
            t.appendChild(document.createTextNode("You have "+res/1000000000000000000+" ETH"));
            t.appendChild(space)
            var btnWithdrawFund = document.createElement("input");
            btnWithdrawFund.className="btn btn-success";
            btnWithdrawFund.type = "button";
            btnWithdrawFund.name = "add";
            btnWithdrawFund.value="Withdraw Funds";
            btnWithdrawFund.onclick = this.StoreOwnerWithdrawsFund.bind(this);
            document.getElementById("availableRoleAction").appendChild(t);
            document.getElementById("availableRoleAction").appendChild(btnWithdrawFund);
            document.getElementById("availableRoleAction").appendChild(space);
            document.getElementById("availableRoleAction").appendChild(space2);
          })
          // Form for adding item
          var iDiv = document.createElement('div');
          iDiv.className = "container"
          var title = document.createElement('p')
          iDiv.appendChild(title);
          title.appendChild(document.createTextNode('Add an item to your store'))
          var form = document.createElement('form');
          form.className = "form-horizontal"
          var iDiv2 = document.createElement('div');
          iDiv2.className = "form-group"
          var lbl = document.createElement('label');
          lbl.className = "control-label col-sm-2"
          lbl.appendChild(document.createTextNode("Name"))
          iDiv2.appendChild(lbl)
          var iDiv3 = document.createElement('div');
          iDiv3.className = "col-sm-10"
          var ipt = document.createElement('input')
          ipt.type = "item name"
          ipt.className = "form-control"
          ipt.placeholder = "Enter item name"
          ipt.id = "item_name"
          iDiv3.appendChild(ipt);
          iDiv2.appendChild(iDiv3);
          form.appendChild(iDiv2);

          var iDiv2 = document.createElement('div');
          iDiv2.className = "form-group"
          var lbl = document.createElement('label');
          lbl.className = "control-label col-sm-2"
          lbl.appendChild(document.createTextNode("Price"))
          iDiv2.appendChild(lbl)
          var iDiv3 = document.createElement('div');
          iDiv3.className = "col-sm-10"
          var ipt = document.createElement('input')
          ipt.type = "item name"
          ipt.className = "form-control"
          ipt.placeholder = "Enter item price"
          ipt.id = "item_price"
          iDiv3.appendChild(ipt);
          iDiv2.appendChild(iDiv3);
          form.appendChild(iDiv2);

          var iDiv2 = document.createElement('div');
          iDiv2.className = "form-group"
          var lbl = document.createElement('label');
          lbl.className = "control-label col-sm-2"
          lbl.appendChild(document.createTextNode("Quantity"))
          iDiv2.appendChild(lbl)
          var iDiv3 = document.createElement('div');
          iDiv3.className = "col-sm-10"
          var ipt = document.createElement('input')
          ipt.type = "item name"
          ipt.className = "form-control"
          ipt.placeholder = "Enter item quantity"
          ipt.id = "item_qty"
          iDiv3.appendChild(ipt);
          iDiv2.appendChild(iDiv3);
          form.appendChild(iDiv2);
          iDiv.appendChild(form)
          var btn = document.createElement("BUTTON");
          var t = document.createTextNode("Add");
          btn.appendChild(t);
          btn.onclick = this.StoreOwnerAddItem.bind(this);
          iDiv.appendChild(btn);
          document.getElementById("availableRoleAction").appendChild(iDiv);
          // display Store
          this.displayStore(accounts[0])
        }
        else {
          // Create a Store
          var btn = document.createElement("BUTTON");
          var t = document.createTextNode("Create a Store");
          btn.appendChild(t);
          btn.onclick = this.handleCreateStore.bind(this);
          document.getElementById("availableRoleAction").appendChild(btn);
        }
        })
    })
  }

  displayAdministratorActions() {
    const contract = this.state.contract
    this.state.web3.eth.getAccounts((error, accounts) => {
      // Table of current Store marketplaceowners
      contract.nbStoreOwners.call({from:accounts[0]}).then((result) => {
        var nb_store_marketplaceowner = result.c[0];
        var iDiv = document.createElement('div');
        // table caracteristics
        var tbl = document.createElement('table')
        tbl.className = "table table-striped"
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        // table head
        var thead = document.createElement('thead');
        tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode('Approved Store Owners'))
        tr.appendChild(td)
        thead.appendChild(tr);
        // table body
        var tbdy = document.createElement('tbody');
        var tr = document.createElement('tr');

        for (var i = 0; i < nb_store_marketplaceowner; i++) {
          contract.storeOwnersList(i, {from:accounts[0]}).then((result) => {
            var trr = document.createElement('tr');
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(result));
            trr.appendChild(td)
            tbdy.appendChild(trr);
          });
        }
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        iDiv.appendChild(tbl);
        document.getElementById("availableRoleAction").appendChild(iDiv);
      }).then((result) => {
        // Table of people who want to be administrator
        contract.nbStoreOwnersToBe.call({from:accounts[0]}).then((result) => {
          var nb_store_marketplaceowner_to_Be = result.c[0]
          var iDiv = document.createElement('div');
          // table caracteristics
          var tbl = document.createElement('table')
          tbl.className = "table table-striped"
          tbl.style.width = '100%';
          tbl.setAttribute('border', '1');
          // table head
          var thead = document.createElement('thead');
          tr = document.createElement('tr');
          var td = document.createElement('td');
          td.appendChild(document.createTextNode('Store Owners To Be'))
          tr.appendChild(td)
          thead.appendChild(tr);
          tbl.appendChild(thead);
          var tbdy = document.createElement('tbody');
          var tr = document.createElement('tr');

          for (var i = 0; i < nb_store_marketplaceowner_to_Be; i++) {
            contract.storeOwnersToBeList(i, {from:accounts[0]}).then((result) => {
              var trr = document.createElement('tr');
              var td = document.createElement('td');
              td.appendChild(document.createTextNode(result));
              trr.appendChild(td)
              tbdy.appendChild(trr);
            });
          }
          tbl.appendChild(tbdy);
          iDiv.appendChild(tbl);
          // Button for making an administrator
          var text_address_input = document.createElement("INPUT");
          text_address_input.setAttribute("id", "StoreOwner_to_Be");
          text_address_input.setAttribute("placeholder", "Enter address here");
          iDiv.appendChild(text_address_input);
          var btn = document.createElement("INPUT");
          btn.className="btn btn-primary";
          btn.type = "button";
          btn.name = "add";
          btn.value="Approve Store Owner To Be";
          btn.onclick = this.administratorMakeStoreOwner.bind(this);
          iDiv.appendChild(btn);
          document.getElementById("availableRoleAction").appendChild(iDiv);
        })
      })

    })

  }

  displayMarketPlaceOwnerActions() {
    const contract = this.state.contract
    var nbadministratorToBe

    this.state.web3.eth.getAccounts((error, accounts) => {
      // Table of current administrator
      contract.nbAdministrators.call({from:accounts[0]}).then((result) => {
        var nb_administrator = result.c[0];
        var iDiv = document.createElement('div');
        // table caracteristics
        var tbl = document.createElement('table')
        tbl.className = "table table-striped"
        tbl.style.width = '100%';
        tbl.setAttribute('border', '1');
        // table head
        var thead = document.createElement('thead');
        tr = document.createElement('tr');
        var td = document.createElement('td');
        td.appendChild(document.createTextNode('Approved Administrators'))
        tr.appendChild(td)
        thead.appendChild(tr);
        // table body
        var tbdy = document.createElement('tbody');
        var tr = document.createElement('tr');
        for (var i = 0; i < nb_administrator; i++) {
          contract.administratorsList(i, {from:accounts[0]}).then((result) => {
            var trr = document.createElement('tr');
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(result));
            trr.appendChild(td)
            tbdy.appendChild(trr);
          });
        }
        tbl.appendChild(thead);
        tbl.appendChild(tbdy);
        iDiv.appendChild(tbl);
        document.getElementById("availableRoleAction").appendChild(iDiv);
      }).then((result) => {
        // Table of people who want to be administrator
        contract.nbAdministratorsToBe.call({from:accounts[0]}).then((result) => {
          nbadministratorToBe = result.c[0]
          var iDiv = document.createElement('div');
          // table caracteristics
          var tbl = document.createElement('table')
          tbl.className = "table table-striped"
          tbl.style.width = '100%';
          tbl.setAttribute('border', '1');
          // table head
          var thead = document.createElement('thead');
          tr = document.createElement('tr');
          var td = document.createElement('td');
          td.appendChild(document.createTextNode('Administrators To Be'))
          tr.appendChild(td)
          thead.appendChild(tr);
          // table body
          var tbdy = document.createElement('tbody');
          var tr = document.createElement('tr');
          for (var i = 0; i < nbadministratorToBe; i++) {
            contract.administratorsToBeList(i, {from:accounts[0]}).then((result) => {
              var trr = document.createElement('tr');
              var td = document.createElement('td');
              td.appendChild(document.createTextNode(result));
              trr.appendChild(td)
              tbdy.appendChild(trr);
            });
          }
          tbl.appendChild(thead);
          tbl.appendChild(tbdy);
          iDiv.appendChild(tbl);

          // Button for making an admin
          var text_address_input = document.createElement("INPUT");
          text_address_input.setAttribute("id", "address_to_Be");
          text_address_input.setAttribute("placeholder", "Enter address here");
          var btn = document.createElement("INPUT");
          btn.className="btn btn-primary";
          btn.type = "button";
          btn.name = "add";
          btn.value="Approve Administrator To Be";
          btn.onclick = this.marketPlaceOwnerMakeAdministrator.bind(this);
          iDiv.appendChild(text_address_input);
          iDiv.appendChild(btn);
          document.getElementById("availableRoleAction").appendChild(iDiv);
        })
      }).then((res) => {

      })
    })
  }


  administratorMakeStoreOwner(event) {
    const contract = this.state.contract
    return this.state.web3.eth.getAccounts((error, accounts) => {
      var the_StoreOwner_address_to_Be = document.getElementById('StoreOwner_to_Be').value
      contract.administratorApprovesStoreOwner(the_StoreOwner_address_to_Be, {from:accounts[0]}).then((result) => {
      })
    })
  }

  marketPlaceOwnerMakeAdministrator(event) {
    const contract = this.state.contract
    return this.state.web3.eth.getAccounts((error, accounts) => {
      var the_administrator_address_to_Be = document.getElementById('address_to_Be').value
      contract.administratorEnroll(the_administrator_address_to_Be, {from:accounts[0]}).then((result) => {
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Consensys Academy - VinyL Marketplace DApp</a>
        </nav>
        <img src="https://www.mynsu.co.uk/asset/Organisation/6812/vinyl_logo_1.jpg?thumbnail_width=1140&thumbnail_height=620&resize_type=ResizeFitAllFill" alt="logo" width="300" height="200"></img>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <div id="role"></div>
              <div id="availableRoleAction"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
