import { UserModel } from "./UserModel";
import { UserRepository } from "../../../core/repositories/UserRepository";
import { User } from "../../../core/domain/entities/User";

function mapDocToEntity(doc: any): User {
  return new User(
    doc._id.toString(),
    doc.email,
    doc.name,
    doc.role,
    doc.emailVerified,
    doc.passwordHash,
    Array.isArray(doc.address)
      ? doc.address.map((a: any) => ({
          street: a.street,
          city: a.city,
          postalCode: a.postalCode,
          country: a.country,
        }))
      : [],
    doc.seller
      ? {
          shopName: doc.seller.shopName,
          isActive: doc.seller.isActive,
          rating: doc.seller.rating,
        }
      : undefined
  );
}

export class UserAdaptersMongo implements UserRepository {
  async create(u: Omit<User, "id">): Promise<User> {
    const created = await UserModel.create({
      email: u.email,
      name: u.name,
      passwordHash: u.passwordHash,
      role: u.role,
      emailVerified: u.emailVerified,
      seller: u.seller,
      address: u.address ?? [],
    });
    return mapDocToEntity(created.toObject());
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel
      .findOne({ email })
      .select("+passwordHash")
      .lean();
    return doc ? mapDocToEntity(doc) : null;
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id).lean();
    return doc ? mapDocToEntity(doc) : null;
  }

  async updateById(
    id: string,
    patch: Partial<Pick<User, "name" | "email" | "address" | "emailVerified">>
  ): Promise<User | null> {
    const update: any = {};

    if (patch.name !== undefined) {
      update.name = patch.name;
    }

    if (Array.isArray(patch.address)) {
      update.address = patch.address.map((a: any) => ({
        street: a.street,
        city: a.city,
        postalCode: a.postalCode,
        country: a.country,
      }));
    }

    if (patch.email !== undefined) {
      update.email = patch.email;
      update.emailVerified = false;
    }

    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    return doc ? mapDocToEntity(doc) : null;
  }

  async listSellers(
    opts?: { search?: string; page?: number; limit?: number }
  ): Promise<{ data: User[]; total: number }> {
    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.max(1, Math.min(50, opts?.limit ?? 10));
    const query: any = { role: "seller" };

    if (opts?.search) {
      query["seller.shopName"] = { $regex: opts.search, $options: "i" };
    }

    const [docs, total] = await Promise.all([
      UserModel.find(query)
        .select("email name role emailVerified seller address")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(query),
    ]);

    return { data: docs.map(mapDocToEntity), total };
  }
}
