import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateUserBody,
  GetUserParams,
  DeleteUserParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  const result = users.map((u) => ({
    id: u.id,
    name: u.name,
    account: {
      number: u.accountNumber,
      agency: u.accountAgency,
      balance: u.accountBalance,
      limit: u.accountLimit,
    },
    card: {
      number: u.cardNumber,
      limit: u.cardLimit,
    },
    aiMessage: u.aiMessage,
    createdAt: u.createdAt,
  }));
  res.json(result);
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const d = parsed.data;
  const [user] = await db
    .insert(usersTable)
    .values({
      name: d.name,
      accountNumber: d.accountNumber,
      accountAgency: d.accountAgency,
      accountBalance: d.accountBalance,
      accountLimit: d.accountLimit,
      cardNumber: d.cardNumber,
      cardLimit: d.cardLimit,
    })
    .returning();

  res.status(201).json({
    id: user.id,
    name: user.name,
    account: {
      number: user.accountNumber,
      agency: user.accountAgency,
      balance: user.accountBalance,
      limit: user.accountLimit,
    },
    card: {
      number: user.cardNumber,
      limit: user.cardLimit,
    },
    aiMessage: user.aiMessage,
    createdAt: user.createdAt,
  });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    account: {
      number: user.accountNumber,
      agency: user.accountAgency,
      balance: user.accountBalance,
      limit: user.accountLimit,
    },
    card: {
      number: user.cardNumber,
      limit: user.cardLimit,
    },
    aiMessage: user.aiMessage,
    createdAt: user.createdAt,
  });
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [user] = await db
    .delete(usersTable)
    .where(eq(usersTable.id, params.data.id))
    .returning();

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
