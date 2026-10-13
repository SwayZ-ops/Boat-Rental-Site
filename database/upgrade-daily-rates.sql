-- Run once after the earlier corrected hourly-rate schema and its admin-features upgrade.
-- Back up the database first and select it in phpMyAdmin before importing this file.
-- This renames the rate columns but keeps their numeric values and saved booking totals unchanged.
-- Review existing boat prices: after this migration, each value means PHP per 24-hour rental day.

ALTER TABLE `boat`
    DROP CONSTRAINT `chk_boat_hourly_price`,
    CHANGE COLUMN `pricePerHour` `pricePerDay` DECIMAL(10, 2) NOT NULL,
    ADD CONSTRAINT `chk_boat_daily_price` CHECK (`pricePerDay` > 0);

ALTER TABLE `booking`
    DROP CONSTRAINT `chk_booking_rate`,
    CHANGE COLUMN `hourlyRateAtBooking` `dailyRateAtBooking` DECIMAL(10, 2) NOT NULL,
    ADD CONSTRAINT `chk_booking_daily_rate` CHECK (`dailyRateAtBooking` > 0);
