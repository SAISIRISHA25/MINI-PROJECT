-- Step 1: Create the Database
CREATE DATABASE IF NOT EXISTS school_visits;
USE school_visits;

-- Step 2: Create the Table
CREATE TABLE IF NOT EXISTS visits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    relation VARCHAR(50) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    stu_name VARCHAR(100) NOT NULL,
    stu_age INT NOT NULL,
    contact BIGINT NOT NULL CHECK (LENGTH(contact) BETWEEN 10 AND 12), 
    visit_booking DATETIME NOT NULL,
    response TEXT
);


SELECT * FROM visits;



