CREATE TABLE `users` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`display_name` VARCHAR(255) NOT NULL UNIQUE,
	`google_id` VARCHAR(255) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`is_teacher` BINARY NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `groups` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `group_users` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`user_id` INT(11) NOT NULL,
	`group_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `games` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` TEXT(255) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`deleted_at` TIMESTAMP NULL default null,
	`movement_rule_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `game_groups` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`group_id` INT(11) NOT NULL,
	`game_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `board_bindings` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`board_group_id` INT(11) NOT NULL,
	`game_id` INT(11) NOT NULL,
	`question_category_id` INT(11) NOT NULL,
	`weigth` INT(11) NOT NULL,
	`tag_usage` ENUM('BLACKLIST', 'WHITELIST'),
	`difficulty` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `board_groups` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `questions` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`question_category_id` INT(11) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`created_by` INT(11) NOT NULL,
	`has_error` BINARY NOT NULL,
	`difficulty` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_answers` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`text` VARCHAR(255) NOT NULL,
	`question_id` INT(11) NOT NULL,
	`is_correct` BOOLEAN NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_views` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`image_url` VARCHAR(255) NOT NULL,
	`question_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_categories` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL UNIQUE,
	`color` VARCHAR(255) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `moves` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`game_id` INT(11) NOT NULL,
	`to_field_id` INT(11) NOT NULL,
	`question_attempt_id` INT(11),
	`group_id` INT(11) NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	`updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
);

CREATE TABLE `board_fields` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`x` INT(11) NOT NULL,
	`y` INT(11) NOT NULL,
	`z` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `board_field_groups` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`board_group_id` INT(11) NOT NULL,
	`board_field_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_attempts` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`chosen_answer_id` INT(11),
	`question_id` INT(11) NOT NULL,
	`called_error` BINARY NOT NULL,
	`created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`)
);

CREATE TABLE `movement_rules` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`vertical_max` INT(11) NOT NULL,
	`is_3d` BINARY NOT NULL,
	`diagonal_max` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_tags` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`name` TEXT(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `question_tags_question` (
	`id` INT(11) AUTO_INCREMENT NOT NULL,
	`question_tag_id` INT(11) NOT NULL,
	`question_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `board_binding_question_tags` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`board_binding_id` INT(11) NOT NULL,
	`question_tag_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `group_users` ADD CONSTRAINT `group_users_fk0` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`);

ALTER TABLE `group_users` ADD CONSTRAINT `group_users_fk1` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`);

ALTER TABLE `games` ADD CONSTRAINT `games_fk0` FOREIGN KEY (`movement_rule_id`) REFERENCES `movement_rules`(`id`);

ALTER TABLE `game_groups` ADD CONSTRAINT `game_groups_fk0` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`);

ALTER TABLE `game_groups` ADD CONSTRAINT `game_groups_fk1` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`);

ALTER TABLE `board_bindings` ADD CONSTRAINT `board_bindings_fk0` FOREIGN KEY (`board_group_id`) REFERENCES `board_groups`(`id`);

ALTER TABLE `board_bindings` ADD CONSTRAINT `board_bindings_fk1` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`);

ALTER TABLE `board_bindings` ADD CONSTRAINT `board_bindings_fk2` FOREIGN KEY (`question_category_id`) REFERENCES `question_categories`(`id`);

ALTER TABLE `questions` ADD CONSTRAINT `questions_fk0` FOREIGN KEY (`question_category_id`) REFERENCES `question_categories`(`id`);

ALTER TABLE `questions` ADD CONSTRAINT `questions_fk1` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`);

ALTER TABLE `question_answers` ADD CONSTRAINT `question_answers_fk0` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`);

ALTER TABLE `question_views` ADD CONSTRAINT `question_views_fk0` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`);

ALTER TABLE `moves` ADD CONSTRAINT `moves_fk0` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`);

ALTER TABLE `moves` ADD CONSTRAINT `moves_fk1` FOREIGN KEY (`to_field_id`) REFERENCES `board_fields`(`id`);

ALTER TABLE `moves` ADD CONSTRAINT `moves_fk2` FOREIGN KEY (`question_attempt_id`) REFERENCES `question_attempts`(`id`);

ALTER TABLE `moves` ADD CONSTRAINT `moves_fk3` FOREIGN KEY (`group_id`) REFERENCES `game_groups`(`id`);

ALTER TABLE `board_field_groups` ADD CONSTRAINT `board_field_groups_fk0` FOREIGN KEY (`board_group_id`) REFERENCES `board_groups`(`id`) ON DELETE CASCADE;

ALTER TABLE `board_field_groups` ADD CONSTRAINT `board_field_groups_fk1` FOREIGN KEY (`board_field_id`) REFERENCES `board_fields`(`id`);

ALTER TABLE `question_attempts` ADD CONSTRAINT `question_attempts_fk0` FOREIGN KEY (`chosen_answer_id`) REFERENCES `question_answers`(`id`);

ALTER TABLE `question_attempts` ADD CONSTRAINT `question_attempts_fk1` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`);

ALTER TABLE `question_tags_question` ADD CONSTRAINT `question_tags_question_fk0` FOREIGN KEY (`question_tag_id`) REFERENCES `question_tags`(`id`);

ALTER TABLE `question_tags_question` ADD CONSTRAINT `question_tags_question_fk1` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`);

ALTER TABLE `board_binding_question_tags` ADD CONSTRAINT `board_binding_question_tags_fk0` FOREIGN KEY (`board_binding_id`) REFERENCES `board_bindings`(`id`);

ALTER TABLE `board_binding_question_tags` ADD CONSTRAINT `board_binding_question_tags_fk1` FOREIGN KEY (`question_tag_id`) REFERENCES `question_tags`(`id`);
