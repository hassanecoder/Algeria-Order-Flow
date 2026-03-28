import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import customersRouter from "./customers";
import agentsRouter from "./agents";
import productsRouter from "./products";
import analyticsRouter from "./analytics";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/orders", ordersRouter);
router.use("/customers", customersRouter);
router.use("/agents", agentsRouter);
router.use("/products", productsRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);

export default router;
