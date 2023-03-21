import { DataSource, DataSourceOptions } from "typeorm";
import { logger } from "../utils/logger";
import ormconfig from "./config/ormConfig";

export class DBConnection {
  static UMSDataSource;
  static config: any;

  static async init(config) {
    this.UMSDataSource = new DataSource(config);

    if (!this.UMSDataSource.isInitialized) {
      await this.UMSDataSource.initialize();
      logger.info("New Datasource UMSDataSource made");
    }
  }
}
