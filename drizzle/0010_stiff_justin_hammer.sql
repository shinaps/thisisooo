DROP INDEX "article_interview_id_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_username_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "username" TO "username" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `article_interview_id_unique` ON `article` (`interview_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);