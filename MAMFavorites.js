// ==UserScript==
// @name MAM Favorites Menu
// @namespace Humdinger
// @author Humdinger
// @description Adds menu to top of screen with custom favorites
// @icon https://cdn.myanonamouse.net/imagebucket/204586/MouseyIcon.png
// @run-at       document-finish
// @match        https://www.myanonamouse.net/*
// @version 0.1.1
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @license MIT
// @homepage     https://www.myanonamouse.net
// ==/UserScript==
// Icon Image by https://www.freepik.com/free-vector/flat-mice-collection-with-different-poses_1593656.htm#query=cute%20mouse&position=0&from_view=keyword&track=ais

// Get settings from GM storage
var debug = GM_getValue("MAMFaves_debug", false);
var menuTitle = GM_getValue("MAMFaves_menuTitle", "Favorites");
var menuItems = GM_getValue("MAMFaves_favorites", {});
var logPrefix = "[MAMFaveMenu] ";
console.log(logPrefix + "Debug value from GM is " + debug);

// Adding a favorite from the menu action
if ( !(sessionStorage.addFave === undefined) ) {
    var bmName = sessionStorage.getItem('newBMName');
    var bmUrl = sessionStorage.getItem('bookmark');

    menuItems[bmName] = bmUrl;
    GM_setValue('MAMFaves_favorites', menuItems);
    sessionStorage.removeItem('addFave');
    sessionStorage.removeItem('newBMName');
    sessionStorage.removeItem('bookmark');
}

// Removing a favorite from the preferences page
if ( !(sessionStorage.remFave === undefined) ) {
    bmName = sessionStorage.getItem('bmName');
    delete menuItems[bmName];
    GM_setValue('MAMFaves_favorites', menuItems);
    sessionStorage.removeItem('remFave');
    sessionStorage.removeItem('bmName');
}

// Update the favorites from the preferences page and from the raw JSON import
if ( !(sessionStorage.menuItems === undefined) ) {
    try {
      GM_setValue("MAMFaves_favorites", JSON.parse(sessionStorage.menuItems));
      menuItems = JSON.parse(sessionStorage.menuItems);
    } catch {
      alert("There was an error parsing the JSON string");
    }
    sessionStorage.removeItem('menuItems');

    if (!(sessionStorage.debug === undefined)) {
      console.log(logPrefix + "Debugging is now " + sessionStorage.debug);
      GM_setValue("MAMFaves_debug", sessionStorage.debug);
      debug = sessionStorage.debug;
      sessionStorage.removeItem('debug');
    }

    if (!(sessionStorage.menuTitle === undefined)) {
      GM_setValue("MAMFaves_menuTitle", sessionStorage.menuTitle);
      menuTitle = sessionStorage.menuTitle;
      sessionStorage.removeItem('menuTitle');
    }
}

// Download the raw JSON of the favorites
if (!(sessionStorage.showRaw === undefined) ) {
    var rawJSON = JSON.stringify(GM_getValue("MAMFaves_favorites"), null, 4);
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
    GM_deleteValue('MAMFaves_favorites');
    sessionStorage.removeItem('deleteFaves');
}

// List item for the menu
var newMenuElement = document.createElement('li');
newMenuElement.classList = "mmFG";
newMenuElement.role = "none";
newMenuElement.innerHTML = '<a tabindex="0" id="favMenu" role="menuitem" aria-haspopup="true">' + menuTitle + ' ↓</a>';

// Create the unordered list for the menu items
// This one is hidden by default and will show the menu when it is hovered over
var newMenuUl = document.createElement('ul');
newMenuUl.role = "menu";
newMenuUl.ariaLabel = "Fave Links";
//newMenuUl.ariaLabelledby = "favMenu";
newMenuUl.classList = "hidden";

// Add the 'Add Fave' and 'Manage Faves' menu items
// First we create the list item for the Add Fave menu item
var addFaveMenuElement = document.createElement('li');
addFaveMenuElement.role = "none";

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
manageFavesMenuElement.role = "menuitem";
manageFavesMenuElement.innerHTML = '<a href="https://www.myanonamouse.net/preferences/index.php?view=faves" id="manageFaves">Manage</a>';
newMenuUl.appendChild(manageFavesMenuElement);

