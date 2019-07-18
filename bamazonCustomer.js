require("dotenv").config();

const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Table = require("cli-table");
// const maxListenersExceededWarning = require('max-listeners-exceeded-warning');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",

  password: process.env.PASSWORD,
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("\nConnected Successfully!");
  displayAllItems();
});

// GLOBAL VARIABLE
// =====================================================================================
var selectedItem = {};

// FUNCTIONS
// =====================================================================================
// function to reset the selectedItem array so that previous purchases are not inside
var resetCart = function() {
    selectedItem = {};
}

// function to display all items for sale
var displayAllItems = function() {
    connection.query(`SELECT * FROM products`, function (err, res) {
        var productTable = new Table({
            head: ['Item ID', 'Product Name', 'Price'],
            colWidths: [10, 30, 12]
        });

        for (var i = 0; i < res.length; i++) {
            productTable.push([
                res[i].item_id, 
                res[i].product_name, 
                `$${res[i].price}`
            ]);
        }
        console.log(`\n\n${productTable.toString()}\n\n`);

        // ask user to enter ID of item they wish to purchase
        //askForID();
    });
};

// function to prompt user to enter ID of the product to purchase
var askForID = function() {
    inquirer.prompt({
        name: 'itemID',
        type: 'input',
        message: 'Enter the ID of the item you would like to purchase:',
        // validate input is number from 1-10
        validate: function (value) {
            if (!isNaN(value) && (value > 0 && value <= 10)) {
                return true;
            } else {
                console.log(chalk.red(' => Please enter a number from 1-10'));
                return false;
            }
        }
    // select all rows where ID = user's input
    }).then(function (answer) {
        connection.query('SELECT item_id, product_name, price, stock_quantity, product_sales FROM products WHERE ?', { item_id: answer.itemID }, (err, res) => {
            // confirm with user that this is the product they'd like to purchase
            confirmItem(res[0].product_name, res);
        });
    });
};

// function to confirm with user that the product they chose is correct
var confirmItem = function(product, res) {
    inquirer.prompt({
        name: 'confirmItem',
        type: 'confirm',
        message: `You chose` + chalk.green.bold(` '${product}'. `) + `Is this correct?`
    }).then(function (answer) {
        if (answer.confirmItem) {
            selectedItem = {
                item_id: res[0].item_id,
                product_name: res[0].product_name,
                price: res[0].price,
                stock_quantity: res[0].stock_quantity,
                product_sales: res[0].product_sales
            };
            // ask how many they'd like to purchase
            askHowMany(selectedItem.item_id);
        } else {
            askForID();
        }
    });
};

// function to ask user how many of the products they'd like to purchase
var askHowMany = function() {
    inquirer.prompt({
        name: 'howMany',
        type: 'input',
        message: 'How many would you like to purchase?',
        validate: function(value) {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log(chalk.red(' => Oops, please enter a number greater than 0'));
                return false;
            }
        }
    }).then(function (answer) {
        connection.query('SELECT stock_quantity FROM products WHERE ?', { item_id: selectedItem.item_id }, (err, res) => {
            // if there are not enough products in stock
            if (res[0].stock_quantity < answer.howMany) {
                console.log(chalk.blue.bold('\n\tSorry, insufficient quantity in stock!\n'));
                // confirm if user would still like to buy this product
                inquirer.prompt({
                    name: 'proceed',
                    type: 'confirm',
                    message: 'Would you still like to purchase this product?'
                }).then(function (answer) {
                    if (answer.proceed) {
                        askHowMany(selectedItem.item_id);
                    } else {
                        console.log(chalk.green.bold('\n\tThanks for visiting! We hope to see you again soon.\n'));
                        connection.end();
                    }
                });
            // if there are enough products in stock for purchase to go through
            } else {
                selectedItem.howMany = answer.howMany;
                console.log(chalk.yellow.bold('\n\tOrder processing...'));

                // update database to reflect new stock quantity after sale
                connection.query('UPDATE products SET ? WHERE ?', [
                    {
                        stock_quantity: selectedItem.stock_quantity - answer.howMany,
                        product_sales: selectedItem.product_sales + (selectedItem.price * answer.howMany)
                    },
                    {
                        item_id: selectedItem.item_id
                    }
                ], function (err, res) {
                    console.log(chalk.green.bold(`\n\tOrder confirmed! Your total is $${(selectedItem.price * selectedItem.howMany).toFixed(2)}.\n`));
                    // ask if user would like to make another purchase
                    promptNewPurchase();
                });
            }
        });
    });
}

// function to ask if user would like to make another purchase
var promptNewPurchase = function() {
    inquirer.prompt({
        name: 'newPurchase',
        type: 'confirm',
        message: 'Would you like to make another purchase?'
    }).then(function (answer) {
        if (answer.newPurchase) {
            resetCart();
            askForID();
        } else {
            console.log(chalk.blue.bold('\n\tThanks for shopping with us. Have a great day!\n'));
            connection.end();
        }
    });
};