import { PrismaClient } from "@prisma/client";

const DatabaseService = {
  instance: new PrismaClient(),
};

Object.freeze(DatabaseService);

export type IDatabaseService = typeof DatabaseService;
export default DatabaseService;
