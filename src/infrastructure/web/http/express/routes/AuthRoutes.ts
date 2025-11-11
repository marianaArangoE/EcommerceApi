import { Router } from "express";
import { LoginUser } from "../../../../../core/use-cases/User/LoginUser";
import { UserAdaptersMongo } from "../../../../adapters/mongo/UserAdaptersMongo";
import { AuthController } from "../controllers/AuthController";
import { JwtService } from "../../../../services/JwtService";
import { ensureAuth } from "../middlewares/auth";

const router = Router();

const userRepo = new UserAdaptersMongo();
const loginUser = new LoginUser(userRepo);
const jwtService = new JwtService();
const controller = new AuthController(loginUser, jwtService);

router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", ensureAuth, (_req, res) => res.status(204).send());

export default router;
