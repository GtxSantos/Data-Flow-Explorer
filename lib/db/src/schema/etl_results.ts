import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const etlResultsTable = pgTable("etl_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  stage: text("stage").notNull().default("loaded"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEtlResultSchema = createInsertSchema(etlResultsTable).omit({ id: true, createdAt: true });
export type InsertEtlResult = z.infer<typeof insertEtlResultSchema>;
export type EtlResult = typeof etlResultsTable.$inferSelect;
