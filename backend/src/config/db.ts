import MariaDB from "mariadb";
import { config } from ".";

// MariaDB 연결
export const dbPool = MariaDB.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  connectionLimit: 10,
  bigNumberStrings: true,
});
