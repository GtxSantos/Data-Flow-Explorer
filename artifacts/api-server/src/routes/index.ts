import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import etlRouter from "./etl";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(etlRouter);

export default router;
