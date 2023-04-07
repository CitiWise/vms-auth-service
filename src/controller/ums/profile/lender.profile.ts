import { Request, Response } from "express";
import _ from "lodash";
import {
  UMSAddress,
  UMSEntityIdContact,
  UMSEntityProfile,
} from "../../../typeorm/entities";

import {
  getLenderProfileFields,
  updateContactProfileFields,
  reqUserDataKey,
  redisPrefix,
  contactFields,
  updateLenderProfileFields,
} from "../../../utils/constants";
import {
  generateUserContactFromData,
  generateUserProfileFromData,
  generateActionObject,
  generateContactActionObject,
} from "../../../utils/profile";
import bcrypt from "bcrypt";
import {
  IProfileType,
  IContactType,
  IDecodedDataType,
} from "../../../utils/interfaces";
import { Otp } from "../../../services/otp";
import { logger } from "../../../utils/logger";
import { LenderProfileType } from "../../../types/profile";
import { DBConnection } from "../../../typeorm/dbCreateConnection";
import { ContactService } from "../../../services/contact";
interface IAddressType {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface ILenderProfileType {
  name?: string;
  gst?: string;
  pan?: string;
  logoUrl?: string;
  signUrl?: string;
  address?: IAddressType;
}

export class LenderProfile {
  public static async get(req: Request, res: Response) {
    try {
      const { UMSDataSource } = DBConnection;
      const  entityId = "b9244141-32d8-4c1b-91e1-60e7512536eb";

      const userProfileRepo = UMSDataSource.getRepository(UMSEntityProfile);
      const userData = await userProfileRepo.find({ where: { entityId } });
      const profileObject: IProfileType = await generateUserProfileFromData(
        [...getLenderProfileFields],
        userData
      );

      const userContactRepo = UMSDataSource.getRepository(UMSEntityIdContact);
      const userContactData = await userContactRepo.find({
        where: { entityId },
      });
      const contactObject: IContactType = await generateUserContactFromData(
        contactFields,
        userContactData
      );

      const userAddressRepo = UMSDataSource.getRepository(UMSAddress);
      const address = await userAddressRepo.findOne({
        where: { id: profileObject?.address },
      });
      delete profileObject.address;

      const profile = {
        id: entityId,
        address: {
          line1: address?.line1,
          line2: address?.line2,
          pincode: address?.pincode,
          city: address?.city,
          state: address?.state,
          landmark: address?.landmark,
          country: address?.country,
        },
        ...profileObject,
        ...contactObject,
      };

      return res.json({
        responseCode: "000030",
        responseMessage: "Fetched Profile",
        status: "Success",
        responseBody: { ...profile },
      });
    } catch (err: any) {
      logger.error(err);
      return res.status(500).json({
        responseCode: "000005",
        responseMessage: "Internal Server Error",
        status: "Fail",
      });
    }
  }

