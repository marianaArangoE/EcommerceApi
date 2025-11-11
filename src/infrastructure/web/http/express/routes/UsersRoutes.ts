import { Router } from "express";
import { UserAdaptersMongo } from "../../../../adapters/mongo/UserAdaptersMongo";
import { RegisterUser } from "../../../../../core/use-cases/User/RegisterUser";
import { UsersController } from "../controllers/UserContoller";
import { ensureAuth, allow, isRole } from "../middlewares/auth";
import { buildUpdateValidator, rules } from "../middlewares/validators";

const router = Router();
const userAdapter = new UserAdaptersMongo();
const registerUser = new RegisterUser(userAdapter);
const controller = new UsersController(registerUser, userAdapter);

router.post("/register", controller.register);

router.patch(
  "/me",
  ensureAuth,
  allow(isRole("customer", "seller", "admin")), 
  ...buildUpdateValidator({
    allowed: ["name", "email", "address"],
    rules: {
      name: rules.name(),
      email: rules.email(),
      address: rules.address(),
    },
    forbidExtras: true,
  }),
  controller.updateMe
);

export default router;
