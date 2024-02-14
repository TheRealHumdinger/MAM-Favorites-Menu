// ==UserScript==
// @name MAM Favorites Menu
// @namespace https://github.com/TheRealHumdinger
// @author Humdinger
// @description Adds menu to top of screen for custom favorites
// @icon https://cdn.myanonamouse.net/imagebucket/204586/MouseyIcon.png
// @run-at       document-finish
// @match        https://www.myanonamouse.net/*
// @version 0.6.1
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @license MIT
// @homepage     https://github.com/TheRealHumdinger/MAM-Favorites-Menu
// ==/UserScript==
// Icon Image by https://www.freepik.com/free-vector/flat-mice-collection-with-different-poses_1593656.htm#query=cute%20mouse&position=0&from_view=keyword&track=ais

// Get settings from GM storage
var debug = GM_getValue("MAMFaves_debug", false);
var menuTitle = GM_getValue("MAMFaves_menuTitle", "Favorites");
var subMenuDirection = GM_getValue("MAMFaves_subMenuDirection", "right");
var menuItems = GM_getValue("MAMFaves_favorites", { "Howto use MAM Favorites": "https://www.myanonamouse.net/f/t/75447"});
var logPrefix = "[MAMFaveMenu] ";

var cssDirection = "";
if (subMenuDirection === "right") { cssDirection = "left"; } else { cssDirection = "right"; }

// Function to log messages to the console if the debug setting is true
function log(message) {
  if (debug) {
    console.log(logPrefix + message);
  }
}

