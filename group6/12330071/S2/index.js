/*
 * Author: Yuheng Deng
 * Date: 2015-03-28
 * E-mail: dengyh071@gmail.com
 * Description: Javascript to form the cycle menu.
 */

window.onload = function() {
  addBaseFunctionToDomObject();
  addEventToHoverButton();
  addEventToWordButtons();
  addEventToResultButton();
}

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

function addEventToHoverButton() {
  var button = document.getElementById('button');
  var apbButton = document.getElementsByClassName('icon')[0];
  apbButton.addEventListener('click', function(event) {
    button.addClass('buttonHover');
    var buttons = getWordButtons();
    setTimeout(simulateInOrder, 1000);
  });
}

function initializeButtons() {
  if (!checkWhetherPointerOut()) {
    return;
  }
  var buttons = getWordButtons();
  for (var i = 0; i < buttons.length; i++) {
    var numSpan = buttons[i].getElementsByClassName('unread')[0];
    numSpan.addClass('hidden');
    numSpan.innerHTML = '';
    // buttons[i].removeClass('forbidden');
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
  button.addEventListener('click', function(data) {
    if (button.hasClass('forbidden') || button.hasClass('disable')) {
      return;
    }
    forbiddenOtherButtons(button, buttons);
    var numSpan = button.getElementsByClassName('unread')[0];
    numSpan.innerHTML = "..."
    numSpan.removeClass('hidden');
    getData('http://localhost:3000', function(data) {
      acceptOtherButtons(button, buttons);
      button.addClass('disable');
      numSpan.innerHTML = data;
      simulateInOrder();
    }, function() {
      // To do
    });
  });
}

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

function getData(url, successFunc, failFunc) {
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

function addEventToResultButton() {
  var resultButton = document.getElementById('info-bar');
  resultButton.addEventListener('click', function() {
    calculateResult();
  });
}

function calculateResult() {
  var buttons = getWordButtons();
  if (!whetherConditionEnough(buttons)) {
    return;
  }
  var sum = calculateSumFromButton(buttons);
  var result = document.getElementById('result');
  result.innerHTML = sum;
}

function whetherConditionEnough(buttons) {
  for (var i = 0; i < buttons.length; i++) {
    if (!buttons[i].hasClass('disable')) {
      return false;
    }
  }
  return true;
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

var simulateInOrder = function() {
  var buttons = getWordButtons();
  var index = 0;
  return function() {
    if (index >= 5) {
      if (whetherConditionEnough(buttons)) {
        calculateResult();
      }
      return;
    }
    buttons[index].click();
    index += 1;
  };
}();
