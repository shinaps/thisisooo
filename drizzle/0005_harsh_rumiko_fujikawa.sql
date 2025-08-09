CREATE TABLE `article` (
	`id` text PRIMARY KEY NOT NULL,
	`interview_id` text NOT NULL,
	`title` text NOT NULL,
	`thumbnailUrl` text,
	`content` text,
	`created_at` integer NOT NULL,
	`published` integer NOT NULL,
	`author_id` text NOT NULL,
	FOREIGN KEY (`interview_id`) REFERENCES `interview`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `interview` DROP COLUMN `thumbnailUrl`;--> statement-breakpoint
ALTER TABLE `interview` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `interview` DROP COLUMN `published`;