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
    this.percentage = -1;
  };

  Expense.prototype.calcpercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
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

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(cur) {
        cur.calcpercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });

      return allPerc;
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

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    /*
          + or - before number
          exactly 2 decimal points
          comma separating the thousands

          2310.4567 -> + 2,310.46
          2000 -> + 2,000.00
          */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      newHtml = newHtml.replace('%item_perc%', 'item__percentage');

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

      // Hack to convert nodelists to array
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = 'inc') : (type = 'exp');
      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        'inc'
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, 'inc');

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();

      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ];

      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + ' ' + year;
    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          ',' +
          DOMstrings.inputDescription +
          ',' +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
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

    document
      .querySelector(DOM.inputType)
      .addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function() {
    // ─── 1. CALCULATE THE BUDGET ─────────────────────────────────────
    budgetCtrl.calculateBudget();

    // ─── 2. RETURN THE BUDGET ────────────────────────────────────────
    var budget = budgetCtrl.getBudget();

    // ─── 3. DISPLAY THE BUDGET ───────────────────────────────────────
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // ─── 1. CALCULATE PERCENTAGES ────────────────────────────────────
    budgetCtrl.calculatePercentages();

    // ─── 2. READ PERCENTAGES FROM THE BUDGET CONTROLLER ──────────────
    var percentages = budgetCtrl.getPercentages();

    // ─── 3. UPDATE THE UI WITH THE NEW PERCENTAGES ───────────────────
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    var alertText = document.getElementById('alert_text');
    var alert = document.getElementById('alert');
    var timeOut = setTimeout(function() {
      alert.classList.add('disappear');
    }, 3000);

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

      // ─── 6. CALCULATE AND UPDATE PERCENTAGES ─────────────────────────
      updatePercentages();
    } else if (input.description === '') {
      alert.classList.remove('disappear');
      alertText.innerText = ' Description cannot be left blank';
    } else if (isNaN(input.value)) {
      alert.classList.remove('disappear');
      alertText.innerText = ' Entered value is not a number';
      timeOut();
    } else if (input.value <= 0) {
      alert.classList.remove('disappear');
      alertText.innerText =
        ' Entered value cannot be less than or equal to zero';
      timeOut();
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
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('Application has started.');
      UICtrl.displayMonth();
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
