import { Request, Response, NextFunction, RequestHandler } from "express";
import { JwtService } from "../../../../services/JwtService";

export type AuthUser = {
  id: string;
  role: "customer" | "seller" | "admin";
  email: string;
};

declare global {
  namespace Express {
    interface Request { user?: AuthUser; }
  }
}

const jwtService = new JwtService();

export const ensureAuth: RequestHandler = (req, res, next) => {
  const hdr = req.headers.authorization || "";
  const [type, token] = hdr.split(" ");
  if (type !== "Bearer" || !token) return res.status(401).json({ error: "Token no provisto" });
  try {
    const decoded: any = jwtService.verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

type Policy = (req: Request) => boolean;

export const isRole = (...roles: Array<"customer"|"seller"|"admin">): Policy =>
  (req) => !!req.user && roles.includes(req.user.role);

export const allow = (...policies: Policy[]): RequestHandler =>
  (req, res, next) => (policies.some(p => p(req)) ? next() : res.status(403).json({ error: "No autorizado" }));
