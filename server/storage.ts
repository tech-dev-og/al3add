import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { 
  users,
  profiles, 
  events, 
  userRoles, 
  translations, 
  smtpEmailLogs, 
  imageGenerationLogs,
  type User,
  type UpsertUser,
  type Profile, 
  type Event, 
  type UserRole, 
  type Translation,
  type InsertProfile,
  type InsertEvent,
  type InsertUserRole,
  type InsertTranslation
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);

export interface IStorage {
  // User operations (required by Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Profile methods
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  
  // Event methods
  getEvents(userId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(eventId: string, userId: string, updates: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(eventId: string, userId: string): Promise<boolean>;
  
  // User role methods
  getUserRole(userId: string): Promise<UserRole | undefined>;
  hasRole(userId: string, role: string): Promise<boolean>;
  assignRole(userRole: InsertUserRole): Promise<UserRole>;
  
  // Translation methods
  getTranslations(): Promise<Translation[]>;
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  updateTranslation(key: string, updates: Partial<Translation>): Promise<Translation | undefined>;
  deleteTranslation(key: string): Promise<boolean>;
}

export class PostgresStorage implements IStorage {
  // User operations (required by Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Helper method to convert string user ID to UUID for existing tables
  private getUserUuid(replitUserId: string): string {
    // For now, we'll create a deterministic UUID from the Replit user ID
    // In production, you might want to store this mapping in the database
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(replitUserId).digest('hex');
    // Convert hash to UUID format
    const uuid = [
      hash.slice(0, 8),
      hash.slice(8, 12),
      hash.slice(12, 16),
      hash.slice(16, 20),
      hash.slice(20, 32)
    ].join('-');
    return uuid;
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const userUuid = this.getUserUuid(userId);
    const result = await db.select().from(profiles).where(eq(profiles.userId, userUuid));
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const profileWithUuid = {
      ...profile,
      userId: this.getUserUuid(profile.userId)
    };
    const result = await db.insert(profiles).values(profileWithUuid).returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const userUuid = this.getUserUuid(userId);
    const result = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userUuid))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(userId: string): Promise<Event[]> {
    const userUuid = this.getUserUuid(userId);
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userUuid))
      .orderBy(desc(events.eventDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const eventWithUuid = {
      ...event,
      userId: this.getUserUuid(event.userId)
    };
    const result = await db.insert(events).values(eventWithUuid).returning();
    return result[0];
  }

  async updateEvent(eventId: string, userId: string, updates: Partial<Event>): Promise<Event | undefined> {
    const userUuid = this.getUserUuid(userId);
    const result = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(events.id, eventId), eq(events.userId, userUuid)))
      .returning();
    return result[0];
  }

  async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    const userUuid = this.getUserUuid(userId);
    const result = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userUuid)))
      .returning();
    return result.length > 0;
  }

  // User role methods
  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const userUuid = this.getUserUuid(userId);
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userUuid));
    return result[0];
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const userUuid = this.getUserUuid(userId);
    const result = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userUuid), eq(userRoles.role, role as any)));
    return result.length > 0;
  }

  async assignRole(userRole: InsertUserRole): Promise<UserRole> {
    const roleWithUuid = {
      ...userRole,
      userId: this.getUserUuid(userRole.userId)
    };
    const result = await db.insert(userRoles).values(roleWithUuid).returning();
    return result[0];
  }

  // Translation methods
  async getTranslations(): Promise<Translation[]> {
    return await db.select().from(translations);
  }

  async createTranslation(translation: InsertTranslation): Promise<Translation> {
    const result = await db.insert(translations).values(translation).returning();
    return result[0];
  }

  async updateTranslation(key: string, updates: Partial<Translation>): Promise<Translation | undefined> {
    const result = await db
      .update(translations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(translations.key, key))
      .returning();
    return result[0];
  }

  async deleteTranslation(key: string): Promise<boolean> {
    const result = await db
      .delete(translations)
      .where(eq(translations.key, key))
      .returning();
    return result.length > 0;
  }
}

export const storage = new PostgresStorage();
