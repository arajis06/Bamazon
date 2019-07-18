-- Drops the bamazon_db if it already exists --
DROP DATABASE IF EXISTS bamazon_db;

-- Create a database called bamazon_db --
CREATE DATABASE bamazon_db;

-- Use bamazon db for the following statements --
USE bamazon_db;

CREATE TABLE products (
  	item_id INTEGER(20) AUTO_INCREMENT NOT NULL ,
	product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(20) NOT NULL,
	price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER(50) NOT NULL, 
    PRIMARY KEY (item_id)
);
-- Create new  rows
SELECT * FROM products;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Kindle Fire", "Electronics", 149.00, 17),
	   ("Expresso Maker", "Home & Kitchen", 89.00, 11),
       ("Becoming Michelle Obama", "Books", 17.95, 26),
       ("Frye Riding Boots", "Shoes", 249.99, 55),
       ("HP Envy Labtop", "Computers", 1199.99, 12),
       ("L.O.L Surprise", "Toys & Games", 69.99, 82),
       ("Camper Tent", "Outdoors", 112.49, 6),
       ("Ear Buds", "Electronics", 49.99, 71),
       ("Makeup Brushes", "Beauty", 24.99, 43),
       ("Avatar", "Movies", 15.99, 17);
  
ALTER TABLE products ADD COLUMN product_sales DECIMAL(10, 2) DEFAULT '0.00';
  
CREATE TABLE departments (
    department_id INT NOT NULL AUTO_INCREMENT,
    department_name TEXT NOT NULL,
    over_head_costs DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (department_id)
);

INSERT INTO departments (department_name, over_head_costs)
VALUES 
("Home & Kitchen", 3000),
("Movies", 6000),
("Electronics", 10000),
("Beauty", 8000),
("Outdoors", 7000),
("Toys & Games", 9000),
("Books", 4000),
("Shoes", 6500),
("Computers", 20000);