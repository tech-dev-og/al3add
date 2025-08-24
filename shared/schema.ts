import { pgTable, text, varchar, timestamp, pgEnum, uuid, bigint, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth and email/password auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  passwordHash: varchar("password_hash"), // For email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enum for user roles
export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user"]);

// User profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull().unique(),
  username: text("username").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  eventType: text("event_type").notNull().default("countdown"),
  calculationType: text("calculation_type").default("days-left"),
  repeatOption: text("repeat_option").default("none"),
  backgroundImage: text("background_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// User roles table
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  role: appRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Translations table
export const translations = pgTable("translations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  namespace: text("namespace").notNull().default("common"),
  arabicText: text("arabic_text").notNull(),
  englishText: text("english_text").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// SMTP email logs table
export const smtpEmailLogs = pgTable("smtp_email_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  recipientEmail: text("recipient_email").notNull(),
  subject: text("subject").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("sent"),
  errorMessage: text("error_message"),
});

// Image generation logs table
export const imageGenerationLogs = pgTable("image_generation_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  prompt: text("prompt").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("success"),
  errorMessage: text("error_message"),
});

// Schema for insertions
export const insertUserSchema = createInsertSchema(users);
export const insertProfileSchema = createInsertSchema(profiles);
export const insertEventSchema = createInsertSchema(events);
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertTranslationSchema = createInsertSchema(translations);

// Types  
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
