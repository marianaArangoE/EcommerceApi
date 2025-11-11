import { Request, Response, NextFunction } from "express";
import { LoginUser } from "../../../../../core/use-cases/User/LoginUser";
import { JwtService } from "../../../../services/JwtService";

export class AuthController {
  constructor(private loginUser: LoginUser, private jwt: JwtService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const user = await this.loginUser.execute({ email, password });

      const access = this.jwt.signAccessToken({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      const refresh = this.jwt.signRefreshToken({
        sub: user.id,
        role: user.role,
        email: user.email,
      });

      res.json({
        user,
        tokens: {
          accessToken: access,
          refreshToken: refresh,
        },
      });
    } catch (err: any) {
      res.status(err?.status ?? 500).json({ error: err?.message ?? "Internal Error" });
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "refreshToken requerido" });
      }

      const decoded: any = this.jwt.verifyRefreshToken(refreshToken);
      const access = this.jwt.signAccessToken({
        sub: decoded.sub,
        role: decoded.role,
        email: decoded.email,
      });

      res.json({ accessToken: access });
    } catch (err: any) {
      res.status(401).json({ error: "refreshToken inválido o expirado" });
      next(err);
    }
  };
}
