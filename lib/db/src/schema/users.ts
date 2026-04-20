import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountAgency: text("account_agency").notNull(),
  accountBalance: real("account_balance").notNull().default(0),
  accountLimit: real("account_limit").notNull().default(0),
  cardNumber: text("card_number").notNull(),
  cardLimit: real("card_limit").notNull().default(0),
  aiMessage: text("ai_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, aiMessage: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
