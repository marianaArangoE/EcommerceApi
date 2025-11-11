import {User} from "../domain/entities/User";
export interface UserRepository {
create(u: Omit<User, "id">): Promise<User>;
findByEmail(email: string): Promise<User | null>;
findById(id: string): Promise<User | null>;
  listSellers(opts?: {
    search?: string;
    page?: number;   
    limit?: number;  
  }): Promise<{ data: User[]; total: number }>;
}
