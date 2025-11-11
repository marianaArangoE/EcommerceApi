import { RequestHandler } from "express";
import crypto from "crypto";
import { RegisterUser } from "../../../../../core/use-cases/User/RegisterUser";

type AddressItem = {
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

type UserPort = {
  findById(id: string): Promise<any | null>;
  updateById(id: string, patch: Partial<any>): Promise<any | null>;
};

export class UsersController {
  constructor(
    private readonly registerUser: RegisterUser,
    private readonly userPort: UserPort, 
  ) {}

  public register: RequestHandler = async (req, res, next) => {
    try {
      const result = await this.registerUser.execute(req.body);
      return res.status(201).json(result);
    } catch (err: any) {
      const status = err?.status ?? 500;
      res.status(status).json({ error: err?.message ?? "Internal Error" });
      return next(err);
    }
  };

  public updateMe: RequestHandler = async (req, res) => {
    try {
      const userId = req.user!.id;
      const { name, email, address } = req.body as {
        name?: string;
        email?: string;
        address?: AddressItem[];
      };

      const current = await this.userPort.findById(userId);
      if (!current) return res.status(404).json({ error: "Usuario no encontrado" });

      const patch: any = {};
      if (name !== undefined) patch.name = name;
      if (Array.isArray(address)) patch.address = address;

      if (email !== undefined && email !== current.email) {
        patch.email = email;
        patch.emailVerified = false;
        patch.emailVerificationToken = crypto.randomBytes(24).toString("hex");
        patch.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
      }

      const updated = await this.userPort.updateById(userId, patch);
      if (!updated) return res.status(404).json({ error: "Usuario no encontrado" });

      return res.json({
        id: updated._id ?? updated.id,
        name: updated.name,
        email: updated.email,
        address: updated.address ?? [],
        emailVerified: updated.emailVerified,
        role: updated.role,
      });
    } catch (err: any) {
      if (err?.code === 11000 && err?.keyPattern?.email) {
        return res.status(409).json({ error: "El email ya está registrado" });
      }
      return res.status(500).json({ error: "Error interno al actualizar perfil" });
    }
  };
}
