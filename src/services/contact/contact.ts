import { DBConnection } from "../../typeorm/dbCreateConnection";
import { UMSEntityIdContact } from "../../typeorm/entities/umsEntityIdContact";

const { UMSDataSource } = DBConnection;
export class ContactService {
  private static umsContactProfileRepo = () =>
  UMSDataSource.getRepository(UMSEntityIdContact);

  public static async fetchEntityId(contactType: string, contactValue: string) {
    try {
      const { entityId } = await this.umsContactProfileRepo().findOneOrFail({
        contactType,
        contactValue,
      });
      return entityId;
    } catch (error) {
      throw error;
    }
  }
}
