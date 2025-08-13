CREATE TABLE `article` (
	`id` text PRIMARY KEY NOT NULL,
	`interview_id` text NOT NULL,
	`title` text,
	`theme` text NOT NULL,
	`thumbnailUrl` text,
	`content` text,
	`status` integer NOT NULL,
	`created_at` integer NOT NULL,
	`published` integer NOT NULL,
	`author_id` text NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interview`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user_profile`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `article_interview_id_unique` ON `article` (`interview_id`);--> statement-breakpoint
CREATE INDEX `article_latest_published_idx` ON `article` ("created_at" DESC) WHERE "article"."published" = 1;--> statement-breakpoint
CREATE TABLE `interview` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`theme` text NOT NULL,
	`content` text NOT NULL,
	`author_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `user_profile`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`username` text NOT NULL,
	`image` text,
	`bio` text DEFAULT '' NOT NULL,
	`twitter` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_username_unique` ON `user_profile` (`username`);