import { Request, Response } from "express";
import _ from "lodash";
import {
  UMSEntityProfile,
  UMSEntityIdContact,
} from "../../../typeorm/entities";
import {
  EAuthMode,
  reqUserDataKey,
  redisPrefix,
  EMAIL_TEMPLATE_FILE_NAME_MAPPER,
} from "../../../utils/constants";
import { fetchContactFieldValue } from "../../../utils/profile";
import { IDecodedDataType } from "../../../utils/interfaces";
import { EmailOtp, Otp } from "../../../services";
import { logger } from "../../../utils/logger";
import { StatusCodes } from "http-status-codes";
import { ValuerProfileType } from "../../../types/profile";
import { DBConnection } from "../../../typeorm/dbCreateConnection";

export class OtpController {
  public static async verify(req: Request, res: Response) {
    try {
      const { entityId }: IDecodedDataType = req[reqUserDataKey];
      const { emailVerificationOtp } = req.body;

      await Otp.verify(
        `${redisPrefix.signupEmailOtp}${entityId}`,
        emailVerificationOtp
      );

      const { UMSDataSource } = DBConnection;

      const umsEntityProfileRepo =
        UMSDataSource.getRepository(UMSEntityProfile);
      const emailVerifiedData = await umsEntityProfileRepo.create({
        entityId,
        profileType: ValuerProfileType.IS_EMAIL_VERIFIED,
        profileValue: "1",
      });

      await umsEntityProfileRepo.save(emailVerifiedData);
      return res.json({
        responseCode: "",
        responseMessage: "OTP verified successfully",
        status: "Success",
      });
    } catch (error: any) {
      logger.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        responseCode: "000005",
        responseMessage: error.message,
        status: "Fail",
      });
    }
  }

  /**
   * method for sending the otp either by email or phone
   */
  public static async send(req: Request, res: Response) {
    try {
      const { type, purpose } = req.query;

      if (type === EAuthMode.EMAIL) {
        let email;
        let entityId;

        if (req.body.email) {
          email = req.body.email;
        } else {
          entityId = req[reqUserDataKey].entityId;
          email = await fetchContactFieldValue(entityId, EAuthMode.EMAIL);
        }

        const emailOtpKey = `${redisPrefix[`${purpose}`]}${entityId || email}`;
        const emailTemplateInfo = EMAIL_TEMPLATE_FILE_NAME_MAPPER[`${purpose}`];

        if (!emailOtpKey || !emailTemplateInfo) {
          throw new Error(`${purpose} not found!`);
        }

        const { UMSDataSource } = DBConnection;

        const umsEntityProfileRepo =
          UMSDataSource.getRepository(UMSEntityIdContact);
        const emailVerifiedData = await umsEntityProfileRepo.findOne({
          contactType: EAuthMode.EMAIL,
          contactValue: email,
        });

        if (!emailVerifiedData) {
          throw new Error(`You are not registered with us!`);
        }

        const { fileName, subject } = emailTemplateInfo;
        await EmailOtp.send(emailOtpKey, email, fileName, subject);
      }

      if (type === EAuthMode.PHONE) {
        let phone;
        let entityId;

        if (req.body.phone) {
          phone = req.body.phone;
        } else {
          entityId = req[reqUserDataKey].entityId;
          phone = await fetchContactFieldValue(entityId, EAuthMode.PHONE);
        }

        const phoneOtpKey = `${redisPrefix[`${purpose}`]}${entityId || phone}`;

        if (!phoneOtpKey) {
          throw new Error(`${purpose} not found`);
        }
        const { UMSDataSource } = DBConnection;
        const umsEntityProfileRepo =
          UMSDataSource.getRepository(UMSEntityIdContact);
        const phoneVerifiedData = await umsEntityProfileRepo.findOneBy({
          contactType: EAuthMode.PHONE,
          contactValue: phone,
        });

        if (!phoneVerifiedData) {
          throw new Error(`You are not registered with us!`);
        }

        // await OtpMobile.send(phoneOtpKey, phone);
      }
      return res.json({
        responseCode: "",
        responseMessage: "OTP sent successfully.",
        status: "Success",
      });
    } catch (error: any) {
      logger.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        responseCode: "000005",
        responseMessage: error.message,
        status: "Fail",
      });
    }
  }

  /**
   * method for verification of phone otp
   */
  public static async verifyMobile(req: Request, res: Response) {
    try {
      // const { entityId }: IDecodedDataType = req[reqUserDataKey];
      // const { phoneVerificationOtp } = req.body;

      // await Otp.verify(`${redisPrefix.signupPhoneOtp}${entityId}`, [phoneVerificationOtp]);

      // const umsEntityProfileRepo = getRepository(UMSEntityProfile);
      // const phoneVerifiedData = await umsEntityProfileRepo.create({
      //     entityId,
      //     profileType: ValuerProfileType.ACCOUNT_VERIFIED,
      //     profileValue: '1'
      // });

      // await umsEntityProfileRepo.save(phoneVerifiedData);
      return res.json({
        responseCode: "",
        responseMessage: "OTP verified successfully",
        status: "Success",
      });
    } catch (error: any) {
      logger.error(error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        responseCode: "000005",
        responseMessage: error.message,
        status: "Fail",
      });
    }
  }
}
