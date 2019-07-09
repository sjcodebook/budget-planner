//
// ────────────────────────────────────────────────────────────────────────── I ──────────
//   :::::: B U D G E T   C O N T R O L L E R : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────
//
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var ID, newItem;

      // ─── CREATE NEW ID ───────────────────────────────────────────────
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // ─── CREATE NEW ITEM BASED ON INC OR EXP TYPE ────────────────────
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // ─── PUSH IT INTO DATA STRUCTURE ─────────────────────────────────
      data.allItems[type].push(newItem);

      // ─── RETURN THE NEW ELEMENT ──────────────────────────────────────
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // ─── CALCULATE TOTAL INCOME AND EXPENSES ─────────────────────────
      calculateTotal('exp');
      calculateTotal('inc');

      // ─── CALCULATE THE BUDGET: INCOME - EXPENSES ─────────────────────
      data.budget = data.totals.inc - data.totals.exp;

      // ─── CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT ────────────
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//
// ────────────────────────────────────────────────────────────────── II ──────────
//   :::::: U I   C O N T R O L L E R : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────
//
var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    getDOMstrings: function() {
      return DOMstrings;
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // ─── CREATE HTML STRING WITH PLACEHOLDER TEXT ────────────────────
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = document.getElementById('inc__list').innerHTML;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = document.getElementById('exp__list').innerHTML;
      }

      // ─── REPLACE THE PLACEHOLDER TEXT WITH SOME ACTUAL DATA ──────────
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', obj.value);

      // ─── INSERT THE HTML INTO THE DOM ────────────────────────────────
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      // obj.budget > 0 ? (type = 'inc') : (type = 'exp');

      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    }
  };
})();

//
// ────────────────────────────────────────────────────────────────────────────────── III ──────────
//   :::::: G L O B A L   A P P   C O N T R O L L E R : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────────────────────────────────
//
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM = UICtrl.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener('click', ctrlDeleteItem);
  };

  var updateBudget = function() {
    // ─── 1. CALCULATE THE BUDGET ─────────────────────────────────────
    budgetCtrl.calculateBudget();

    // ─── 2. RETURN THE BUDGET ────────────────────────────────────────
    var budget = budgetCtrl.getBudget();

    // ─── 3. DISPLAY THE BUDGET ───────────────────────────────────────
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // ─── 1. GET THE FEILD INPUT DATA ─────────────────────────────────
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // ─── 2. ADD THE ITEM TO THE BUDGET CONTROLLER ────────────────────
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // ─── 3. ADD THE ITEM TO THE UI ───────────────────────────────────
      UICtrl.addListItem(newItem, input.type);

      // ─── 4. CLEAR THE FIELDS ─────────────────────────────────────────
      UICtrl.clearFields();

      // ─── 5. CALCULATE AND UPDATE THE BUDGET ──────────────────────────
      updateBudget();
    } else {
      console.log('dshsj');
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // ─── 1. DELETE THE ITEM FROM THE DATA STRUCTURE ─────────────────────────────────
      budgetCtrl.deleteItem(type, ID);
      // ─── 2. DELETE THE ITEM FROM THE UI ─────────────────────────────────────────────
      UICtrl.deleteListItem(itemID);

      // ─── 3. UPDATE AND SHOW THE NEW BUDGET ──────────────────────────────────────────
      updateBudget();

      // ─── 4. CALCULATE AND UPDATE PERCENTAGES ────────────────────────────────────────
    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
