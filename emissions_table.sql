-- Run this SQL in your MySQL client to create the emissions table
CREATE TABLE IF NOT EXISTS emissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appliance VARCHAR(50),
  units INT,
  watt INT,
  hours DECIMAL(5,2),
  kwh DECIMAL(10,2),
  co2 DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
