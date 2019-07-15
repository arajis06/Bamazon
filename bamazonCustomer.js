const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk");
const Table = require("cli-table");

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

      console.log("\n==============================**PRODUCTS**================================"); 
      for (var i = 0; i < res.length; i++) {
        
        table.push([
            res[i].item_id, 
            res[i].product_name, 
            res[i].department_name, 
            `$${res[i].price}`
        ]);
        console.log(`\n\n${table.toString()}\n\n`);

        //getItemId();
      }
    });
  }

  function getItemId() {
    inquirer
    .prompt({
      name: "item_id",
      type: "input",
      message: "Please eneter the ITEM_ID of the product you would like to purchase?"
    })
    .then(function(answer) {
        var query = "SELECT product_name, product_department, price, stock_quanity FROM products WHERE ?";
        connection.query(query, { item_id: answer.item_id }, function(err, res) {
          if (err) throw err;
          for (var i = 0; i < res.length; i++) {
            console.log("Product: " + res[i].product_name + " || Department: " + res[i].department_name + " || Price: " + res[i].price + "|| In Stock: " + res[i].stock_quantity);
          }
          //findProduct();
        });
      });
  }
  