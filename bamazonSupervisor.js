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
  console.log('Connection successful');
  resetData();
  // display all items from database once mysql connection has been established
  displayMenu();
});


// GLOBAL VARIABLES
// =====================================================================================
var deptToDelete = [];

// FUNCTIONS
// =====================================================================================
var resetData = function() {
    deptToDelete = [];
};

var displayMenu = function() {
    inquirer.prompt({
        name: 'action',
        type: 'rawlist',
        message: 'Choose an action:',
        choices: [
            'View Departments',
            'View Product Sales by Department',
            'Create New Department',
            'Delete A Department'
        ]
    }).then(function(answer) {
        switch (answer.action) {
            case 'View Departments':
                viewDepartments();
                break;
            case 'View Products Sales by Department':
                viewDepartmentSales();
                break;
            case 'Create New Department':
                createDepartment();
                break;
            case 'Delete A Department':
                deleteDepartment();
                break;
        }
    });
};

var viewDepartments = function() {
    connection.query('SELECT * FROM departments', function(err, res) {
        var productTable = new Table({
            head: ['Dept ID', 'Dept Name', 'Overhead'],
            colWidths: [10, 25, 12]
        });

        for (var i = 0; i < res.length; i++) {
            productTable.push([
                res[i].department_id, 
                res[i].department_name, 
                `$${res[i].over_head_costs}`
            ])
            // console.log(chalk.blue.bold(`\n\tDept ID: ${res[i].department_id}\n\tDept Name: ${res[i].department_name}\n\tOverhead Costs: $${res[i].over_head_costs}\n`));
        }

        console.log(`\n\n${productTable.toString()}\n\n`);
        displayMenu();
    });
};

var viewDepartmentSales = function() {
    connection.query("SELECT department_id, darpartment_name, over_head_cost, total_sales, FROM departments" + "Select product_sales FROM products", function(err, res) {
        if(err) throw err;
        var productTable = new Table({
            head: ['Dept ID', 'Dept Name', 'Overhead', 'Product Sales', 'Total Profit'],
            colWidths: [10, 25, 12, 12, 12]
        });
        
        for (var i = 0; i < res.length; i++) {

            var totalProfit = (res[i].total_sales - res[i].over_head_costs);

            productTable.push([
                res[i].department_id, 
                res[i].department_name, 
                `$${res[i].over_head_costs}`, 
                `$${res[i].product_sales}`,
                `$${totalProfit}`
                //`$${res[i].total_sales}`,

            ]);
        };
        displayMenu();
    });
}

var createDepartment = function() {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: 'Enter the department name:'
        },
        {
            name: 'overhead',
            type: 'input',
            message: 'Enter the overhead costs for this department:',
            validate: function(value) {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.red(' => Oops, please enter a number greater than 0'));
                    return false;
                }
            }
        },
    ]).then(function(answers) {
        connection.query('INSERT INTO departments SET ?', {
            department_name: answers.name,
            over_head_costs: answers.overhead
        }, function(err, res) {
            if (err) throw err;
            console.log(chalk.blue.bold('\n\tDepartment successfully added!\n'));
            displayMenu();
        });
    });
};

var deleteDepartment = function() {
    inquirer.prompt({
        name: 'deptID',
        type: 'input',
        message: 'Enter the ID of the department you\'d like to remove:'
    }).then(function(answer) {
        connection.query('SELECT * FROM departments WHERE ?', { department_id: answer.deptID }, function(err, res) {
            inquirer.prompt({
                name: 'confirm',
                type: 'confirm',
                message: `You would like to delete` + chalk.blue.bold(` '${res[0].department_name}'. `) + `Is this correct?`
            }).then(function(answer) {
                if (answer.confirm) {
                    deptToDelete.push(res);
                    connection.query('DELETE FROM departments WHERE ?', { department_id: deptToDelete[0][0].department_id }, (err, res) => {
                        if (err) throw err;
                        console.log(chalk.blue.bold('\n\tDepartment successfully deleted!\n'));
                        displayMenu();
                    });
                } else {
                    deleteDepartment();
                }
            });
        });
    });
};