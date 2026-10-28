import "server-only";
import Database from "better-sqlite3";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const databasePath = path.join(process.cwd(), "orders.db");
const seedCandidates = [
  path.resolve(process.cwd(), "..", "seed.sql"),
  path.join(process.cwd(), "seed.sql"),
];

const globalForDatabase = globalThis;

function createDatabase() {
  const database = new Database(databasePath);
  database.pragma("journal_mode = WAL");

  const customersTable = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get("customers");

  if (!customersTable) {
    const seedPath = seedCandidates.find((candidate) => existsSync(candidate));

    if (!seedPath) {
      throw new Error("ไม่พบไฟล์ seed.sql สำหรับสร้างฐานข้อมูลออร์เดอร์");
    }

    database.exec(readFileSync(seedPath, "utf8"));
  }

  return database;
}

const database = globalForDatabase.ordersDatabase ?? createDatabase();
globalForDatabase.ordersDatabase = database;

export function getCustomerOrders() {
  return database
    .prepare(
      `SELECT
        customers.id AS customerId,
        customers.name AS customerName,
        customers.city AS city,
        orders.id AS orderId,
        orders.amount AS amount,
        orders.status AS status
      FROM customers
      LEFT JOIN orders ON orders.customer_id = customers.id
      ORDER BY customers.id, orders.id`,
    )
    .all();
}