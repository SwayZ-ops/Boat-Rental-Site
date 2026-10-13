-- BOAT RENTAL: complete schema for a NEW / EMPTY database.
-- Import this file in phpMyAdmin. It contains no sample records or login accounts.
-- If it37project already contains your old tables, use the separate migration
-- instructions instead, or change BOTH database names below to a new name.
-- Existing tables are never dropped or overwritten by this file.

CREATE DATABASE IF NOT EXISTS `it37project`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE `it37project`;

-- 1. Customers / clients
CREATE TABLE `customer` (
    `custID` INT NOT NULL AUTO_INCREMENT,
    `custFirstName` VARCHAR(30) NOT NULL,
    `custLastName` VARCHAR(30) NOT NULL,
    `custEmail` VARCHAR(254) NOT NULL,
    `custPhoneNum` VARCHAR(20) NOT NULL,
    `custAddress` VARCHAR(255) NOT NULL,
    -- Optional: only needed if customer login is added later.
    -- Store a PHP password_hash() result, never a plain-text password.
    `custPassword` VARCHAR(255) DEFAULT NULL,
    `custAccCreated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`custID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Admin and staff accounts share this table.
CREATE TABLE `staff` (
    `staffID` INT NOT NULL AUTO_INCREMENT,
    `staffFirstName` VARCHAR(30) NOT NULL,
    `staffLastName` VARCHAR(30) NOT NULL,
    `staffUsername` VARCHAR(50) NOT NULL,
    `staffRole` VARCHAR(20) NOT NULL DEFAULT 'staff',
    `staffJobTitle` VARCHAR(100) DEFAULT NULL,
    `staffStatus` VARCHAR(20) NOT NULL DEFAULT 'active',
    `staffEmail` VARCHAR(254) NOT NULL,
    `staffPhoneNum` VARCHAR(20) NOT NULL,
    `staffAddress` VARCHAR(255) NOT NULL,
    -- Store a PHP password_hash() result, never a plain-text password.
    `staffPassword` VARCHAR(255) NOT NULL,
    `staffCreated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`staffID`),
    UNIQUE KEY `uq_staff_username` (`staffUsername`),
    CONSTRAINT `chk_staff_role` CHECK (`staffRole` IN ('admin', 'staff')),
    CONSTRAINT `chk_staff_status` CHECK (`staffStatus` IN ('active', 'inactive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Boat categories
CREATE TABLE `boat_type` (
    `typeID` INT NOT NULL AUTO_INCREMENT,
    `typeName` VARCHAR(50) NOT NULL,
    `typeDesc` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`typeID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Boats / resources
CREATE TABLE `boat` (
    `boatID` INT NOT NULL AUTO_INCREMENT,
    `typeID` INT NOT NULL,
    `boatName` VARCHAR(50) NOT NULL,
    `boatDesc` VARCHAR(200) NOT NULL,
    `capacity` INT NOT NULL,
    `pricePerDay` DECIMAL(10, 2) NOT NULL,
    `boatLocation` VARCHAR(200) NOT NULL,
    `boatStatus` VARCHAR(30) NOT NULL DEFAULT 'available',
    -- Uploaded image filename/path, for example uploads/boat-12.jpg.
    -- Store the actual image file in a folder, not in this VARCHAR column.
    `boatImage` VARCHAR(255) DEFAULT NULL,

    PRIMARY KEY (`boatID`),
    KEY `idx_boat_type` (`typeID`),
    CONSTRAINT `fk_boat_type`
        FOREIGN KEY (`typeID`) REFERENCES `boat_type` (`typeID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `chk_boat_capacity` CHECK (`capacity` > 0),
    CONSTRAINT `chk_boat_daily_price` CHECK (`pricePerDay` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. Bookings (this CREATE TABLE was missing from the original SQL file).
CREATE TABLE `booking` (
    `bookingID` INT NOT NULL AUTO_INCREMENT,
    `custID` INT NOT NULL,
    `boatID` INT NOT NULL,
    -- The admin or staff account that created the booking, not an assigned captain.
    `createdByStaffID` INT NOT NULL,
    -- Assigned rental personnel; separate from the account creating the booking.
    `assignedStaffID` INT DEFAULT NULL,
    `startDate` DATETIME NOT NULL,
    `endDate` DATETIME NOT NULL,
    `numGuests` INT NOT NULL,
    -- Keep the agreed rate even if the boat's current price changes later.
    `dailyRateAtBooking` DECIMAL(10, 2) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `bookingStatus` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `bookingCreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `cancelledByStaffID` INT DEFAULT NULL,
    `cancelledAt` DATETIME DEFAULT NULL,

    PRIMARY KEY (`bookingID`),
    KEY `idx_booking_customer` (`custID`),
    KEY `idx_booking_boat_period` (`boatID`, `startDate`, `endDate`),
    KEY `idx_booking_creator` (`createdByStaffID`),
    KEY `idx_booking_assigned_period` (`assignedStaffID`, `startDate`, `endDate`),
    KEY `idx_booking_canceller` (`cancelledByStaffID`),
    CONSTRAINT `fk_booking_customer`
        FOREIGN KEY (`custID`) REFERENCES `customer` (`custID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_booking_boat`
        FOREIGN KEY (`boatID`) REFERENCES `boat` (`boatID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_booking_creator`
        FOREIGN KEY (`createdByStaffID`) REFERENCES `staff` (`staffID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_booking_canceller`
        FOREIGN KEY (`cancelledByStaffID`) REFERENCES `staff` (`staffID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `fk_booking_assigned_staff`
        FOREIGN KEY (`assignedStaffID`) REFERENCES `staff` (`staffID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `chk_booking_period` CHECK (`endDate` > `startDate`),
    CONSTRAINT `chk_booking_guests` CHECK (`numGuests` > 0),
    CONSTRAINT `chk_booking_daily_rate` CHECK (`dailyRateAtBooking` > 0),
    CONSTRAINT `chk_booking_total` CHECK (`totalAmount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. Payments associated with a booking
CREATE TABLE `payment` (
    `payID` INT NOT NULL AUTO_INCREMENT,
    `bookingID` INT NOT NULL,
    `payDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `payAmount` DECIMAL(10, 2) NOT NULL,
    `payMethod` VARCHAR(30) NOT NULL,
    `payReference` VARCHAR(150) DEFAULT NULL,
    `payStatus` VARCHAR(30) NOT NULL DEFAULT 'paid',

    PRIMARY KEY (`payID`),
    KEY `idx_payment_booking` (`bookingID`),
    KEY `idx_payment_date` (`payDate`),
    CONSTRAINT `fk_payment_booking`
        FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT `chk_payment_amount` CHECK (`payAmount` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
