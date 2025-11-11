import { Schema, model, Document } from "mongoose";

export interface UserDoc extends Document {
  email: string;
  name: string;
  passwordHash: string;
  role: "customer" | "seller" | "admin";
  emailVerified: boolean;
  address?: Array<{
    id: string;
    addressLine: string;
    city: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  seller?: {
    shopName: string;
    isActive: boolean;
    rating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}


const SellerSchema = new Schema(
  {
    shopName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
  },
  { _id: false } 
);

const AddressSchema = new Schema(
  {
    street:     { type: String, required: true, trim: true },
    city:       { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country:    { type: String, required: true, trim: true },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDoc>(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Formato de email inválido"],
    },
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    role: {
      type: String,
      enum: ["customer", "seller"],
      default: "customer",
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    seller: {
      type: SellerSchema,
      required: false,
    },
     address: { 
        type: [AddressSchema], default: [] 
    },
  },
  { timestamps: true }
);


UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, "seller.shopName": 1 });

export const UserModel = model<UserDoc>("User", UserSchema);
