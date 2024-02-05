// ==UserScript==
// @name MAM Favorites Menu
// @namespace Humdinger
// @author Humdinger
// @description Adds menu to top of screen with custom favorites
// @icon https://cdn.myanonamouse.net/imagebucket/204586/MouseyIcon.png
// @run-at       document-finish
// @match        https://www.myanonamouse.net/*
// @version 0.1.0
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @license MIT
// @homepage     https://www.myanonamouse.net
// ==/UserScript==
// Icon Image by https://www.freepik.com/free-vector/flat-mice-collection-with-different-poses_1593656.htm#query=cute%20mouse&position=0&from_view=keyword&track=ais

// Setup
var debug = GM_getValue("MAMFaves_debug", true);
var logPrefix = "[MAMFaveMenu] ";

// Get the javascript object from the GM storage
var menuItems = GM_getValue("favorites", {});

// Adding a favorite from the menu action
if ( !(sessionStorage.addFave === undefined) ) {
    var bmName = sessionStorage.getItem('newBMName');
    var bmUrl = sessionStorage.getItem('bookmark');

    menuItems[bmName] = bmUrl;
    GM_setValue('favorites', menuItems);
    sessionStorage.removeItem('addFave');
    sessionStorage.removeItem('newBMName');
    sessionStorage.removeItem('bookmark');
}

// Removing a favorite from the preferences page
if ( !(sessionStorage.remFave === undefined) ) {
    bmName = sessionStorage.getItem('bmName');
    delete menuItems[bmName];
    GM_setValue('favorites', menuItems);
    sessionStorage.removeItem('remFave');
    sessionStorage.removeItem('bmName');
}

// Update the favorites from the preferences page and from the raw JSON import
if ( !(sessionStorage.menuItems === undefined) ) {
    try {
      GM_setValue("favorites", JSON.parse(sessionStorage.menuItems));
      menuItems = JSON.parse(sessionStorage.menuItems);
    } catch {
      alert("There was an error parsing the JSON string");
    }
    sessionStorage.removeItem('menuItems');
}

