// ==UserScript==
// @name            MAM Favorites Menu
// @namespace       https://github.com/TheRealHumdinger
// @version         0.1.3
// @description     Adds menu to top of screen for custom favorites
// @author          Humdinger
// @run-at          document-finish
// @match           https://www.myanonamouse.net/*
// @icon            https://cdn.myanonamouse.net/imagebucket/204586/MouseyIcon.png
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_deleteValue
// @license         MIT
// @homepage        https://github.com/TheRealHumdinger/MAM-Favorites-Menu
// ==/UserScript==
// Icon Image by https://www.freepik.com/free-vector/flat-mice-collection-with-different-poses_1593656.htm#query=cute%20mouse&position=0&from_view=keyword&track=ais

// Get settings from GM storage
var debug = GM_getValue("MAMFaves_debug", false);
var menuTitle = GM_getValue("MAMFaves_menuTitle", "Favorites");
var menuItems = GM_getValue("MAMFaves_favorites", { "Howto use MAM Favorites": "https://www.myanonamouse.net/f/t/70066"});
var logPrefix = "[MAMFaveMenu] ";
console.log(logPrefix + "Debug value from GM is " + debug);

// Check if the addFave sessionStorage variable is set and add the favorite to the menu
// There is an asumption that the user has already been prompted for the name of the bookmark and provided it
if ( !(sessionStorage.addFave === undefined) ) {
    var bmName = sessionStorage.getItem('newBMName');
    var bmUrl = sessionStorage.getItem('bookmark');

    menuItems[bmName] = bmUrl;
    GM_setValue('MAMFaves_favorites', menuItems);
    sessionStorage.removeItem('addFave');
    sessionStorage.removeItem('newBMName');
    sessionStorage.removeItem('bookmark');
}

// Check if the remove favorite sessionStorage variable is set and remove the favorite from the menu
if ( !(sessionStorage.remFave === undefined) ) {
    bmName = sessionStorage.getItem('bmName');
    delete menuItems[bmName];
    GM_setValue('MAMFaves_favorites', menuItems);
    sessionStorage.removeItem('remFave');
    sessionStorage.removeItem('bmName');
}

// Check if the menuItems sessionStorage variable is set and update the favorites
// Also check if the debug sessionStorage variable is set and update the debug setting
// Also check if the menuTitle sessionStorage variable is set and update the menu title
// This update is triggered from the Update and JSON import buttons on the preferences page
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

// If the sessionStorage showRaw variable is set
// Download the raw JSON of the favorites and export it to a file called MAMFavorites.json
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

// If the sessionStorage deleteFaves variable is set then delete all the favorites from the GM storage
if (!(sessionStorage.deleteFaves === undefined)) {
    GM_deleteValue('MAMFaves_favorites');
    sessionStorage.removeItem('deleteFaves');
}

// Top list item (li) for the menu
var newMenuElement = document.createElement('li');
newMenuElement.classList = "mmFG";
newMenuElement.role = "none";
// Create the anchor for the menu item with the menu title
newMenuElement.innerHTML = '<a tabindex="0" id="favMenu" role="menuitem" aria-haspopup="true">' + menuTitle + ' ↓</a>';

// Create the unordered list for the menu items
// This one is hidden by default and will show the menu when it is hovered over
var newMenuUl = document.createElement('ul');
newMenuUl.role = "menu";
newMenuUl.ariaLabel = "Fave Links";
newMenuUl.classList = "hidden";

// Add the 'Add Fave' and 'Manage Faves' menu items
// First we create the list item for the Add Fave menu item
var addFaveMenuElement = document.createElement('li');
addFaveMenuElement.role = "none";

// Add the Add Fave menu item Anchor with the onclick function
// It will put the name of the bookmark and the url into the sessionStorage and reload the page so the bookmark can be added
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
// It's just a link straight to the Favorites preferences page using the view=faves query string
var manageFavesMenuElement = document.createElement('li');
manageFavesMenuElement.role = "menuitem";
manageFavesMenuElement.innerHTML = '<a href="https://www.myanonamouse.net/preferences/index.php?view=faves" id="manageFaves">Manage</a>';
newMenuUl.appendChild(manageFavesMenuElement);

