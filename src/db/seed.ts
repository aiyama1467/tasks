import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { categories } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const defaultCategories = [
  { name: "ゲーム", icon: "gamepad-2", position: 0 },
  { name: "本", icon: "book-open", position: 1 },
  { name: "映画", icon: "film", position: 2 },
  { name: "アニメ", icon: "tv", position: 3 },
  { name: "音楽", icon: "music", position: 4 },
  { name: "その他", icon: "folder", position: 5 },
];

async function seed() {
  console.log("Seeding categories...");
  for (const cat of defaultCategories) {
    await db.insert(categories).values(cat).onConflictDoNothing({ target: categories.name });
  }
  console.log("Seeding complete.");
}

seed().catch(console.error);
