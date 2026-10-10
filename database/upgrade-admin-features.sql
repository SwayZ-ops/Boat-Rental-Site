-- For the EARLIER CORRECTED boat-rental schema only.
-- Export a backup and select the correct database in phpMyAdmin first.
-- Run once. Do not run after importing the new complete it37project.sql.
-- DDL changes are not rolled back as one transaction; stop if a statement fails.

ALTER TABLE `staff`
    ADD COLUMN `staffJobTitle` VARCHAR(100) DEFAULT NULL AFTER `staffRole`,
    ADD COLUMN `staffStatus` VARCHAR(20) NOT NULL DEFAULT 'active' AFTER `staffJobTitle`,
    ADD CONSTRAINT `chk_staff_status` CHECK (`staffStatus` IN ('active', 'inactive'));

ALTER TABLE `booking`
    ADD COLUMN `assignedStaffID` INT DEFAULT NULL AFTER `createdByStaffID`,
    ADD KEY `idx_booking_assigned_period` (`assignedStaffID`, `startDate`, `endDate`),
    ADD CONSTRAINT `fk_booking_assigned_staff`
        FOREIGN KEY (`assignedStaffID`) REFERENCES `staff` (`staffID`)
        ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE `payment`
    ADD COLUMN `payReference` VARCHAR(150) DEFAULT NULL AFTER `payMethod`;
