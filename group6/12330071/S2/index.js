/*
 * Author: Yuheng Deng
 * Date: 2015-03-28
 * E-mail: dengyh071@gmail.com
 * Description: Javascript to form the cycle menu.
 */

window.onload = function() {
  addBaseFunctionToDomObject();
  addEventToHoverButton();
  addEventToAtplusButton();
  addEventToWordButtons();
  addEventToResultButton();
}

// Add functions for Object to add, remove and check class attribute
function addBaseFunctionToDomObject() {
  Object.prototype.hasClass = function(className) {
    var regex = new RegExp('(\\s|^)' + className + '(\\s|$)');
    var result = this.className.match(regex);
    return result !== null;
  }
  Object.prototype.addClass = function(className) {
    if (this.hasClass(className)) {
      return;
    }
    this.className += ' ' + className;
    return this;
  }
  Object.prototype.removeClass = function(className) {
    if (this.hasClass(className)) {
      var regex = new RegExp('(\\s|^)' + className + '(\\s|$)');
      this.className = this.className.replace(regex, ' ');
    }
    return this;
  }
}

/* ---------- Ajax function start --------- */
function ajaxGetData(url, successFunc, failFunc) {
  var XMLHttp = getXmlHttpRequest();
  if (typeof XMLHttp !== 'undefined') {
    XMLHttp.open('GET', url);
    XMLHttp.send(null);
    XMLHttp.onreadystatechange = function() {
      if ((XMLHttp.readyState == 4) && (XMLHttp.status == 200)) {
        successFunc(XMLHttp.responseText);
      }
    }
  }
}

function getXmlHttpRequest() {
  var XMLHttp;
  if (window.XMLHttpRequest) {
    XMLHttp = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    XMLHttp = new ActiveXObject('Microsoft.XMLHTTP');
  }
  return XMLHttp;
}
/* ------------- Ajax function end ------------- */


// Add initialize function when the pointer out of atplus
function addEventToHoverButton() {
  var button = document.getElementById('button');
  button.addEventListener('mouseout', function() {
    initializeButtons();
  });
}

// initialize all button and result
function initializeButtons() {
  if (!checkWhetherPointerOut()) {
    return;
  }
  clearStyleAndState();
}

function clearStyleAndState() {
  var buttons = getWordButtons();
  for (var i = 0; i < buttons.length; i++) {
    var numSpan = buttons[i].getElementsByClassName('unread')[0];
    numSpan.addClass('hidden');
    numSpan.innerHTML = '';
    buttons[i].removeClass('forbidden');
    buttons[i].removeClass('disable');
  }
  var result = document.getElementById('result');
  result.innerHTML = '';
}

function checkWhetherPointerOut() {
  var infoBar = document.getElementById('info-bar');
  if (infoBar.offsetHeight < 140) {
    return true;
  }
  return false;
}

function addEventToWordButtons() {
  var buttons = getWordButtons();
  for (var i = 0; i < buttons.length; i++) {
    addEventToButton(buttons[i], buttons);
  }
}

function getWordButtons() {
  var buttonFather = document.getElementById('control-ring');
  return buttonFather.getElementsByTagName('li');
}

function addEventToButton(button, buttons) {
  button.addEventListener('click', function() {
    eventHandler(button, buttons, false);
  });
}

function eventHandler(button, buttons, auto) {
  if (button.hasClass('forbidden') || button.hasClass('disable')) {
      return;
    }
    forbiddenOtherButtons(button, buttons);
    var numSpan = button.getElementsByClassName('unread')[0];
    numSpan.innerHTML = "..."
    numSpan.removeClass('hidden');
    ajaxGetData('http://localhost:3000', function(data) {
      acceptOtherButtons(button, buttons);
      button.addClass('disable');
      numSpan.innerHTML = data;
      simulateInOrder();
    }, function() {
      // To do
    });
}


// Functions about change style when click event trigger
function forbiddenOtherButtons(button, buttons) {
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i] !== button) {
      buttons[i].addClass('forbidden');
    }
  }
}

function acceptOtherButtons(button, buttons) {
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i] !== button && buttons[i].hasClass('forbidden')) {
      buttons[i].removeClass('forbidden');
    }
  }
}


// Functions about calculate result if condition enough
function addEventToResultButton() {
  var resultButton = document.getElementById('info-bar');
  resultButton.addEventListener('click', function() {
    var buttons = getWordButtons();
    if (!whetherConditionEnough(buttons)) {
      return;
    }
    var sum = calculateSumFromButton(buttons);
    var result = document.getElementById('result');
    result.innerHTML = sum;
  });
}

function whetherConditionEnough(buttons) {
  for (var i = 0; i < buttons.length; i++) {
    if (!buttons[i].hasClass('disable')) {
      return false;
    }
  }
  return true;
}

function calculateResult() {
  var buttons = getWordButtons();
  var sum = calculateSumFromButton(buttons);
  var result = document.getElementById('result');
  result.innerHTML = sum;
}

function calculateSumFromButton(buttons) {
  var sum = 0;
  for (var i = 0; i < buttons.length; i++) {
    var numSpan = buttons[i].getElementsByClassName('unread')[0];
    if (numSpan.innerHTML !== '') {
      sum += parseInt(numSpan.innerHTML);
    }
  }
  return sum;
}

// Add event for atplus button for auto get number and calculate result
function addEventToAtplusButton() {
  var apb = document.getElementsByClassName('apb')[0];
  apb.addEventListener('click', function() {
    clearStyleAndState();
    simulateInOrder(true);
  });
}

// Get a order list
function initializeOrderList() {
  var list = [0, 1, 2, 3, 4];
  // while (list.length < 5) {
  //   var number = Math.floor(Math.random() * 5);
  //   if (list.indexOf(number) < 0) {
  //     list.push(number);
  //   }
  // }
  return list;
}

var simulateInOrder = function(clear) {
  var buttons = getWordButtons();
  var index = 0;
  var orderList;
  return function(clear) {
    if (typeof orderList === 'undefined' || clear) {
      orderList = initializeOrderList();
      index = 0;
    }
    if (index >= 5) {
      calculateResult();
      return;
    }
    eventHandler(buttons[orderList[index]], buttons, true);
    index += 1;
  };
}();