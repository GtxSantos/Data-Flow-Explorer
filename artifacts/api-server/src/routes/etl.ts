import { Router, type IRouter } from "express";
import { db, usersTable, etlResultsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { batchProcess } from "@workspace/integrations-openai-ai-server/batch";
import { desc, count, eq } from "drizzle-orm";

const router: IRouter = Router();

async function generateMessageForUser(user: {
  name: string;
  accountBalance: number;
  accountLimit: number;
  cardLimit: number;
}): Promise<string> {
  const prompt = `You are a helpful financial advisor from Santander Bank. Create a personalized, encouraging financial message for this customer. Keep it concise (2-3 sentences max), warm, and actionable.

Customer: ${user.name}
Account Balance: R$ ${user.accountBalance.toFixed(2)}
Account Limit: R$ ${user.accountLimit.toFixed(2)}
Card Limit: R$ ${user.cardLimit.toFixed(2)}

Write a personalized message in Portuguese (Brazilian) to help this customer make the most of their financial products. Be positive and specific to their situation.`;

  const response = await openai.chat.completions.create({
    model: "gpt-5-mini",
    max_completion_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  return response.choices[0]?.message?.content ?? "Olá! Continue investindo no seu futuro financeiro com o Santander.";
}

router.post("/etl/run", async (req, res): Promise<void> => {
  req.log.info("Starting ETL pipeline run");

  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  if (users.length === 0) {
    res.json({ processed: 0, results: [] });
    return;
  }

  const results = await batchProcess(
    users,
    async (user) => {
      const message = await generateMessageForUser({
        name: user.name,
        accountBalance: user.accountBalance,
        accountLimit: user.accountLimit,
        cardLimit: user.cardLimit,
      });

      await db
        .update(usersTable)
        .set({ aiMessage: message })
        .where(eq(usersTable.id, user.id));

      const [etlResult] = await db
        .insert(etlResultsTable)
        .values({
          userId: user.id,
          userName: user.name,
          message,
          stage: "loaded",
        })
        .returning();

      return etlResult;
    },
    { concurrency: 2, retries: 3 }
  );

  req.log.info({ processed: results.length }, "ETL pipeline completed");

  res.json({
    processed: results.length,
    results: results.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      message: r.message,
      stage: r.stage,
      createdAt: r.createdAt,
    })),
  });
});

router.get("/etl/results", async (req, res): Promise<void> => {
  const results = await db
    .select()
    .from(etlResultsTable)
    .orderBy(desc(etlResultsTable.createdAt))
    .limit(100);

  res.json(
    results.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.userName,
      message: r.message,
      stage: r.stage,
      createdAt: r.createdAt,
    }))
  );
});

router.get("/etl/stats", async (req, res): Promise<void> => {
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [resultCount] = await db.select({ count: count() }).from(etlResultsTable);

  const lastResult = await db
    .select({ createdAt: etlResultsTable.createdAt })
    .from(etlResultsTable)
    .orderBy(desc(etlResultsTable.createdAt))
    .limit(1);

  res.json({
    totalUsers: userCount?.count ?? 0,
    totalRuns: resultCount?.count ?? 0,
    lastRunAt: lastResult[0]?.createdAt?.toISOString() ?? null,
    messagesGenerated: resultCount?.count ?? 0,
  });
});

export default router;