//#region Add new menu
// Create menu items and submenus/items
// Called recursively to create submenus and their items
function addMenuItems(parent, itemList) {
  for (const key in itemList) {
    if ( typeof itemList[key] === 'object') {
      var newSubMenu = document.createElement('li');
      newSubMenu.role = "none";
      if (subMenuDirection === "right") {
        newSubMenu.innerHTML = '<a tabindex="0" id="' + key + '" aria-haspopup="true" aria-expanded="false" style="cursor:pointer;">' + key + ' →</a>';
      } else {
        newSubMenu.innerHTML = '<a tabindex="0" id="' + key + '" aria-haspopup="true" aria-expanded="false" style="cursor:pointer;">← ' + key + '</a>';
      }

      var newSubMenuUl = document.createElement('ul');
      newSubMenuUl.role = "menu";
      newSubMenuUl.ariaLabel = key;
      newSubMenuUl.style = "position: float;" + cssDirection + ": 100%;top: 0;";
      newSubMenuUl.classList = "hidden";

      // Recursively call addMenuItems to loop through the submenu items and add them to the submenu
      addMenuItems(newSubMenuUl, itemList[key]);

      newSubMenu.appendChild(newSubMenuUl);
      parent.appendChild(newSubMenu);
    } else {
      // If the menu item is not an object then it's a regular menu item
      // So we add it as a list item
      var newMenuItem = document.createElement('li');
      newMenuItem.role = "none";
      var thisurl = itemList[key];
      var target = "";
      if (itemList[key].match(/http.*:/) && !(itemList[key].match(/(myanonamouse.net)/))) {
        target = 'target="_blank"';
        // thisurl = "https://r.mrd.ninja/" + itemList[key];
      }
      newMenuItem.innerHTML = '<a role="menuitem" href="' + thisurl + '" ' + target + '>' + key + '</a>';
      parent.appendChild(newMenuItem);
    }
  }
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
newMenuUl.id = "menuFaves";
newMenuUl.role = "menu";
newMenuUl.ariaLabel = "Fave Links";
newMenuUl.classList = "hidden";

// Add the 'Add Fave' and 'Manage Faves' menu items
// First we create the list item for the Add Fave menu item
var addFaveMenuElement = document.createElement('li');
addFaveMenuElement.role = "none";

// Add the Add Fave menu item Anchor with the onclick function
// It will put the name of the favorite and the url into the sessionStorage and reload the page so the favorite can be added
var addFaveAnchor = document.createElement('a');
addFaveAnchor.role = "menuitem";
addFaveAnchor.style = "cursor: pointer;";
addFaveAnchor.tabindex = "0";
addFaveAnchor.id = "addFave";
addFaveAnchor.innerHTML = "Add Fave";
addFaveAnchor.onclick = function() {
  // Create a modal element
  var modal = document.createElement('div');
  modal.style = "position: fixed;top: 0;left: 0;width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);z-index: 1000;";
  // modal.classList.add('modal');

  // Create the modal content
  var modalContent = document.createElement('div');
  modalContent.style = "position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);background-color: #fefefe;padding: 20px;border: 1px solid #888;display: flex;flex-direction: column;align-items: center;";
  // modalContent.classList.add('modal-content');

  var modalClose = document.createElement('span');
  modalClose.style = "position: absolute;top: 0;right: 0;padding-right: 2px;font-size: 24px;cursor: pointer;";
  modalClose.innerHTML = "&times;";
  modalClose.onclick = function() {
    document.body.removeChild(modal);
  };
  modalContent.appendChild(modalClose);

  var modalTitle = document.createElement('h2');
  modalTitle.innerHTML = "Add Favorite";
  modalContent.appendChild(modalTitle);

  var divElement = document.createElement('div');
  divElement.style = "display: flex; flex-direction: row;";

  var nameLabel = document.createElement('label');
  nameLabel.innerHTML = "Name";
  nameLabel.style = "width: 40px;padding-top:3px;";
  divElement.appendChild(nameLabel);

  // Create input fields for name, URL, and folder
  var nameInput = document.createElement('input');
  nameInput.style = "border-radius: 4px;width:350px;"
  nameInput.type = 'text';
  nameInput.value = document.title;
  divElement.appendChild(nameInput);
  modalContent.appendChild(divElement);

  var divElement2 = document.createElement('div');
  divElement2.style = "display: flex; flex-direction: row;";

  var urlLabel = document.createElement('label');
  urlLabel.innerHTML = "URL";
  urlLabel.style = "width: 40px;padding-top:3px;";
  divElement2.appendChild(urlLabel);

  var urlInput = document.createElement('input');
  urlInput.style = "border-radius: 4px;width:350px;"
  urlInput.type = 'text';
  urlInput.value = window.location.pathname + window.location.search;
  divElement2.appendChild(urlInput);
  modalContent.appendChild(divElement2);

  // var folderInput = document.createElement('input');
  // folderInput.type = 'text';
  // folderInput.placeholder = 'Folder';

  var divElement3 = document.createElement('div');
  divElement3.style = "display: flex; flex-direction: row;";
  var folderLabel = document.createElement('label');
  folderLabel.innerHTML = "Folder";
  folderLabel.style = "width: 40px;padding-top:3px;";
  divElement3.appendChild(folderLabel);

  var folderInput = document.createElement('select');
  folderInput.id = "folderInput";
  folderInput.style = "border-radius: 4px;width:356px;";
  var folderOption = document.createElement('option');
  folderOption.value = "No Folder";
  folderOption.innerHTML = "No Folder";
  folderInput.appendChild(folderOption);
  for (const key in menuItems) {
    if ( typeof menuItems[key] === 'object') {
      var newSubMenu = document.createElement('option');
      newSubMenu.value = key;
      newSubMenu.innerHTML = key;
      folderInput.appendChild(newSubMenu);
    }
  }
  divElement3.appendChild(folderInput);
  modalContent.appendChild(divElement3);

  // Create a button to submit the form
  var submitButton = document.createElement('button');
  submitButton.textContent = 'Add Favorite';

  // Append the input fields and button to the modal content
  modalContent.appendChild(submitButton);

  // Append the modal content to the modal
  modal.appendChild(modalContent);

  // Append the modal to the document body
  document.body.appendChild(modal);

  // Function to handle form submission
  function handleSubmit(event) {
    event.preventDefault();

    var newBMName = nameInput.value;
    var newBMLink = urlInput.value;
    var newBMFolder = folderInput.value;

    if (newBMName && newBMLink && newBMFolder) {
      // Add the new favorite to the menuItems object
      if (newBMFolder === "No Folder") {
        menuItems[newBMName] = newBMLink;
      } else {
        if (menuItems[newBMFolder]) {
          menuItems[newBMFolder][newBMName] = newBMLink;
        }
      }
      GM_setValue('MAMFaves_favorites', menuItems);

      // Reload the page
      window.location.reload();
    }

    // Remove the modal from the document body
    document.body.removeChild(modal);
  }

  // Add event listener to the submit button
  submitButton.addEventListener('click', handleSubmit);
};
addFaveMenuElement.appendChild(addFaveAnchor);
newMenuUl.appendChild(addFaveMenuElement);

// Now time for the Manage Faves menu item (a bit simpler)
// It's just a link straight to the Favorites preferences page using the view=faves query string
var manageFavesMenuElement = document.createElement('li');
manageFavesMenuElement.role = "none";
manageFavesMenuElement.innerHTML = '<a role="menuitem" href="https://www.myanonamouse.net/preferences/index.php?view=faves" id="manageFaves">Manage</a>';
newMenuUl.appendChild(manageFavesMenuElement);

// Add a separator for asthetics
// Comment out this line if you don't want the separator
// Just realize that if you get an automatic update of the script then this will be added back in
newMenuUl.appendChild(document.createElement('hr'));

// Add the menu items from the GM storage (grabbed at the beginning of the script)
// Loop through the menu items to add each as a list item
// Submenus are added as list items with a nested unordered list
addMenuItems(newMenuUl, menuItems);

// Append the unordered list to the menu element
newMenuElement.appendChild(newMenuUl);

// Append it to the menu div
document.getElementById("menu").appendChild(newMenuElement);
// End of adding new menu
//#endregion Add new menu

// Inject the remove favorites script needed for the preferences page (only)
// It also includes the event listener scripts for handling the drag and drop functionality
// As well as the page/tab for managing the favorites
if ( window.location == "https://www.myanonamouse.net/preferences/index.php?view=faves" ) {
//#region Injected Script and Styles
  document.title = document.title.replace("general", "MAM Favorites");
  // Grab the head section of the page to add styles
  var headSec = document.getElementsByTagName("head")[0];

  // Add the styles used below
  var newStyle = document.createElement('style');
  newStyle.innerHTML = `
    .sortable-list {
      cursor: grab;
      list-style-type: none;
      padding: 0;
      text-align: left;
    }
    .sortable-item {
      cursor: grab;
      text-align: left;
    }
    .sortable-item.over, .sortable-list.over {
      background-color: #333;
    }
    .sortable-item.dragging, .sortable-list.dragging {
      opacity: 0.5;
    }
    .bullets {
      margin-left: 30px;
    }
    button, input, select {
      border-radius: 4px;
    }`;
  headSec.appendChild(newStyle);

//#endregion Injected Script and Styles

//#region Drag and Drop Event Listeners
  // Event listeners for the drag and drop functionality
  // This one is for the drag start event
  let dragSrcEl = null;

  function handleDragStart(e) {
    e.stopPropagation();
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    // e.dataTransfer.setData('text/plan', e.target.id);
    log("Starting drag: " + e.target.id);
    this.classList.add('dragging');
  }

  // This one is for the drag over event
  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault(); // Necessary for allowing a drop.
    e.dataTransfer.dropEffect = 'move';

    if (dragSrcEl !== this) {
      if (this.classList.contains('sortable-item')) {
          // Highlight the target element
        this.classList.add('over');
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
      } else if (this.classList.contains('sortable-list')) {
        // Highlight the target element (folder)
        this.classList.add('over');
        this.style = "border: 2px solid #999;";
      }
    }
  }

  // This one is for the drag enter event
  function handleDragEnter(e) {
    e.stopPropagation();
    if (this !== dragSrcEl) {
      this.classList.add('over');
    }
  }

  // This one is for the drag leave event
  function handleDragLeave(e) {
    e.stopPropagation();
    this.classList.remove('over');
    // Remove the border style when the mouse leaves the target element
    this.style = "";
  }

  // This one is for the drop event
  function handleDrop(e) {
    e.stopPropagation(); // Stops the browser from redirecting.
    e.preventDefault();

    if (dragSrcEl !== this) {
      if (this.classList.contains('sortable-item')) {
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
      } else if (this.classList.contains('sortable-list')) {
        // Insert the dragged element into the target element (folder)
        this.lastChild.appendChild(dragSrcEl);
      }

      if (dragSrcEl.classList.contains('sortable-list')) {
        // log("Last child: " + dragSrcEl.lastChild.id);
        var parentPath = dragSrcEl.parentElement.getAttribute('jsonpath') + ".";
        if (parentPath === "null.") {
          parentPath = "";
        }
        dragSrcEl.lastChild.setAttribute('jsonpath', parentPath + dragSrcEl.lastChild.id.substring(0, dragSrcEl.lastChild.id.length - 3));
      }
      document.getElementById('indicatorLabel').innerHTML = "Unsaved changes, don't forget to click Update!";
    }
    return false;
  }

  // This one is for the drag end event
  // Basically just cleans up the styles and classes
  function handleDragEnd(e) {
    let items = document.querySelectorAll('.sortable-list, .sortable-item');
    [].forEach.call(items, function(item) {
      item.classList.remove('over', 'dragging');
      item.style = "";
    });
  }
//#endregion Drag and Drop Event Listeners

//#region Manage Favorites Page
  // Create the page for managing the favorites
  // This is the page that will be displayed when the user clicks the "Favorites" link in the menu
  // It will display the favorites and allow the user to add, remove, reorder, and export the favorites
  // It will also allow the user to import the raw JSON of the favorites and delete all the favorites
  // It will also allow the user to change the debug setting and the menu title
  // First get the header and remove the next sibling (which is the General Preferences)
  var myHeader = document.getElementsByTagName("h1")[0];
  myHeader.innerHTML = "MAM Favorites";
  var myParent = myHeader.parentNode;
  myParent.removeChild(myHeader.nextSibling);

  // Create the main table for the page
  var mainTable = document.createElement('table');
  mainTable.classList = "coltable";
  mainTable.style = "width: 100%;min-width: 100%;max-width: 100%;cellspacing: 1;";

  // Create the main table body and first row
  var mainTbody = document.createElement('tbody');
//#region First Table Row
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
   You can read more about all of this in the <a href="https://www.myanonamouse.net/f/t/75447">Forum Post</a>.<br />`;

  mainTr.appendChild(mainTd);
  mainTbody.appendChild(mainTr);
  mainTable.appendChild(mainTbody);
//#endregion First Table Row

//#region Second Table Row - Preferences
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
  debugCB.onchange = function() { document.getElementById('indicatorLabel').innerHTML = "Unsaved changes, don't forget to click Update!"; };
  // Set it to checked if the debug setting is true
  // The debug setting is stored as a string so it needs to be compared to a string
  // I will probably change this to a boolean in the future but it's not a priority right now
  debugCB.checked = debug;

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
  menuTitleInput.onchange = function() { document.getElementById('indicatorLabel').innerHTML = "Unsaved changes, don't forget to click Update!"; };

  // Create the label for the custom menu title input
  var menuTitleLabel = document.createElement('label');
  menuTitleLabel.htmlFor = "menuTitle";
  menuTitleLabel.innerHTML = "Menu Title ";

  // Append the custom menu title input and label to the preferences table cell along with a line break
  prefsTd2.appendChild(menuTitleLabel);
  prefsTd2.appendChild(menuTitleInput);
  prefsTd2.appendChild(document.createElement('br'));

  // Create label for the submenu direction selector
  var subMenuDirectionLabel = document.createElement('label');
  subMenuDirectionLabel.innerHTML = "Sub-menu direction ";
  prefsTd2.appendChild(subMenuDirectionLabel);

  // Create the selector for the submenu direction
  var subMenuDirectionSelect = document.createElement('select');
  subMenuDirectionSelect.id = "subMenuDirection";
  subMenuDirectionSelect.onchange = function() { document.getElementById('indicatorLabel').innerHTML = "Unsaved changes, don't forget to click Update!"; };

  // Create the options for the submenu direction selector
  var subMenuDirectionOptions = ["right", "left"];
  for (var i = 0; i < subMenuDirectionOptions.length; i++) {
    var newOption = document.createElement('option');
    newOption.value = subMenuDirectionOptions[i];
    newOption.innerHTML = subMenuDirectionOptions[i];
    if (subMenuDirectionOptions[i] === subMenuDirection) {
      newOption.selected = true;
    }
    subMenuDirectionSelect.appendChild(newOption);
  }
  prefsTd2.appendChild(subMenuDirectionSelect);

  // Append the preferences table cell to the preferences table row and table body
  prefsTr.appendChild(prefsTd1);
  prefsTr.appendChild(prefsTd2);
  mainTbody.appendChild(prefsTr);
//#endregion Second Table Row - Preferences

//#region Third Table Row - Favorites
  // Function to add a favorite items and containing folders to the page
  function addFavoriteItem(parent, parentItem, itemList) {
    for (const key in itemList) {
      var keyItem = "";
      if (parentItem.length > 0) {
        keyItem = parentItem + "." + key;
      } else {
        keyItem = key;
      }
      if ( typeof itemList[key] === 'object') {
        var newSubMenu = document.createElement('li');
        newSubMenu.classList = "sortable-list";
        newSubMenu.id = keyItem;
        newSubMenu.draggable = "true";
        newSubMenu.addEventListener('dragstart', handleDragStart, false);
        newSubMenu.addEventListener('dragover', handleDragOver, false);
        newSubMenu.addEventListener('dragenter', handleDragEnter, false);
        newSubMenu.addEventListener('dragleave', handleDragLeave, false);
        newSubMenu.addEventListener('drop', handleDrop, false);
        newSubMenu.addEventListener('dragend', handleDragEnd, false);

        var collapsableSpan = document.createElement('span');
        collapsableSpan.style = "margin-right:10px;cursor:pointer;font-size:14px;";
        collapsableSpan.innerHTML = "+";
        collapsableSpan.onclick = function() {
          if (this.innerHTML === "+") {
            this.innerHTML = "−";
            this.parentElement.lastChild.style="";
          } else {
            this.innerHTML = "+";
            this.parentElement.lastChild.style="display:none;";
          }
        };
        newSubMenu.appendChild(collapsableSpan);

        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = "Del";
        deleteButton.onclick = function() {
          var jsonpath = this.getAttribute('jsonpath').split('.');
          lastOne = menuItems;
          for (var i = 0; i < jsonpath.length; i++) {
              if (i == jsonpath.length - 1) {
                  delete lastOne[jsonpath[i]];
              }
              var lastOne = lastOne[jsonpath[i]];
          }
          GM_setValue('MAMFaves_favorites', menuItems);
          window.location.reload();
        };
        deleteButton.style = "border-radius:4px;margin-right:5px;";
        deleteButton.setAttribute('jsonpath', keyItem);
        newSubMenu.appendChild(deleteButton);

        var renameButton = document.createElement('button');
        renameButton.innerHTML = "Ren";
        renameButton.onclick = function() {
          var new_key = prompt("Enter the new name for the folder", key);
          var jsonpath = this.getAttribute('jsonpath').split('.');
          lastOne = menuItems;
          for (var i = 0; i < jsonpath.length; i++) {
            if (i == jsonpath.length - 1) {
              if (jsonpath[i] !== new_key) {
                Object.defineProperty(lastOne, new_key,
                    Object.getOwnPropertyDescriptor(lastOne, jsonpath[i]));
                delete lastOne[jsonpath[i]];
                GM_setValue('MAMFaves_favorites', menuItems);
                window.location.reload();
              }
            }
            var lastOne = lastOne[jsonpath[i]];
          }
        };

        renameButton.style = "border-radius:4px;margin-right:5px;";
        renameButton.setAttribute('jsonpath', keyItem);
        newSubMenu.appendChild(renameButton);

        var newSpan = document.createElement('span');
        newSpan.style = "margin-right:10px";
        newSpan.innerHTML = "☰";
        newSubMenu.appendChild(newSpan);

        var newLabel = document.createElement('label');
        newLabel.htmlFor = key;
        newLabel.innerHTML = key + " →";
        newLabel.classList = "bmAnchors";
        // newLabel.onclick = function() {
        //   if (this.nextSibling.style.display === "") {
        //     this.innerHTML = key + " →";
        //     this.nextSibling.style="display: none;";
        //   } else {
        //     this.innerHTML = key + " ↓";
        //     this.nextSibling.style="";
        //   }
        // };
        newLabel.setAttribute('jsonpath', keyItem);
        newSubMenu.appendChild(newLabel);

        var newSubMenuUl = document.createElement('ul');
        newSubMenuUl.id = key + "_ul";
        newSubMenuUl.setAttribute('jsonpath', keyItem);
        newSubMenuUl.style = "display:none;";
        // newSubMenuUl.draggable = "true";
        // newSubMenuUl.classList = "sortable-list";
        // newSubMenuUl.addEventListener('dragstart', handleDragStart, false);
        // newSubMenuUl.addEventListener('dragover', handleDragOver, false);
        // newSubMenuUl.addEventListener('dragenter', handleDragEnter, false);
        // newSubMenuUl.addEventListener('dragleave', handleDragLeave, false);
        // newSubMenuUl.addEventListener('drop', handleDrop, false);
        // newSubMenuUl.addEventListener('dragend', handleDragEnd, false);

        addFavoriteItem(newSubMenuUl, keyItem, itemList[key]);
        newSubMenu.appendChild(newSubMenuUl);
        parent.appendChild(newSubMenu);
      } else {
        var newLi = document.createElement('li');
        newLi.classList = "sortable-item";
        newLi.id = keyItem;
        newLi.draggable = "true";
        newLi.addEventListener('dragstart', handleDragStart, false);
        newLi.addEventListener('dragover', handleDragOver, false);
        newLi.addEventListener('dragenter', handleDragEnter, false);
        newLi.addEventListener('dragleave', handleDragLeave, false);
        newLi.addEventListener('drop', handleDrop, false);
        newLi.addEventListener('dragend', handleDragEnd, false);

        var deleteButton = document.createElement('button');
        deleteButton.innerHTML = "Del";
        deleteButton.onclick = function() {
          var jsonpath = this.getAttribute('jsonpath').split('.');
          lastOne = menuItems;
          for (var i = 0; i < jsonpath.length; i++) {
              if (i == jsonpath.length - 1) {
                  delete lastOne[jsonpath[i]];
              }
              var lastOne = lastOne[jsonpath[i]];
          }
          GM_setValue('MAMFaves_favorites', menuItems);
          window.location.reload();
        };
        deleteButton.style = "border-radius:4px;margin-right:5px;margin-left:18px;";
        deleteButton.setAttribute('jsonpath', keyItem);
        newLi.appendChild(deleteButton);

        var renameButton = document.createElement('button');
        renameButton.innerHTML = "Ren";
        renameButton.onclick = function() {
          var new_key = prompt("Enter the new name for the favorite", key);
          var jsonpath = this.getAttribute('jsonpath').split('.');
          lastOne = menuItems;
          for (var i = 0; i < jsonpath.length; i++) {
            if (i == jsonpath.length - 1) {
              if (jsonpath[i] !== new_key) {
                Object.defineProperty(lastOne, new_key,
                    Object.getOwnPropertyDescriptor(lastOne, jsonpath[i]));
                delete lastOne[jsonpath[i]];
                GM_setValue('MAMFaves_favorites', menuItems);
                window.location.reload();
              }
            }
            var lastOne = lastOne[jsonpath[i]];
          }
        };
        renameButton.style = "border-radius:4px;margin-right:5px;";
        renameButton.setAttribute('jsonpath', keyItem);
        newLi.appendChild(renameButton);

        var newSpan = document.createElement('span');
        newSpan.style = "margin-right:10px";
        newSpan.innerHTML = "☰";
        newLi.appendChild(newSpan);

        var newA = document.createElement('a');
        newA.classList = "bmAnchors";
        var thisurl = itemList[key];
        if (thisurl.includes("http")) {
          newA.href = thisurl;
        } else {
          newA.href = "https://www.myanonamouse.net" + itemList[key];
        }
        newA.innerHTML = key;
        newA.setAttribute('jsonpath', keyItem);
        newLi.appendChild(newA);
        parent.appendChild(newLi);
      }
    }
  }

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
  addFavoriteItem(newElement, "", GM_getValue("MAMFaves_favorites"));

  // Append the unordered list to the favorites table cell
  favesTd2.appendChild(newElement);

  // Add the update button to the page
  // This button will update the favorites in the GM storage with the new order and remove any removed favorites
  // It will also update the debug setting and the menu title
  var updateButton = document.createElement('button');
  updateButton.id = "updateButton";
  updateButton.innerHTML = "Update";
  updateButton.classList = "bigbutton";
  // This is the onclick function for the update button
  // Handles created sessionStorage variables and reloads the page
  updateButton.onclick = function() {
    var allElements = document.getElementsByClassName('bmAnchors');
    var newMenuItems = {};
    var curMenuItems = newMenuItems;

    // var curMenuItems = newMenuItems;
    for (var i = 0; i < allElements.length; i++) {
      var parentUl = allElements[i].parentElement.parentElement;
      var parentPath = parentUl.getAttribute('jsonpath');
      parentPath ??= "";

      var curMenuItems = newMenuItems;
      if (parentPath !== "") {
        var jsonpathArr = parentPath.split('.');
        for (var j = 0; j < jsonpathArr.length; j++) {
          curMenuItems = curMenuItems[jsonpathArr[j]];
        }
      }

      var bmName = allElements[i].innerHTML;
      if (bmName.includes("→") || bmName.includes("↓")) {
        bmName = bmName.substring(0, bmName.length - 2);
        curMenuItems[bmName] = {};
      } else {
        var bmLink = allElements[i].href;
        if (bmLink.includes("https://www.myanonamouse.net")) {
          bmLink = bmLink.substring(28);
        }
        curMenuItems[bmName] = bmLink;
      }
    }

    GM_setValue('MAMFaves_favorites', newMenuItems);
    GM_setValue('MAMFaves_debug', document.getElementById('debugCB').checked == true);
    GM_setValue('MAMFaves_menuTitle', document.getElementById('menuTitle').value);
    GM_setValue('MAMFaves_subMenuDirection', document.getElementById('subMenuDirection').value);
    window.location.reload();
  };
  // Append the update button to the favorites table cell
  favesTd2.appendChild(updateButton);
  // Adds whitespace after the update button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  // Create folder button
  var folderButton = document.createElement('button');
  folderButton.innerHTML = "Add Folder";
  folderButton.classList = "bigbutton";
  folderButton.onclick = function() {
    var newFolderName = prompt('Give a name for the folder');
    if (!(newFolderName === null) && !(newFolderName === "")) {
      var newFolder = {};
      menuItems[newFolderName] = newFolder;
      GM_setValue('MAMFaves_favorites', menuItems);
      window.location.reload();
    }
  };
  favesTd2.appendChild(folderButton);
  favesTd2.appendChild(document.createElement("br"));

  // Add the Export JSON button to the page
  var rawButton = document.createElement('button');
  rawButton.innerHTML = "Export JSON";
  rawButton.classList = "bigbutton";
  // The onclick function for the Export JSON button simply sets a sessionStorage variable and reloads the page
  rawButton.onclick = function() {
    var rawJSON = JSON.stringify(GM_getValue("MAMFaves_favorites"), null, 4);
    var blob = new Blob([rawJSON], {type: "text/plain;charset=utf-8"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var timestamp = new Date().toISOString().replace(/:/g, "-");
    a.download = "MAMFavorites_" + timestamp + ".json";
    a.innerHTML = "Download";
    a.href = url;
    a.click();
  };
  // Append the Export JSON button to the favorites table cell
  favesTd2.appendChild(rawButton);
  // Adds whitespace after the Export JSON button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  // Add the Import JSON button to the page
  var importButton = document.createElement('button');
  importButton.innerHTML = "Import JSON";
  importButton.classList = "bigbutton";
  // The onclick function asks the user to paste the raw JSON string and puts that into a sessionStorage variable and reloads the page
  // If you click cancel or it's an empty string then nothing happens
  importButton.onclick = function() {
    var importModal = document.createElement('div');
    importModal.style = "position: fixed;top: 0;left: 0;width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);z-index: 1000;";

    var importModalContent = document.createElement('div');
    importModalContent.style = "position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);background-color: #fefefe;padding: 20px;border: 1px solid #888;display: flex;flex-direction: column;align-items: center;";

    var importModalClose = document.createElement('span');
    importModalClose.innerHTML = "&times;";
    importModalClose.style = "position: absolute;top: 0;right: 0;font-size: 20px;font-weight: bold;cursor: pointer;";
    importModalClose.onclick = function() {
      importModal.style = "display: none;";
    };
    importModalContent.appendChild(importModalClose);

    var importModalTitle = document.createElement('h2');
    importModalTitle.innerHTML = "Import JSON";
    importModalContent.appendChild(importModalTitle);

    var importModalText = document.createElement('p');
    importModalText.innerHTML = "Paste or open the file containing the raw JSON string of your favorites<br />This will overwrite your current favorites<br />Click the Import button to import the JSON string when the text area is filled";
    importModalContent.appendChild(importModalText);

    var importModalTextarea = document.createElement('textarea');
    importModalTextarea.style = "width: 800px;height: 600px;";
    importModalContent.appendChild(importModalTextarea);

    var importModalButton = document.createElement('button');
    importModalButton.innerHTML = "Import";
    importModalButton.onclick = function() {
      var rawMenuItems = importModalTextarea.value;
      if (!(rawMenuItems === null)) {
        try {
          GM_setValue("MAMFaves_favorites", JSON.parse(rawMenuItems));
        } catch {
          alert("There was an error parsing the JSON string");
        }
        window.location.reload();
      }
    }
    importModalContent.appendChild(importModalButton);

    var importModalOpenFileButton = document.createElement('button');
    importModalOpenFileButton.innerHTML = "Open File";
    importModalOpenFileButton.onclick = function() {
      var fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.style = "display: none;";
      fileInput.onchange = function() {
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          importModalTextarea.value = e.target.result;
        };
        reader.readAsText(file);
      };
      fileInput.click();
    }
    importModalContent.appendChild(importModalOpenFileButton);
    importModal.appendChild(importModalContent);
    document.body.appendChild(importModal);
  };

  // Append the Import JSON button to the favorites table cell
  favesTd2.appendChild(importButton);
  // Adds whitespace after the Import JSON button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  // Add a merge button to the page
  var mergeButton = document.createElement('button');
  mergeButton.innerHTML = "Merge JSON";
  mergeButton.classList = "bigbutton";
  // The onclick function asks the user to paste the raw JSON string and puts that into a sessionStorage variable and reloads the page
  // If you click cancel or it's an empty string then nothing happens
  mergeButton.onclick = function() {
    var mergeModal = document.createElement('div');
    mergeModal.style = "position: fixed;top: 0;left: 0;width: 100%;height: 100%;background-color: rgba(0,0,0,0.5);z-index: 1000;";

    var mergeModalContent = document.createElement('div');
    mergeModalContent.style = "position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);background-color: #fefefe;padding: 20px;border: 1px solid #888;display: flex;flex-direction: column;align-items: center;";

    var mergeModalClose = document.createElement('span');
    mergeModalClose.innerHTML = "&times;";
    mergeModalClose.style = "position: absolute;top: 0;right: 0;font-size: 20px;font-weight: bold;cursor: pointer;";
    mergeModalClose.onclick = function() {
      mergeModal.style = "display: none;";
    };
    mergeModalContent.appendChild(mergeModalClose);

    var mergeModalTitle = document.createElement('h2');
    mergeModalTitle.innerHTML = "Merge JSON";
    mergeModalContent.appendChild(mergeModalTitle);

    var mergeModalText = document.createElement('p');
    mergeModalText.innerHTML = "Paste or open the file containing the raw JSON string of the favorites you want to merge<br />This will merge the favorites in this list with your current favorites<br />Click the Merge button to merge the JSON string when the text area is filled";
    mergeModalContent.appendChild(mergeModalText);

    var mergeModalTextarea = document.createElement('textarea');
    mergeModalTextarea.style = "width: 800px;height: 600px;";
    mergeModalContent.appendChild(mergeModalTextarea);

    var mergeModalButton = document.createElement('button');
    mergeModalButton.innerHTML = "Merge";
    mergeModalButton.onclick = function() {
      var rawMenuItems = mergeModalTextarea.value;
      if (!(rawMenuItems === null)) {
        try {
          var newMenuItems = JSON.parse(rawMenuItems);
          var oldMenuItems = GM_getValue("MAMFaves_favorites");
          var mergedMenuItems = {...oldMenuItems, ...newMenuItems};
          GM_setValue("MAMFaves_favorites", mergedMenuItems);
        } catch {
          alert("There was an error parsing the JSON string");
        }
        window.location.reload();
      }
    }
    mergeModalContent.appendChild(mergeModalButton);

    var mergeModalOpenFileButton = document.createElement('button');
    mergeModalOpenFileButton.innerHTML = "Open File";
    mergeModalOpenFileButton.onclick = function() {
      var fileInput = document.createElement('input');
      fileInput.type = "file";
      fileInput.style = "display: none;";
      fileInput.onchange = function() {
        var file = fileInput.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
          mergeModalTextarea.value = e.target.result;
        };
        reader.readAsText(file);
      };
      fileInput.click();
    }
    mergeModalContent.appendChild(mergeModalOpenFileButton);
    mergeModal.appendChild(mergeModalContent);
    document.body.appendChild(mergeModal);
  };

  // Append the Merge JSON button to the favorites table cell
  favesTd2.appendChild(mergeButton);
  // Adds whitespace after the Merge JSON button to separate it from the other buttons
  favesTd2.appendChild(document.createTextNode("\n"));

  var indicatorLabel = document.createElement('label');
  indicatorLabel.id = "indicatorLabel";
  indicatorLabel.style = "margin-left: 5px;color: red;";
  favesTd2.appendChild(indicatorLabel);

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
//#endregion Third Table Row - Favorites

  // Append the main table to the parent node
  myParent.appendChild(mainTable);
//#endregion Manage Favorites Page
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