  /**
   *   Steps to update a Lender profile
   * - Update contact
   * - update Address
   * - Update profile
   */
  public static async update(req: Request, res: Response) {
    let queryRunner;

    try {
      const { entityId }: IDecodedDataType = req[reqUserDataKey];
      const { UMSDataSource } = DBConnection;
      queryRunner = UMSDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      /**
       *   Steps to update a Lender profile
       * - Update contact
       * - update Address
       * - Update profile
       */

      // Update contact
      const contactProfileRepo =
        UMSDataSource.getRepository(UMSEntityIdContact);
      const contactData = await contactProfileRepo.find({
        where: { entityId },
      });

      const { updateContactObjectArray, deleteContactObjectArray } =
        generateContactActionObject(
          entityId,
          updateContactProfileFields,
          contactData,
          req
        );

      await queryRunner.manager.remove(deleteContactObjectArray);
      await queryRunner.manager.save(updateContactObjectArray);

      // Update address
      const addressValues = req.body.address;

      const profileRepo = UMSDataSource.getRepository(UMSEntityProfile);
      const addressObject = await profileRepo.findOne({
        where: { entityId, profileType: LenderProfileType.ADDRESS },
      });

      let address;

      if (addressObject) {
        address = await queryRunner.manager
          .createQueryBuilder()
          .update(UMSAddress)
          .set(addressValues)
          .where({ id: addressObject.profileValue })
          .execute();
      } else {
        address = await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into(UMSAddress)
          .values(addressValues)
          .execute();
      }

      // update profile
      const userProfileData = await profileRepo.find({ where: { entityId } });

      // Changing the req.body.address to id, as UMS_entity_profile schema stores
      // the id of address column in UMS_address table
      req.body.address = addressObject
        ? addressObject.profileValue
        : address.identifiers[0].id;
      const { updateObjectArray, deleteObjectArray } =
        await generateActionObject(
          entityId,
          updateLenderProfileFields,
          userProfileData,
          req
        );

      await queryRunner.manager.remove(deleteObjectArray);
      await queryRunner.manager.save(updateObjectArray);

      await queryRunner.commitTransaction();

      return res.json({
        responseMessage: "Profile update successfully.",
        status: "Success",
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return res.status(500).json({
        responseCode: "000005",
        responseMessage: "Internal Server Error",
        status: "Fail",
      });
    } finally {
      await queryRunner.release();
    }
  }



  public static async updatePassword(req: Request, res: Response) {
    try {
      const { entityId }: IDecodedDataType = req[reqUserDataKey];

      const { UMSDataSource } = DBConnection;
      const userProfileRepo = UMSDataSource.getRepository(UMSEntityProfile);
      const userPasswordData = await userProfileRepo.findOne({
        where: [{ entityId, profileType: LenderProfileType.PASSWORD }],
      });
      if (!userPasswordData) {
        return res.json({
          responseCode: "000032",
          responseMessage: "Password data does not exist",
          status: "Fail",
          responseBody: {},
        });
      }
      const response = await bcrypt.compare(
        req.body.password,
        userPasswordData.profileValue
      );
      if (!response) {
        return res.json({
          responseCode: "000033",
          responseMessage: " Old password is incorrect",
          status: "Fail",
          responseBody: {},
        });
      }
      if (req.body.newPassword !== req.body.confirmPassword) {
        return res.json({
          responseCode: "000033",
          responseMessage: "New Password do not match",
          status: "Fail",
          responseBody: {},
        });
      }
      userPasswordData.profileValue = await bcrypt.hash(
        req.body.newPassword,
        10
      );
      await userProfileRepo.save(userPasswordData);
      return res.json({
        responseCode: "000031",
        responseMessage: "Updated Password",
        status: "Success",
        responseBody: {},
      });
    } catch (error) {
      return res.status(500).json({
        responseCode: "000005",
        responseMessage: "Internal Server Error",
        status: "Fail",
      });
    }
  }

  public static async resetPassword(req: Request, res: Response) {
    try {
        const { UMSDataSource } = DBConnection;
      const { phone, otp, password } = req.body;
      const entityId = await ContactService.fetchEntityId("phone", phone);
      const userProfileRepo = UMSDataSource.getRepository(UMSEntityProfile);

      /**
       * Checking whether new password is same as old password or not
       */
      const userExistPasswordData = await userProfileRepo.findOne({
        where: [{ entityId, profileType: LenderProfileType.PASSWORD }],
      });
      if (userExistPasswordData) {
        const checkedPassword = await bcrypt.compare(
          password,
          userExistPasswordData.profileValue
        );
        if (checkedPassword) {
          throw new Error("Your new password is same as old password");
        }
      }

      // Verifying OTP whether its correct or not
      const key = `${redisPrefix.forgotPasswordOtp}${phone}`;
      await Otp.verify(key, otp);

      // Reset password for user
      const userPasswordData = await userProfileRepo.findOneOrFail({
        entityId,
        profileType: LenderProfileType.PASSWORD,
      });
      userPasswordData.profileValue = await bcrypt.hash(password, 10);
      await userProfileRepo.save(userPasswordData);

      return res.status(201).json({
        responseMessage: "Reset password successful!",
        status: "Success",
      });
    } catch (error: any) {
      logger.error(error);
      return res.status(500).json({
        responseCode: error.responseCode,
        responseMessage: error.message,
        status: "Fail",
      });
    }
  }
}
