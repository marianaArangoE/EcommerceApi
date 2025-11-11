import { UserRepository } from "../../repositories/UserRepository";
import { User } from "../../domain/entities/User";
import bcrypt from "bcryptjs";

type Input = {
  email: string;
  name: string;
  password: string;
  address?: Array<{
    street: string;
    city: string;
    postalCode: string;
    country: string;
    }>;
  role?: "customer" | "seller" | "admin";
  seller?: { shopName: string; isActive?: boolean; rating?: number };
};

export class RegisterUser {
  constructor(private users: UserRepository) {}

  async execute(input: Input) {
    const { email, name, password, role = "customer", seller,address } = input;
    if (!email || !name || !password) {
      throw Object.assign(new Error("email, name y password son requeridos"), { status: 400 });
    }
    if (password.length < 8) {
      throw Object.assign(new Error("La contraseña debe tener al menos 8 caracteres"), { status: 400 });
    }
    if (role === "seller" && !seller?.shopName) {
      throw Object.assign(new Error("shopName es requerido para role seller"), { status: 400 });
    }

  
    const exists = await this.users.findByEmail(email.toLowerCase());
    if (exists) {
      throw Object.assign(new Error("Email ya registrado"), { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userToCreate = new User(
      "",
      email.toLowerCase(),
      name.trim(),
      role,
      false, 
      passwordHash,
        Array.isArray(address) ? address.map(a => ({
        street: a.street, city: a.city, postalCode: a.postalCode, country: a.country
      })) : [],
      role === "seller"
        ? {
            shopName: seller!.shopName.trim(),
            isActive: seller?.isActive ?? true,
            rating: seller?.rating ?? 0,
          }
        : undefined
    );

    const created = await this.users.create(userToCreate);
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      role: created.role,
      emailVerified: created.emailVerified,
      seller: created.seller,
      address: created.address ?? [],
    };
  }
}