// Download the raw JSON of the favorites
if (!(sessionStorage.showRaw === undefined) ) {
    var rawJSON = JSON.stringify(GM_getValue("favorites"), null, 4);
    var blob = new Blob([rawJSON], {type: "text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.download = "MAMFavorites.json";
    a.innerHTML = "Download";
    a.href = url;
    a.click();
    sessionStorage.removeItem('showRaw');
}

if (!(sessionStorage.deleteFaves === undefined)) {
    GM_deleteValue('favorites');
    sessionStorage.removeItem('deleteFaves');
}

// List item for the menu
var newMenuElement = document.createElement('li');
newMenuElement.classList = "mmFG";
newMenuElement.role = "presentation";
newMenuElement.innerHTML = '<a tabindex="0" id="favMenu" aria-haspopup="true">Fave Links ↓</a>';

// Create the unordered list for the menu items
// This one is hidden by default and will show the menu when it is hovered over
var newMenuUl = document.createElement('ul');
newMenuUl.role = "menu";
newMenuUl.ariaLabelledby = "favMenu";
newMenuUl.classList = "hidden";

// Add the 'Add Fave' and 'Manage Faves' menu items
// First we create the list item for the Add Fave menu item
var addFaveMenuElement = document.createElement('li');
addFaveMenuElement.role = "presentation";

// Add the Add Fave menu item Anchor with the onclick function
var addFaveAnchor = document.createElement('a');
addFaveAnchor.role = "menuitem";
addFaveAnchor.tabindex = "0";
addFaveAnchor.id = "addFave";
addFaveAnchor.innerHTML = "Add Fave";
addFaveAnchor.onclick = function() {
  var newBMName = prompt('Give a name for the bookmark');
  var bookmark = window.location.pathname + window.location.search;

  sessionStorage.setItem('addFave', true);
  sessionStorage.setItem('newBMName', newBMName);
  sessionStorage.setItem('bookmark', bookmark);

  window.location.reload();
};
addFaveMenuElement.appendChild(addFaveAnchor);
newMenuUl.appendChild(addFaveMenuElement);

// Now time for the Manage Faves menu item (a bit simpler)
var manageFavesMenuElement = document.createElement('li');
manageFavesMenuElement.role = "presentation";
manageFavesMenuElement.innerHTML = '<a href="https://www.myanonamouse.net/preferences/index.php?view=faves" role="menuitem" tabindex="0" id="manageFaves">Manage</a>';
newMenuUl.appendChild(manageFavesMenuElement);

// Add a separator for asthetics
newMenuUl.appendChild(document.createElement('hr'));

// Add the menu items from the GM storage (grabbed at the beginning of the script)
// Loop through the menu items to add each as a list item
for (const key in menuItems) {
      var newMenuItem = document.createElement('li');
      newMenuItem.role = "presentation";
      newMenuItem.innerHTML = '<a role="menuitem" tabindex="0" href="' + menuItems[key] + '">' + key + '</a>';
      newMenuUl.appendChild(newMenuItem);
}

// Append the unordered list to the menu element
newMenuElement.appendChild(newMenuUl);

// Append it to the menu div
document.getElementById("menu").appendChild(newMenuElement);
// End of adding new menu

// Inject the scripts needed for the preferences page
// As well as the page/tab for managing the favorites
if ( window.location == "https://www.myanonamouse.net/preferences/index.php?view=faves" ) {
  var headSec = document.getElementsByTagName("head")[0];
  var newScript = document.createElement('script');
  newScript.innerHTML = `function remFavorite(Name) {
    sessionStorage.setItem('remFave', true);
    sessionStorage.setItem('bmName', Name);
    window.location.reload();
  }`;
    headSec.appendChild(newScript);

    var storedMenuItems = GM_getValue("favorites");
    var myHeader = document.getElementsByTagName("h1")[0];
    myHeader.innerHTML = "My MAM Favorites";
    var myParent = myHeader.parentNode;
    myParent.removeChild(myHeader.nextSibling);

    var newElement = document.createElement('table');
    newElement.style = "margin-left:auto;margin-right:auto;";
    newElement.innerHTML = "<th>Order</th><th>Favorite</th><th></th>";
    var count = 10;
    for (const key in GM_getValue("favorites")) {
        if ( key != "extend") {
            newElement.innerHTML += "<td><input id=\"" + key + "_order\" class='orderBoxes' type='text' size='3' value='" + count + "' /></td><td style='text-align:left;'><a id=\"" + key + "_link\" href='https://www.myanonamouse.net" + GM_getValue("favorites")[key] + "'>" + key + "</a></td><td><button onclick='remFavorite(\"" + key + "\")'>Rem</button></td>";
            count += 10;
        }
    }
    //newElement.innerHTML += "<td>" + key + "</td><td>" + value + "</td>";
    myParent.appendChild(newElement);

    var updateButton = document.createElement('button');
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
      var allElements = document.getElementsByClassName('orderBoxes');

      var tempArr = [];
      for (var i = 0; i < allElements.length; i++) {
        var bmName = allElements[i].id.substring(0, allElements[i].id.length - 6);
        var bmLink = document.getElementById(bmName + "_link").href;
        bmLink = bmLink.substring(28);
        var bmOrder = allElements[i].value;

        tempArr[bmOrder] = bmName + ":" + bmLink;
      }

      var menuItems = {}
      for (i = 0; i < tempArr.length; i++) {
        if (!(tempArr[i] === undefined)) {
          menuItems[tempArr[i].substring(0,tempArr[i].search(':'))] = tempArr[i].substring(tempArr[i].search(':') + 1);
        }
      }
      sessionStorage.setItem('menuItems', JSON.stringify(menuItems));
      window.location.reload();
    };
    myParent.appendChild(updateButton);

    var rawButton = document.createElement('button');
    rawButton.innerHTML = "Raw JSON";
    rawButton.onclick = function() {
      sessionStorage.setItem('showRaw', true);
      window.location.reload();
    };
    myParent.appendChild(rawButton);

    var importButton = document.createElement('button');
    importButton.innerHTML = "Raw Import";
    importButton.onclick = function() {
      var rawMenuItems = prompt("Paste the raw JSON string containing your favorites");

      if (!(rawMenuItems === null)) {
        sessionStorage.setItem('menuItems', rawMenuItems);
        window.location.reload();
      }
    };
    myParent.appendChild(importButton);

    var hrElement = document.createElement('hr');
    hrElement.style = "margin-top: 10px; margin-bottom: 10px;width: 100px;";
    myParent.appendChild(hrElement);

    var deleteButton = document.createElement('button');
    deleteButton.innerHTML = "Delete Faves";
    deleteButton.onclick = function() {
        var deleteFaves = confirm("Are you sure you want to delete all your favorites?");
        if (deleteFaves) {
          GM_deleteValue('favorites');
          window.location.reload();
        }
    };
    myParent.appendChild(deleteButton);
}

// Add the tab for the favorites to the preferences page
if (document.title.includes("Preferences")) {
    var menuTable = document.getElementsByTagName("table")[1].firstChild.firstChild;
    var newTD = document.createElement('td');
    newTD.classList = "row2 cen torSearchNavBox";
    newTD.style = "display:inline-block";
    newTD.innerHTML = '<a href="/preferences/index.php?view=faves">MAM Faves</a>';
    menuTable.insertBefore(newTD, menuTable.children[8]);
}
