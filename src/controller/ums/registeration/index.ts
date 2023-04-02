import { Request, Response } from "express";
import { uuid } from "uuidv4";
import { RedisConnection } from "../../../libs/redisConnection";
import { generateProfileDataFromFields } from "../../../utils/register";
import { ICreateProfileType } from "../../../utils/interfaces";
import {
  createLenderAccountFields,
  createValuerAccountFields,
  redisPrefix,
  UserType,
  sessionCookies,
} from "../../../utils/constants";

import {
  UMSClientInfo,
  UMSCookieInfo,
  UMSEntityIdContact,
  UMSEntityProfile,
  UMSOauthCode,
} from "../../../typeorm/entities";

import { logger } from "../../../utils/logger";
import { DBConnection } from "../../../typeorm/dbCreateConnection";
import { LenderProfileType, ValuerProfileType } from "../../../types/profile";

interface ICreateContactType {
  entityId: string;
  contactType: string;
  contactValue: string;
}

interface IAddressType {
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const registerLender = async (req: Request, res: Response) => {
  try {
    const { UMSDataSource } = DBConnection;
    logger.info("!!!!!!!!Lender Signup!!!!!!!!");
    const { email, password, phone, xsrfToken } = req.body;

    req.body.user_type = UserType.LENDER;

    if (!email || !password || !xsrfToken) {
      return res.status(400).json({
        responseCode: "000001",
        responseMessage: "Missing Fields in Params",
        status: "Fail",
      });
    }

    logger.info("!!!!!!!!Getting xsrf token!!!!!!!!");
    const { client } = RedisConnection;
    const savedTransitionObj = await client.get(
      `${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`
    );

    const parsedSavedTransitionObj = JSON.parse(savedTransitionObj);
    if (!parsedSavedTransitionObj || !parsedSavedTransitionObj.stateId) {
      return res.status(401).json({
        responseCode: "000008",
        responseMessage: "xsrf Token expired or Invalid",
        status: "Fail",
      });
    }
    const { clientId } = parsedSavedTransitionObj;

    const contactRepo = UMSDataSource.getRepository(UMSEntityIdContact);
    const userPhoneData = await contactRepo.findOne({
      where: { contactType: "phone", contactValue: phone },
    });
    if (userPhoneData) {
      return res.status(400).json({
        responseCode: "000027",
        responseMessage: "User phone is already registered.",
        status: "Fail",
      });
    }
    const userContactData = await contactRepo.findOne({
      where: { contactType: "email", contactValue: email },
    });
    if (userContactData) {
      return res.status(400).json({
        responseCode: "000027",
        responseMessage: "User email is already registered.",
        status: "Fail",
      });
    }

    const entityId = uuid();

    const contactDataArray: ICreateContactType[] = [
      {
        entityId,
        contactType: "email",
        contactValue: email,
      },
      {
        entityId,
        contactType: "phone",
        contactValue: phone,
      },
    ];

    logger.info("!!!!!!!!generating Profile Data From Fields!!!!!!!!");

    const profileDataArray: ICreateProfileType[] =
      await generateProfileDataFromFields(
        entityId,
        createLenderAccountFields,
        req
      );

    const addressObject: IAddressType = req.body.address;
    const clientInfoRepo = UMSDataSource.getRepository(UMSClientInfo);

    const clientInfo = await clientInfoRepo.findOne({
      where: { clientId },
    });

    // if (!clientInfo) {
    //   return res.status(401).json({
    //     responseCode: "000016",
    //     responseMessage: "Client Info Invalid",
    //     status: "Fail",
    //   });
    // }

    logger.info("!!!!!!!!generating cookie!!!!!!!!");
    const cookieRepo = UMSDataSource.getRepository(UMSCookieInfo);
    const authCodeRepo = UMSDataSource.getRepository(UMSOauthCode);
    const authCode = authCodeRepo.create({
      clientId,
      entityId,
      code: uuid(),
      expiry: Date.now() + 900000,
      stale: false,
    });
    const cookie = cookieRepo.create({
      clientId,
      entityId,
      value: uuid(),
      name: sessionCookies.SESSION_COOKIE_LMS,
      expiry: Date.now() + 604800000,
    });

    let savedCookie;
    let savedAuthCode;
    const queryRunner = UMSDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const address = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_address")
        .values(addressObject)
        .execute();

      profileDataArray.push({
        entityId,
        profileType: LenderProfileType.ADDRESS,
        profileValue: address.identifiers[0].id,
      });
      logger.info("!!!!!!!!Inserting data into DB!!!!!!!!");
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_entity_profile")
        .values(profileDataArray)
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_entity_id_contact")
        .values(contactDataArray)
        .execute();

      await client.del(`${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`);

      savedCookie = await queryRunner.manager.save(cookie);
      savedAuthCode = await queryRunner.manager.save(authCode);

      client.hmset(`${redisPrefix.cookiePrefix}${savedCookie.value}`, {
        clientId: savedCookie.clientId,
        entityId: savedCookie.entityId,
      });
      client.expire(
        `${redisPrefix.cookiePrefix}${savedCookie.value}`,
        savedCookie.expiry
      );

      await queryRunner.commitTransaction();
      await queryRunner.release();

      res.cookie(sessionCookies.SESSION_COOKIE_LMS, savedCookie.value, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: "none",
      });

      return res.json({
        responseCode: "000027",
        responseMessage: "Account Created",
        status: "Success",
        responseBody: { oauthCode: savedAuthCode.code },
      });
    } catch (error: any) {
      logger.error(error.message);
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      return res.status(400).json({
        responseCode: "000005",
        responseMessage: "Internal Server Error",
        status: "Fail",
      });
    }
  } catch (err) {
    return res.status(500).json({
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  }
};

const registerValuer = async (req: Request, res: Response) => {
  try {
    const { UMSDataSource } = DBConnection;
    const { email, password, phone, xsrfToken } = req.body;

    req.body.user_type = UserType.VALUER;

    if (!email || !password || !xsrfToken) {
      return res.status(400).json({
        responseCode: "000001",
        responseMessage: "Missing Fields in Params",
        status: "Fail",
      });
    }

    const { client } = RedisConnection;
    const savedTransitionObj = await client.get(
      `${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`
    );
    const parsedSavedTransitionObj = JSON.parse(savedTransitionObj);

    if (!parsedSavedTransitionObj || !parsedSavedTransitionObj.stateId) {
      return res.status(401).json({
        responseCode: "000008",
        responseMessage: "xsrf Token expired or Invalid",
        status: "Fail",
      });
    }
    const { clientId } = parsedSavedTransitionObj;

    const contactRepo = UMSDataSource.getRepository(UMSEntityIdContact);
    const userContactData = await contactRepo.findOne({
      where: { contactType: "email", contactValue: email },
    });
    if (userContactData) {
      return res.status(400).json({
        responseCode: "000027",
        responseMessage: "User email is already registered.",
        status: "Fail",
      });
    }

    const userProfileRepo = UMSDataSource.getRepository(UMSEntityProfile);
    const panData = await userProfileRepo.findOne({
      where: { profileType: ValuerProfileType.PAN, profileValue: req.body.pan },
    });
    if (panData) {
      return res.status(400).json({
        responseCode: "000028",
        responseMessage: "Pan is already used",
        status: "Fail",
      });
    }

    const entityId = uuid();

    const contactDataArray: ICreateContactType[] = [
      {
        entityId,
        contactType: "email",
        contactValue: email,
      },
      {
        entityId,
        contactType: "phone",
        contactValue: phone,
      },
    ];

    const profileDataArray: ICreateProfileType[] =
      await generateProfileDataFromFields(
        entityId,
        createValuerAccountFields,
        req
      );

    const addressObject: IAddressType = req.body.address;
    const clientInfoRepo = UMSDataSource.getRepository(UMSClientInfo);
    const clientInfo = await clientInfoRepo.findOne({
      where: { clientId },
    });

    // if (!clientInfo) {
    //   return res.status(401).json({
    //     responseCode: "000016",
    //     responseMessage: "Client Info Invalid",
    //     status: "Fail",
    //   });
    // }

    const cookieRepo = UMSDataSource.getRepository(UMSCookieInfo);
    const authCodeRepo = UMSDataSource.getRepository(UMSOauthCode);
    const authCode = authCodeRepo.create({
      clientId,
      entityId,
      code: uuid(),
      expiry: Date.now() + 900000,
      stale: false,
    });

    // Making wherehouse cookie name for VMS login
    const cookie = cookieRepo.create({
      clientId,
      entityId,
      value: uuid(),
      name: sessionCookies.SESSION_COOKIE_VMS,
      expiry: Date.now() + 604800000,
    });

    let savedCookie;
    let savedAuthCode;
    const queryRunner = UMSDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const address = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_address")
        .values(addressObject)
        .execute();

      profileDataArray.push({
        entityId,
        profileType: ValuerProfileType.ADDRESS,
        profileValue: address.identifiers[0].id,
      });
      logger.info("!!!!!!!!Inserting data into DB!!!!!!!!");

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_entity_profile")
        .values(profileDataArray)
        .execute();

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into("ums_entity_id_contact")
        .values(contactDataArray)
        .execute();

      await client.del(`${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`);

      savedCookie = await queryRunner.manager.save(cookie);
      savedAuthCode = await queryRunner.manager.save(authCode);
      client.hmset(`${redisPrefix.cookiePrefix}${savedCookie?.value}`, {
        clientId: savedCookie.clientId,
        entityId: savedCookie.entityId,
      });
      client.expire(
        `${redisPrefix.cookiePrefix}${savedCookie?.value}`,
        savedCookie.expiry
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Error while performing transaction ${error}`);
    } finally {
      await queryRunner.release();

      // Making cookie name for VMS login
      res.cookie(sessionCookies.SESSION_COOKIE_VMS, savedCookie?.value, {
        httpOnly: true,
        signed: true,
        secure: true,
        sameSite: "none",
      });
    }

    return res.json({
      responseCode: "000027",
      responseMessage: "Account Created",
      status: "Success",
      responseBody: { oauthCode: savedAuthCode.code },
    });
  } catch (err) {
    logger.error(err);
    return res.status(500).json({
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  }
};

export { registerLender, registerValuer };
