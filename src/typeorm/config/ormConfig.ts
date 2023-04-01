import dotenv from "dotenv";
import path from "path";
import { DataSource, DataSourceOptions, FindOptionsUtils } from "typeorm";

dotenv.config({ path: path.join(__dirname, "../../../.env") });

const config: DataSourceOptions = {
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,

  legacySpatialSupport: false,
  synchronize: false,
  logging: false,
  entities: [
    path.join(__dirname, "../entities/**/*.ts"),
    path.join(__dirname, "../entities/**/*.js"),
  ],
  migrations: [path.join(__dirname, "../migrations/**/*.js")],
  subscribers: [
    path.join(__dirname, "../subscribers/**/*.ts"),
    path.join(__dirname, "../subscribers/**/*.js"),
  ],
  extra: {
    connectionLimit: 20,
  },
};
export default config;
