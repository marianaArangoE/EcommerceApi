import { Router } from "express";
import UsersRoutes from "./UsersRoutes";
import AuthRoutes from "./AuthRoutes";
const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "ecommerce-api",
    ts: new Date().toISOString(),
  });
});
router.use("/users", UsersRoutes);
router.use("/auth", AuthRoutes);
export default router;
