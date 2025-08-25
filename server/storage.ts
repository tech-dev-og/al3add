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
  // Email/password auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User>;
  
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
  
  // Admin methods
  getAllUsersWithRoles(): Promise<any[]>;
  updateUserRole(userId: string, role: string): Promise<void>;
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

  // Helper method to get user ID (now returns string directly)
  private getUserId(replitUserId: string): string {
    return replitUserId;
  }

  // Email/password auth methods
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUserWithPassword(email: string, passwordHash: string, firstName?: string, lastName?: string): Promise<User> {
    const userId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        passwordHash,
        firstName,
        lastName,
      })
      .returning();
    return user;
  }

  // Profile methods
  async getProfile(userId: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const result = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  // Event methods
  async getEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(desc(events.eventDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(eventId: string, userId: string, updates: Partial<Event>): Promise<Event | undefined> {
    const result = await db
      .update(events)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteEvent(eventId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // User role methods
  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return result[0];
  }

  async hasRole(userId: string, role: string): Promise<boolean> {
    const result = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role as any)));
    return result.length > 0;
  }

  async assignRole(userRole: InsertUserRole): Promise<UserRole> {
    const result = await db.insert(userRoles).values(userRole).returning();
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

  // Admin methods
  async getAllUsersWithRoles(): Promise<any[]> {
    const usersWithRoles = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        createdAt: users.createdAt,
        role: userRoles.role,
        eventCount: 0, // Will be calculated below
      })
      .from(users)
      .leftJoin(userRoles, eq(users.id, userRoles.userId));

    // Get event counts for each user
    const eventsData = await db.select().from(events);
    const eventCounts = eventsData.reduce((acc: Record<string, number>, event) => {
      acc[event.userId] = (acc[event.userId] || 0) + 1;
      return acc;
    }, {});

    // Add event counts to users
    return usersWithRoles.map(user => ({
      ...user,
      eventCount: eventCounts[user.id] || 0,
    }));
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    if (role === 'none') {
      // Remove all roles for this user
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
    } else {
      // First remove existing roles, then add new one
      await db.delete(userRoles).where(eq(userRoles.userId, userId));
      await db.insert(userRoles).values({
        userId,
        role: role as 'admin' | 'moderator' | 'user',
      });
    }
  }
}

export const storage = new PostgresStorage();
