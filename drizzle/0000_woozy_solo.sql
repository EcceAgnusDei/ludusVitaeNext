-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"usedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grid" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"name" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isPublic" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grid_like" (
	"gridId" text NOT NULL,
	"userId" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "grid_like_pkey" PRIMARY KEY("userId","gridId")
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid" ADD CONSTRAINT "grid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_like" ADD CONSTRAINT "grid_like_gridId_fkey" FOREIGN KEY ("gridId") REFERENCES "public"."grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grid_like" ADD CONSTRAINT "grid_like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_token_expiresAt_idx" ON "password_reset_token" USING btree ("expiresAt" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "password_reset_token_tokenHash_key" ON "password_reset_token" USING btree ("tokenHash" text_ops);--> statement-breakpoint
CREATE INDEX "password_reset_token_userId_idx" ON "password_reset_token" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier" text_ops);--> statement-breakpoint
CREATE INDEX "grid_isPublic_createdAt_idx" ON "grid" USING btree ("isPublic" timestamptz_ops,"createdAt" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "grid_userId_idx" ON "grid" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "grid_like_gridId_idx" ON "grid_like" USING btree ("gridId" text_ops);--> statement-breakpoint
CREATE INDEX "grid_like_userId_idx" ON "grid_like" USING btree ("userId" text_ops);
*/