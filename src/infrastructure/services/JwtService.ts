import jwt, { Secret, SignOptions } from "jsonwebtoken";

type SignArgs = {
  sub: string;
  role: "customer" | "seller" | "admin";
  email: string;
};
type ExpiresIn = SignOptions["expiresIn"];

export class JwtService {
  private accessSecret: Secret;
  private refreshSecret: Secret;
  private accessExpires: ExpiresIn;
  private refreshExpires: ExpiresIn;

  constructor() {
    this.accessSecret = (process.env.JWT_ACCESS_SECRET ?? "dev_access_secret") as Secret;
    this.refreshSecret = (process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret") as Secret;
    this.accessExpires = this.pickExpires(process.env.JWT_ACCESS_EXPIRES, "15m");
    this.refreshExpires = this.pickExpires(process.env.JWT_REFRESH_EXPIRES, "7d");
  }


  private pickExpires(value: string | undefined, fallback: ExpiresIn): ExpiresIn {
    if (!value) return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? (n as ExpiresIn) : (value as ExpiresIn);
  }

  signAccessToken(payload: SignArgs): string {
    const opts: SignOptions = {
      subject: payload.sub,
      expiresIn: this.accessExpires,
    };
    return jwt.sign({ role: payload.role, email: payload.email }, this.accessSecret, opts);
  }

  signRefreshToken(payload: SignArgs): string {
    const opts: SignOptions = {
      subject: payload.sub,
      expiresIn: this.refreshExpires,
    };
    return jwt.sign({ role: payload.role, email: payload.email }, this.refreshSecret, opts);
  }

  verifyAccessToken(token: string) {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token: string) {
    return jwt.verify(token, this.refreshSecret);
  }
}
