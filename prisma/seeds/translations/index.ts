import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  try {
    const sqlPath = path.join(__dirname, "data.sql");

    const rawSql = await fs.promises.readFile(sqlPath, { encoding: "utf-8" });
    const sqlStatements = rawSql.split(";");

    for (const statement of sqlStatements) {
      await prisma.$executeRawUnsafe(statement);
    }
  } catch (error) {
    console.error(`An error occurred running translation seeding`, error);
  }
}

main();
