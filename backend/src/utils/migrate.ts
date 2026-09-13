import { connectToDatabase, rollbackMigration, sequelize } from "./db.js";

const command = process.argv[2] ?? "up";

try {
  await connectToDatabase();
  if (command === "down") {
    await rollbackMigration();
    console.log("Last migration rolled back");
  } else {
    console.log("Migrations are up to date");
  }
} finally {
  await sequelize.close();
}
