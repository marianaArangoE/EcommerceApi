import mongoose from "mongoose";

export async function connectMongo(uri: string) {
  if (!uri) throw new Error("MONGODB_URI no configurado");

  mongoose.set("strictQuery", true);
  const safeUri = uri.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@');
  console.log("[mongo] me estoy intentando conectar a:", safeUri);
  await mongoose.connect(uri);

  const { host, name } = mongoose.connection;
  console.log(`[mongo] conectado a ${host}/${name}`);
}
