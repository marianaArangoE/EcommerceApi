import bcrypt from "bcryptjs";
import { UserRepository } from "../../repositories/UserRepository";

type Input = { email: string; password: string };
type Output = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "seller" | "admin";
  emailVerified: boolean;
};

export class LoginUser {
  constructor(private users: UserRepository) {}

  async execute({ email, password }: Input): Promise<Output> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      const err: any = new Error("Credenciales inválidas");
      err.status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const err: any = new Error("Credenciales inválidas");
      err.status = 401;
      throw err;
    }


    return {
    id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as any,
      emailVerified: !!user.emailVerified,
    };
  }
}
