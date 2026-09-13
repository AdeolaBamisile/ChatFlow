import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";
import { DATABASE } from "./config.js";

export const sequelize = new Sequelize(DATABASE, {
  dialect: "postgres",
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

export const createMigrator = () =>
  new Umzug({
    migrations: { glob: "src/migrations/*.ts" },
    storage: new SequelizeStorage({ sequelize, tableName: "migrations" }),
    context: sequelize.getQueryInterface(),
    logger: console,
  });

export const runMigrations = async (): Promise<void> => {
  const migrator = createMigrator();
  await migrator.up();
};

export const rollbackMigration = async (): Promise<void> => {
  const migrator = createMigrator();
  await migrator.down();
};

export const connectToDatabase = async (): Promise<void> => {
  await sequelize.authenticate();
  await runMigrations();
  console.log("Connected to PostgreSQL");
};
