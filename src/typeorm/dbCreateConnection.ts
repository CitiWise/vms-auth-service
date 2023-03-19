import { DataSource, DataSourceOptions } from "typeorm";
import { logger } from "../utils/logger";
import ormconfig from "./config/ormConfig";

/**
 * Class - Manage database connections
 *
 */


export class Database {
  private config: any;
 

  constructor(config?: DataSourceOptions) {
    this.config = config;
  }

  public async getConnection(): Promise<DataSource> {
    const VMSDataSource = new DataSource(this.config || ormconfig);

    if (!VMSDataSource.isInitialized) await VMSDataSource.initialize();
    logger.info("New DB VMSDataSource made");

    return VMSDataSource;
  }
}
