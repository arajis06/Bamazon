const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Table = require("cli-table");
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",

  password: "@Phoenix84",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("\nConnected Successfully!");
  displayAllItems();
  //findProduct();
});

function displayAllItems() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;

      var table = new Table({
          head: ["Item Id", "Product Name", "Department", "Price"],
          colWidths: [10, 25, 25, 10]
      });

      console.log("\n=================================**PRODUCTS**=================================="); 
      for (var i = 0; i < res.length; i++) {
        
        table.push([
            res[i].item_id, 
            res[i].product_name, 
            res[i].department_name, 
            `$${res[i].price}`
        ]);

      }
      console.log(`\n\n${table.toString()}\n\n`);
      questions();
    });
  }

  function questions() {
    inquirer.prompt({
      name: "itemID",
      type: "input",
      message: "Please enter the ITEM ID of the product you would like to purchase?",
      validate: function(value) {
        if (!isNaN(value) && (value > 0 && value <= 10)) {
            return true;
        }
        else {
            console.log(" Please enter a number from 1-10");  
            return false;
        }
      } 
    })
    .then(function(answer) {
         connection.query = "SELECT product_name, product_department, price, stock_quanity FROM products WHERE ?",{ item_id: answer.itemID }, function(err, res) {
          if (err) throw err;
          process.exit();
          //confirmItem();
          askForQantity();
        };
      });
  }

function askForQantity() {
  inquirer.prompt({
    name: "quantity",
    type: "input",
    message: "Please enter the quantity?",
      validate: function(value) {
        if (!isNaN(value) && value > 0) {
            return true;
        }
        else {
            console.log(" Please enter a number greater than 0");  
            return false;
        }
      }
      .then(function(count) {
        connection.query = "SELECT stock_quanity FROM products WHERE ?",{ item_id: count.itemID }, 
        function(err, res) {
          if (res[0].stock_quantity < answer.quantity) {
            console.log("Out of Stock!");
          }
          if (err) throw err;
          process.exit();
        };
      })
      })
}

  