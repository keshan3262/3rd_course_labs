-- This script creates a database (for 2nd lab)

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

CREATE SCHEMA IF NOT EXISTS `registry` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `registry` ;

-- -----------------------------------------------------
-- Table `registry`.`registry_certificates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_certificates` (
  `certificate_id` INT NOT NULL AUTO_INCREMENT,
  `owner_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`certificate_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_legal_entities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_legal_entities` (
  `name` VARCHAR(45) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `statutory_capital` INT NULL,
  `manager_id` VARCHAR(45) NOT NULL,
  `certificate_id` INT NOT NULL,
  `accounter_id` VARCHAR(45) NOT NULL,
  `record_creation_time` DATETIME NOT NULL,
  `removal_query_time` DATETIME NULL,
  PRIMARY KEY (`name`),
  INDEX `fk_Legal_entities_Certificates1_idx` (`certificate_id` ASC),
  CONSTRAINT `Got_certificate_ID`
    FOREIGN KEY (`certificate_id`)
    REFERENCES `registry`.`registry_certificates` (`certificate_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_individuals`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_individuals` (
  `card_number` BIGINT NOT NULL,
  `full_name` VARCHAR(45) NOT NULL,
  `legal_entity_name` VARCHAR(45) NULL DEFAULT NULL,
  `role_in_legal_entity` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`card_number`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_affiliates`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_affiliates` (
  `affiliate_name` VARCHAR(45) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `parent_entity_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`affiliate_name`),
  INDEX `Parent_idx` (`parent_entity_id` ASC),
  CONSTRAINT `Parent`
    FOREIGN KEY (`parent_entity_id`)
    REFERENCES `registry`.`registry_legal_entities` (`name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_services_rel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_services_rel` (
  `service_name` VARCHAR(45) NOT NULL,
  `providing_rules` TEXT NOT NULL,
  `affiliate_id` VARCHAR(45) NULL DEFAULT NULL,
  `legal_entities_id` VARCHAR(45) NULL DEFAULT NULL,
  `relation_id` INT NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`relation_id`),
  INDEX `fk_Services_rel_Affiliates1_idx` (`affiliate_id` ASC),
  INDEX `fk_Services_rel_Legal_entities1_idx` (`legal_entities_id` ASC),
  CONSTRAINT `fk_Services_rel_Affiliates1`
    FOREIGN KEY (`affiliate_id`)
    REFERENCES `registry`.`registry_affiliates` (`affiliate_name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Services_rel_Legal_entities1`
    FOREIGN KEY (`legal_entities_id`)
    REFERENCES `registry`.`registry_legal_entities` (`name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_licenses`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_licenses` (
  `license_number` BIGINT NOT NULL,
  `purpose` VARCHAR(45) NOT NULL,
  `issue_date` DATETIME NOT NULL,
  `owner_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`license_number`),
  INDEX `fk_Licenses_Legal_entities1_idx` (`owner_id` ASC),
  CONSTRAINT `Owner`
    FOREIGN KEY (`owner_id`)
    REFERENCES `registry`.`registry_legal_entities` (`name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_mgmt_department_worker`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_mgmt_department_worker` (
  `full_name` VARCHAR(45) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`full_name`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_registration_doc_pack`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_registration_doc_pack` (
  `card_id` INT NOT NULL AUTO_INCREMENT,
  `application` TEXT NOT NULL,
  `legal_entity_data` TEXT NOT NULL,
  `checked_by_id` VARCHAR(45) NOT NULL,
  `certificate_given_id` INT NULL,
  PRIMARY KEY (`card_id`),
  INDEX `fk_Registration_doc_pack_Registry_management_department_wor_idx` (`checked_by_id` ASC),
  INDEX `certificate_given_idx` (`certificate_given_id` ASC),
  CONSTRAINT `checked_by_whom`
    FOREIGN KEY (`checked_by_id`)
    REFERENCES `registry`.`registry_mgmt_department_worker` (`full_name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `certificate_given`
    FOREIGN KEY (`certificate_given_id`)
    REFERENCES `registry`.`registry_certificates` (`certificate_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_data_change_doc_pack`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_data_change_doc_pack` (
  `doc_pack_id` INT NOT NULL AUTO_INCREMENT,
  `certificate_id` INT NOT NULL,
  `changes_info` TEXT NOT NULL,
  `checked_by_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`doc_pack_id`),
  INDEX `Certificate_ID_idx` (`certificate_id` ASC),
  INDEX `fk_Rectructuring_doc_pack_Registry_management_department_wo_idx` (`checked_by_id` ASC),
  CONSTRAINT `Certificate_ID`
    FOREIGN KEY (`certificate_id`)
    REFERENCES `registry`.`registry_certificates` (`certificate_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `One_who_checked`
    FOREIGN KEY (`checked_by_id`)
    REFERENCES `registry`.`registry_mgmt_department_worker` (`full_name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `registry`.`registry_remove_doc_pack`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `registry`.`registry_remove_doc_pack` (
  `doc_pack_id` INT NOT NULL AUTO_INCREMENT,
  `application` TEXT NOT NULL,
  `message_in_massmedia` MEDIUMTEXT NOT NULL,
  `certificate_id` INT NOT NULL,
  `checked_by_id` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`doc_pack_id`),
  INDEX `Certificate_ID_idx` (`certificate_id` ASC),
  INDEX `Worker_full_name_idx` (`checked_by_id` ASC),
  CONSTRAINT `given_certificate_id`
    FOREIGN KEY (`certificate_id`)
    REFERENCES `registry`.`registry_certificates` (`certificate_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `worker_full_name`
    FOREIGN KEY (`checked_by_id`)
    REFERENCES `registry`.`registry_mgmt_department_worker` (`full_name`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
