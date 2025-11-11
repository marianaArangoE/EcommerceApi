export type Role = "customer" | "seller";

export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public name: string,
    public role: "customer" | "seller" | "admin",
    public emailVerified: boolean,
    public passwordHash: string,
    public address?: Array<{
        street: string;
        city: string;
        postalCode: string;
        country: string;
        }>,
    public seller?: {
        shopName: string;
        isActive: boolean;
        rating: number;
        }
  ) {}
}
