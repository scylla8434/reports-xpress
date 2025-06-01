-- Create the database
CREATE DATABASE IF NOT EXISTS hotel_db;
USE hotel_db;

-- Create the reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(255),
  room_number VARCHAR(50),
  check_in DATE,
  check_out DATE
);
