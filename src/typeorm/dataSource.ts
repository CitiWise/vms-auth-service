import { DataSource } from "typeorm";
import ormConfig from "./config/ormConfig";

console.log(ormConfig);
const dataSource = new DataSource(ormConfig);
export default dataSource;