// Add a separator for asthetics
// Comment out this line if you don't want the separator
// Just realize that if you get an automatic update of the script then this will be added back in
newMenuUl.appendChild(document.createElement('hr'));

// Add the menu items from the GM storage (grabbed at the beginning of the script)
// Loop through the menu items to add each as a list item
// I am working on a way to add submenus but it's not ready yet
for (const key in menuItems) {
  // This checks if the menu item is an object (which would mean it's a submenu)
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

    // Loop through the submenu items and add them to the submenu
    for (const subKey in menuItems[key]) {
      var newSubMenuItem = document.createElement('li');
      newSubMenuItem.role = "none";
      newSubMenuItem.innerHTML = '<a role="menuitem" tabindex="0" href="' + menuItems[key][subKey] + '">' + subKey + '</a>';
      newSubMenuUl.appendChild(newSubMenuItem);
    }

    newSubMenu.appendChild(newSubMenuUl);
    newMenuUl.appendChild(newSubMenu);
  } else {
    // If the menu item is not an object then it's a regular menu item
    // So we add it as a list item
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

// Inject the remove favorites script needed for the preferences page (only)
// It also includes the event listener scripts for handling the drag and drop functionality
// As well as the page/tab for managing the favorites
if ( window.location == "https://www.myanonamouse.net/preferences/index.php?view=faves" ) {
  // Grab the head section of the page to add the scripts and styles
  var headSec = document.getElementsByTagName("head")[0];
  // Add the script to remove the favorite from the menu
  var newScript = document.createElement('script');
  newScript.innerHTML = `
    function remFavorite(Name) {
      sessionStorage.setItem('remFave', true);
      sessionStorage.setItem('bmName', Name);
      window.location.reload();
    }`;
  headSec.appendChild(newScript);

  let dragSrcEl = null;

  // Event listeners for the drag and drop functionality
  // This one is for the drag start event
  function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.classList.add('dragging');
  }

  // This one is for the drag over event
  function handleDragOver(e) {
    e.preventDefault(); // Necessary for allowing a drop.
    e.dataTransfer.dropEffect = 'move';

    if (dragSrcEl !== this) {
      // Determine mouse position relative to the target element
      const rect = this.getBoundingClientRect();
      const relY = e.clientY - rect.top;

      // This determines and sets the border style for the target element to show where the item would be dropped
      if (relY < rect.height / 2) {
        // Highlight above the target element
        this.style = "border-top: 2px solid #999;";
      } else {
        // Highlight below the target element
        this.style = "border-bottom: 2px solid #999;";
      }
    }

  }

  // This one is for the drag enter event
  function handleDragEnter(e) {
    if (this !== dragSrcEl) {
      this.classList.add('over');
    }
  }

  // This one is for the drag leave event
  function handleDragLeave(e) {
    this.classList.remove('over');
    // Remove the border style when the mouse leaves the target element
    this.style = "";
  }

  // This one is for the drop event
  function handleDrop(e) {
    e.stopPropagation(); // Stops the browser from redirecting.
    e.preventDefault();

    if (dragSrcEl !== this) {
      // Determine mouse position relative to the target element
      const rect = this.getBoundingClientRect();
      const relY = e.clientY - rect.top;
      // Remove the border style
      this.style = "";

      // Determine where to place the dragged element
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

  // This one is for the drag end event
  // Basically just cleans up the styles and classes
  function handleDragEnd(e) {
    let items = document.querySelectorAll('.sortable-list .sortable-item');
    [].forEach.call(items, function(item) {
      item.classList.remove('over', 'dragging');
    });
  }

  // Add the styles used below
  var newStyle = document.createElement('style');
  newStyle.innerHTML = `
    .sortable-list {
      list-style-type: none;
      padding: 0;
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

  // Create the page for managing the favorites
  // This is the page that will be displayed when the user clicks the "Favorites" link in the menu
  // It will display the favorites and allow the user to add, remove, reorder, and export the favorites
  // It will also allow the user to import the raw JSON of the favorites and delete all the favorites
  // It will also allow the user to change the debug setting and the menu title
  // First get the header and remove the next sibling (which is the General Preferences)
  var storedMenuItems = GM_getValue("MAMFaves_favorites");
  var myHeader = document.getElementsByTagName("h1")[0];
  myHeader.innerHTML = "My MAM Favorites";
  var myParent = myHeader.parentNode;
  myParent.removeChild(myHeader.nextSibling);

  // Create the main table for the page
  var mainTable = document.createElement('table');
  mainTable.classList = "coltable";
  mainTable.style = "width: 100%;min-width: 100%;max-width: 100%;cellspacing: 1;";

  // Create the main table body and first row
  var mainTbody = document.createElement('tbody');
  var mainTr = document.createElement('tr');

  // Create the first table cell for the main table
  // This contains the intro and basic instructions for the page
  // Along with a link to the forum post about the favorites
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

  // Create the second table row for the main table
  var prefsTr = document.createElement('tr');

  // Create the first table cell for the preferences table row
  // This identifies the row as being for the preferences
  var prefsTd1 = document.createElement('td');
  prefsTd1.classList = "row2";
  prefsTd1.style = "text-align: left;width: 150px;";
  prefsTd1.innerHTML = "Preferences";

  // Create the second table cell for the preferences table row
  // This contains the actual preferences available to the user
  var prefsTd2 = document.createElement('td');
  prefsTd2.classList = "row1";

  // Create the debug checkbox and label
  var debugCB = document.createElement('input');
  debugCB.id = "debugCB";
  debugCB.type = "checkbox";
  // Set it to checked if the debug setting is true
  // The debug setting is stored as a string so it needs to be compared to a string
  // I will probably change this to a boolean in the future but it's not a priority right now
  debugCB.checked = (debug == "true");

  // Create the label for the debug checkbox
  var debugLabel = document.createElement('label');
  debugLabel.htmlFor = "debugCB";
  debugLabel.innerHTML = "Debug Logging";

  // Append the debug checkbox and label to the preferences table cell
  // Also add a line break to separate it from the next preference
  prefsTd2.appendChild(debugCB);
  prefsTd2.appendChild(debugLabel);
  prefsTd2.appendChild(document.createElement('br'));

  // Create the input for the custom menu title
  var menuTitleInput = document.createElement('input');
  menuTitleInput.id = "menuTitle";
  menuTitleInput.classList = "mp_textInput";
  menuTitleInput.type = "text";
  menuTitleInput.value = menuTitle;

  // Create the label for the custom menu title input
  var menuTitleLabel = document.createElement('label');
  menuTitleLabel.htmlFor = "menuTitle";
  menuTitleLabel.innerHTML = "Menu Title ";
 
  // Append the custom menu title input and label to the preferences table cell along with a line break
  prefsTd2.appendChild(menuTitleLabel);
  prefsTd2.appendChild(menuTitleInput);
  prefsTd2.appendChild(document.createElement('br'));

  // Append the preferences table cell to the preferences table row and table body
  prefsTr.appendChild(prefsTd1);
  prefsTr.appendChild(prefsTd2);
  mainTbody.appendChild(prefsTr);

  // Create the third table row for the main table
  // This row will contain the favorites
  // and the buttons for updating, exporting, importing, and deleting the favorites
  var favesTr = document.createElement('tr');
  var favesTd1 = document.createElement('td');
  // Create the first table cell for the favorites table row
  favesTd1.classList = "row2";
  favesTd1.style = "text-align: left;width: 150px;";
  favesTd1.innerHTML = "Favorites";

  // Append the favorites table cell to the favorites table row
  favesTr.appendChild(favesTd1);

  // Create the second table cell for the favorites table row
  var favesTd2 = document.createElement('td');
  favesTd2.classList = "row1";

  // Create the unordered list for the favorites
  // This will be used to display the favorites and allow the user to reorder them and remove them
  // The list will be sortable using the drag and drop functionality
  var newElement = document.createElement('ul');
  newElement.id = "sortableList";
  newElement.classList = "sortable-list";

  // Loop through the favorites and add them to the list
  // Each favorite will have a remove button and a link to the favorite
  // All event listeners for the drag and drop functionality are added here
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

    // This is the content shown for each favorite
    // It includes the remove button and the link to the favorite
    newLi.innerHTML = "<button onclick='remFavorite(\"" + key + "\")' style='border-radius:4px;margin-right:20px;'>Rem</button><span style='margin-right:10px'>☰</span><a id=\"" + key + "_link\" name='bmAchors' href='https://www.myanonamouse.net" + GM_getValue("MAMFaves_favorites")[key] + "'>" + key + "</a>";

    // Append the list item to the unordered list
    newElement.appendChild(newLi);
  }
  // Append the unordered list to the favorites table cell
  favesTd2.appendChild(newElement);

  // Add the update button to the page
  // This button will update the favorites in the GM storage with the new order and remove any removed favorites
  // It will also update the debug setting and the menu title
  var updateButton = document.createElement('button');
  updateButton.id = "updateButton";
  updateButton.innerHTML = "Update";
  // This is the onclick function for the update button
  // Handles created sessionStorage variables and reloads the page
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
  // Append the update button to the favorites table cell
  favesTd2.appendChild(updateButton);
  // Adds whitespace after the update button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  // Add the Export JSON button to the page
  var rawButton = document.createElement('button');
  rawButton.innerHTML = "Export JSON";
  // The onclick function for the Export JSON button simply sets a sessionStorage variable and reloads the page
  rawButton.onclick = function() {
    sessionStorage.setItem('showRaw', true);
    window.location.reload();
  };
  // Append the Export JSON button to the favorites table cell
  favesTd2.appendChild(rawButton);
  // Adds whitespace after the Export JSON button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  // Add the Import JSON button to the page
  var importButton = document.createElement('button');
  importButton.innerHTML = "Import JSON";
  // The onclick function asks the user to paste the raw JSON string and puts that into a sessionStorage variable and reloads the page
  // If you click cancel or it's an empty string then nothing happens
  importButton.onclick = function() {
    var rawMenuItems = prompt("Paste the raw JSON string containing your favorites");

    if (!(rawMenuItems === null)) {
      sessionStorage.setItem('menuItems', rawMenuItems);
      window.location.reload();
    }
  };
  // Append the Import JSON button to the favorites table cell
  favesTd2.appendChild(importButton);

  // Add an hr separator to the page to separate the delete button from the other buttons to prevent accidental clicks
  var hrElement = document.createElement('hr');
  hrElement.style = "width: 200px;margin-left:5px;text-align: left;";
  favesTd2.appendChild(hrElement);

  // Add the Delete Favorites button to the page
  // This button will kick off a delete all the favorites from the GM storage
  var deleteButton = document.createElement('button');
  // Add a margin to the left of the button to roughly center it below the other buttons
  deleteButton.style = "margin-left: 50px;";
  deleteButton.innerHTML = "Delete Favorites";
  // The onclick function for the Delete Favorites button sets a sessionStorage variable and reloads the page
  // It will ask for confirmation twice before deleting the favorites
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
  // Append the Delete Favorites button to the favorites table cell
  favesTd2.appendChild(deleteButton);
  // Append the favorites table cell to the favorites table row
  favesTr.appendChild(favesTd2);
  // Append the favorites table row to the main table body
  mainTbody.appendChild(favesTr);
  // Append the main table to the parent node
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
