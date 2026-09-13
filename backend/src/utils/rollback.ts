import { rollbackMigration, sequelize } from "./db.js";

try {
  await rollbackMigration();
  console.log("Last migration rolled back");
} finally {
  await sequelize.close();
}
