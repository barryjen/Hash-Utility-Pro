import { 
  users, 
  type User, 
  type InsertUser,
  hashOperations,
  type HashOperation,
  type InsertHashOperation,
  hashLookups,
  type HashLookup,
  type InsertHashLookup
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHashOperation(operation: InsertHashOperation): Promise<HashOperation>;
  getHashOperations(): Promise<HashOperation[]>;
  createHashLookup(lookup: InsertHashLookup): Promise<HashLookup>;
  getHashLookups(): Promise<HashLookup[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hashOperations: Map<number, HashOperation>;
  private hashLookups: Map<number, HashLookup>;
  private currentUserId: number;
  private currentHashOperationId: number;
  private currentHashLookupId: number;

  constructor() {
    this.users = new Map();
    this.hashOperations = new Map();
    this.hashLookups = new Map();
    this.currentUserId = 1;
    this.currentHashOperationId = 1;
    this.currentHashLookupId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createHashOperation(operation: InsertHashOperation): Promise<HashOperation> {
    const id = this.currentHashOperationId++;
    const hashOperation: HashOperation = { 
      id,
      inputText: operation.inputText || null,
      fileName: operation.fileName || null,
      fileSize: operation.fileSize || null,
      hashResults: operation.hashResults || null,
      timestamp: new Date()
    };
    this.hashOperations.set(id, hashOperation);
    return hashOperation;
  }

  async getHashOperations(): Promise<HashOperation[]> {
    return Array.from(this.hashOperations.values());
  }

  async createHashLookup(lookup: InsertHashLookup): Promise<HashLookup> {
    const id = this.currentHashLookupId++;
    const hashLookup: HashLookup = { 
      id,
      hash: lookup.hash,
      hashType: lookup.hashType,
      originalValue: lookup.originalValue || null,
      found: lookup.found || "false",
      timestamp: new Date()
    };
    this.hashLookups.set(id, hashLookup);
    return hashLookup;
  }

  async getHashLookups(): Promise<HashLookup[]> {
    return Array.from(this.hashLookups.values());
  }
}

export const storage = new MemStorage();
