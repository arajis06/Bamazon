const mysql = require("mysql");
const inquirer = require("inquirer");
const chalk = require("chalk";)
const table = require("cli-table");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",

  password: "@Phoenix84",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected Successfully!");
  displayAllItems();
  //findProduct();
});

function displayAllItems() {
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      
      console.log("\n=================**PRODUCTS**==================\n"); 
      for (var i = 0; i < res.length; i++) {
        
        var productResults = 
        "Item Id: " + res[i].item_id +
        "\nProduct: " + res[i].product_name +
        "\nDepartment: " + res[i].department_name +
        "\nPrice: " + res[i].price +
        "\nIn Stock: " + res[i].stock_quantity +
        "\nProduct Sales: " + res[i].product_sales +
        "\n-----------------------------------------------";
        console.log(productResults);
      }
    });
  }

  function findProduct() {
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
          findProduct();
        });
      });
  }
  