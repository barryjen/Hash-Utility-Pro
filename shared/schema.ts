import { pgTable, text, serial, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const hashOperations = pgTable("hash_operations", {
  id: serial("id").primaryKey(),
  inputText: text("input_text"),
  fileName: text("file_name"),
  fileSize: text("file_size"),
  hashResults: json("hash_results").$type<Record<string, string>>(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const hashLookups = pgTable("hash_lookups", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull(),
  hashType: text("hash_type").notNull(),
  originalValue: text("original_value"),
  found: text("found").notNull().default("false"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertHashOperationSchema = createInsertSchema(hashOperations).omit({
  id: true,
  timestamp: true,
});

export const insertHashLookupSchema = createInsertSchema(hashLookups).omit({
  id: true,
  timestamp: true,
});

export type InsertHashOperation = z.infer<typeof insertHashOperationSchema>;
export type HashOperation = typeof hashOperations.$inferSelect;
export type InsertHashLookup = z.infer<typeof insertHashLookupSchema>;
export type HashLookup = typeof hashLookups.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