// Add a separator for asthetics
newMenuUl.appendChild(document.createElement('hr'));

// Add the menu items from the GM storage (grabbed at the beginning of the script)
// Loop through the menu items to add each as a list item
for (const key in menuItems) {
  if ( typeof menuItems[key] === 'object') {
    var newSubMenu = document.createElement('li');
    newSubMenu.role = "none";
    newSubMenu.classList = "mmFG";
    newSubMenu.innerHTML = `<a tabindex="0" id="' + key + '" aria-haspopup="true">` + key + `
    <svg xmlns="http://www.w3.org/2000/svg"
    class="right"
    width="9"
    height="12"
    style="fill:#fff;"
    viewBox="0 0 9 12">
 <polygon points="0 1, 0 11, 8 6"></polygon>
</svg>
</a>`;

    var newSubMenuUl = document.createElement('ul');
    newSubMenuUl.role = "menu";
    newSubMenuUl.ariaLabel = key;
    newSubMenuUl.classList = "hidden";

    for (const subKey in menuItems[key]) {
      var newSubMenuItem = document.createElement('li');
      newSubMenuItem.role = "none";
      newSubMenuItem.innerHTML = '<a role="menuitem" tabindex="0" href="' + menuItems[key][subKey] + '">' + subKey + '</a>';
      newSubMenuUl.appendChild(newSubMenuItem);
    }

    newSubMenu.appendChild(newSubMenuUl);
    newMenuUl.appendChild(newSubMenu);
  } else {
    var newMenuItem = document.createElement('li');
    newMenuItem.role = "none";
    newMenuItem.innerHTML = '<a role="menuitem" href="' + menuItems[key] + '">' + key + '</a>';
    newMenuUl.appendChild(newMenuItem);
  }
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
  newScript.innerHTML = `
    function remFavorite(Name) {
      sessionStorage.setItem('remFave', true);
      sessionStorage.setItem('bmName', Name);
      window.location.reload();
    }`;
  headSec.appendChild(newScript);

  let dragSrcEl = null;

  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault(); // Necessary for allowing a drop.
    e.dataTransfer.dropEffect = 'move';

    if (dragSrcEl !== this) {
      // Determine mouse position relative to the target element
      const rect = this.getBoundingClientRect();
      const relY = e.clientY - rect.top;

      if (relY < rect.height / 2) {
        // Highlight above the target element
        this.style = "border-top: 2px solid #999;";
      } else {
        // Highlight below the target element
        this.style = "border-bottom: 2px solid #999;";
      }
    }

  }

  function handleDragEnter(e) {
    if (this !== dragSrcEl) {
      this.classList.add('over');
    }
  }

  function handleDragLeave(e) {
    this.classList.remove('over');
    // Remove the border style
    this.style = "";
  }

  function handleDrop(e) {
    e.stopPropagation(); // Stops the browser from redirecting.
    e.preventDefault();

    if (dragSrcEl !== this) {
      // Determine mouse position relative to the target element
      const rect = this.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      // Remove the border style
      this.style = "";

      if (relY < rect.height / 2) {
        // Insert before the target element
        this.parentNode.insertBefore(dragSrcEl, this);
      } else {
        // Insert after the target element
        this.parentNode.insertBefore(dragSrcEl, this.nextSibling);
      }
    }

    return false;
  }

  function handleDragEnd(e) {
    let items = document.querySelectorAll('.sortable-list .sortable-item');
    [].forEach.call(items, function(item) {
      item.classList.remove('over', 'dragging');
    });
    document.getElementById('updateButton').classList.remove('disabledButton');
  }

  var newStyle = document.createElement('style');
  newStyle.innerHTML = `
    .sortable-list {
      list-style-type: none;
      padding: 0;
      #width: 200px;
      #margin:auto;
      text-align: left;
    }
    .sortable-item {
      cursor: grab;
      text-align: left;
    }
    .sortable-item.over {
      background-color: #333;
    }
    .sortable-item.dragging {
      opacity: 0.5;
    }
    .bullets {
      margin-left: 30px;
    }
    button, input {
      border-radius: 4px;
    }`;
  headSec.appendChild(newStyle);

  var storedMenuItems = GM_getValue("MAMFaves_favorites");
  var myHeader = document.getElementsByTagName("h1")[0];
  myHeader.innerHTML = "My MAM Favorites";
  var myParent = myHeader.parentNode;
  myParent.removeChild(myHeader.nextSibling);

  var newElement = document.createElement('ul');
  newElement.id = "sortableList";
  newElement.classList = "sortable-list";

  var mainTable = document.createElement('table');
  mainTable.classList = "coltable";
  mainTable.style = "width: 100%;min-width: 100%;max-width: 100%;cellspacing: 1;";

  var mainTbody = document.createElement('tbody');
  var mainTr = document.createElement('tr');
  var mainTd = document.createElement('td');
  mainTd.classList = "row1";
  mainTd.colSpan = "2";
  mainTd.innerHTML = `<br /><strong>My MAM Favorites</strong> is a place where you can store links to your favorite MAM pages, searches, forum posts, etc.<br />
   From here you can:
   <li class='bullets'>Add, remove and reorder your favorites (drag and drop to reorder and click the update button)</li>
   <li class='bullets'>Export your favorites to a file called 'MAMFavorites.json' (useful for backups or sharing)</li>
   <li class='bullets'>Import the raw json to restore favorites</li>
   <li class='bullets'>Delete all your favorites to simply start over</li>
   <br />
   <strong>NOTE:</strong> The favorites are stored in your browser's local storage and are not shared between devices or browsers. If you clear your browser's local storage, you will lose your favorites.<br />
   You can read more about all of this in the <a href="https://www.myanonamouse.net/f/t/70066">Forum Post</a>.<br />`;

  mainTr.appendChild(mainTd);
  mainTbody.appendChild(mainTr);
  mainTable.appendChild(mainTbody);

  var prefsTr = document.createElement('tr');
  var prefsTd1 = document.createElement('td');
  prefsTd1.classList = "row2";
  prefsTd1.style = "text-align: left;width: 150px;";
  prefsTd1.innerHTML = "Preferences";

  var prefsTd2 = document.createElement('td');
  prefsTd2.classList = "row1";

  var debugCB = document.createElement('input');
  debugCB.id = "debugCB";
  debugCB.type = "checkbox";
  debugCB.checked = (debug == "true");

  var debugLabel = document.createElement('label');
  debugLabel.htmlFor = "debugCB";
  debugLabel.innerHTML = "Debug Logging";

  prefsTd2.appendChild(debugCB);
  prefsTd2.appendChild(debugLabel);
  prefsTd2.appendChild(document.createElement('br'));

  var menuTitleInput = document.createElement('input');
  menuTitleInput.id = "menuTitle";
  menuTitleInput.classList = "mp_textInput";
  menuTitleInput.type = "text";
  menuTitleInput.value = menuTitle;

  var menuTitleLabel = document.createElement('label');
  menuTitleLabel.htmlFor = "menuTitle";
  menuTitleLabel.innerHTML = "\nMenu Title\n";
 
  prefsTd2.appendChild(menuTitleLabel);
  prefsTd2.appendChild(menuTitleInput);
  prefsTd2.appendChild(document.createElement('br'));

   prefsTr.appendChild(prefsTd1);
  prefsTr.appendChild(prefsTd2);
  mainTbody.appendChild(prefsTr);

  var favesTr = document.createElement('tr');
  var favesTd1 = document.createElement('td');
  favesTd1.classList = "row2";
  favesTd1.style = "text-align: left;width: 150px;";
  favesTd1.innerHTML = "Favorites";

  var favesTd2 = document.createElement('td');
  favesTd2.classList = "row1";

  favesTr.appendChild(favesTd1);

  for (const key in GM_getValue("MAMFaves_favorites")) {
    var newLi = document.createElement('li');
    newLi.classList = "sortable-item";
    newLi.id = key;
    newLi.draggable = "true";
    newLi.addEventListener('dragstart', handleDragStart, false);
    newLi.addEventListener('dragover', handleDragOver, false);
    newLi.addEventListener('dragenter', handleDragEnter, false);
    newLi.addEventListener('dragleave', handleDragLeave, false);
    newLi.addEventListener('drop', handleDrop, false);
    newLi.addEventListener('dragend', handleDragEnd, false);

    newLi.innerHTML = "<button onclick='remFavorite(\"" + key + "\")' style='border-radius:4px;margin-right:20px;'>Rem</button><a id=\"" + key + "_link\" name='bmAchors' href='https://www.myanonamouse.net" + GM_getValue("MAMFaves_favorites")[key] + "'>" + key + "</a>";
    newElement.appendChild(newLi);
  }
  favesTd2.appendChild(newElement);

  var updateButton = document.createElement('button');
  updateButton.id = "updateButton";
  updateButton.innerHTML = "Update";
  updateButton.onclick = function() {
    var allElements = document.getElementsByName('bmAchors');
    var newMenuItems = {};

    for (var i = 0; i < allElements.length; i++) {
      var bmName = allElements[i].innerHTML;
      var bmLink = allElements[i].href;
      bmLink = bmLink.substring(28);
      newMenuItems[bmName] = bmLink;
    }

    console.log(logPrefix + "The debug setting will be changed to " + document.getElementById('debugCB').checked);

    sessionStorage.setItem('menuItems', JSON.stringify(newMenuItems));
    sessionStorage.setItem('debug', document.getElementById('debugCB').checked);
    sessionStorage.setItem('menuTitle', document.getElementById('menuTitle').value);
    window.location.reload();
  };
  favesTd2.appendChild(updateButton);
  favesTd2.appendChild(document.createTextNode("\n"));

  var rawButton = document.createElement('button');
  rawButton.innerHTML = "Export JSON";
  rawButton.onclick = function() {
    sessionStorage.setItem('showRaw', true);
    window.location.reload();
  };
  favesTd2.appendChild(rawButton);
  favesTd2.appendChild(document.createTextNode("\n"));

  var importButton = document.createElement('button');
  importButton.innerHTML = "Import JSON";
  importButton.onclick = function() {
    var rawMenuItems = prompt("Paste the raw JSON string containing your favorites");

    if (!(rawMenuItems === null)) {
      sessionStorage.setItem('menuItems', rawMenuItems);
      window.location.reload();
    }
  };
  favesTd2.appendChild(importButton);

  var hrElement = document.createElement('hr');
  hrElement.style = "width: 200px;margin-left:5px;text-align: left;";
  favesTd2.appendChild(hrElement);

  var deleteButton = document.createElement('button');
  deleteButton.innerHTML = "Delete Favorites";
  deleteButton.onclick = function() {
      var deleteFaves = confirm("Are you sure you want to delete all your favorites?");
      if (deleteFaves) {
        deleteFaves = confirm("Are you really, really sure? Have you backed up your favorites first?");
        if (deleteFaves) {
          GM_deleteValue('MAMFaves_favorites');
          window.location.reload();
        }
      }
  };
  favesTd2.appendChild(deleteButton);
  favesTr.appendChild(favesTd2);
  deleteButton.style = "margin-left: 50px;";
  mainTbody.appendChild(favesTr);

  myParent.appendChild(mainTable);
}

// Add the tab for the favorites to the preferences page
if (document.title.includes("Preferences")) {
  var menuTable = document.getElementsByTagName("table")[1].firstChild.firstChild;
  var newTD = document.createElement('td');
  newTD.classList = "row2 cen torSearchNavBox";
  newTD.style = "display:inline-block";
  newTD.innerHTML = '<a href="/preferences/index.php?view=faves">Favorites</a>';
  menuTable.insertBefore(newTD, menuTable.children[8]);
}
