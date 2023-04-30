import { Request, Response } from "express";
import { QueryRunner } from "typeorm";
import { StatusCodes } from "http-status-codes";
import {
  UMSAccessToken,
  UMSClientInfo,
  UMSCookieInfo,
  UMSEntityIdContact,
  UMSEntityProfile,
  UMSOauthCode,
} from "../../typeorm/entities";

import bcrypt from "bcrypt";
import { uuid } from "uuidv4";
import { RedisConnection } from "../../libs/redisConnection";
import { IDecodedDataType } from "../../utils/interfaces";
import { EClientId, redisPrefix, sessionCookies } from "../../utils/constants";
import { ValuerProfileType } from "../../types/profile";
import { DBConnection } from "../../typeorm/dbCreateConnection";
import { logger } from "../../utils/logger";

const DEFAULT_TOKEN_EXPIRY_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCookieName = (clientId: string) =>
  ({
    [EClientId.vms]: sessionCookies.SESSION_COOKIE_VMS,
    [EClientId.lms]: sessionCookies.SESSION_COOKIE_LMS,
  }[clientId]);
interface IClientQuery {
  response_type: string;
  state: string;
  client_id: string;
  redirect_url: string;
}

const authenticateClient = async (req: Request, res: Response) => {
  try {
    const { UMSDataSource } = DBConnection;
    const { response_type, state, client_id, redirect_url }: IClientQuery =
      req.query as {
        response_type: string;
        state: string;
        client_id: string;
        redirect_url: string;
      };

    if (!response_type || !state || !client_id || !redirect_url) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        responseCode: "000001",
        responseMessage: "Missing Fields in Params",
        status: "Fail",
      });
    }

    if (response_type !== "code") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        responseCode: "000002",
        responseMessage: "Response Type Invalid",
        status: "Fail",
      });
    }

    // fetching seller, admin or wms cookie on the bases of client Id we are receiving
    const cookie = req.signedCookies[getCookieName(client_id)];

    // const redirectUrlRepo = UMSDataSource.getRepository(
    //   UMSClientInfoRedirectUrls
    // );
    const cookieRepo = UMSDataSource.getRepository(UMSCookieInfo);

    // const redirectUrlEntry = await redirectUrlRepo.findOne({
    //   where: { clientId: client_id, redirectUrl: redirect_url },
    // });

    // if (!redirectUrlEntry) {
    //   return res.status(StatusCodes.BAD_REQUEST).json({
    //     responseCode: "000003",
    //     responseMessage: "Invalid Client_Id & Redirect URL",
    //     status: "Fail",
    //   });
    // }
    const cookieInfo = await cookieRepo.findOne({
      where: { clientId: client_id, value: cookie },
    });
    const profileRepo = UMSDataSource.getRepository(UMSEntityProfile);

    const userData = await profileRepo.findOne({
      where: { entityId: client_id, profileType: "user_type" },
    });

    if (!cookie || !cookieInfo || cookieInfo.expiry < Date.now()) {
      const transitionState = {
        stateId: uuid(),
        clientId: client_id,
        redirectUrl: redirect_url,
        state,
      };

      try {
        const { client } = RedisConnection;
        client.set(
          `${redisPrefix.xsrfTokenObjPrefix}${transitionState.stateId}`,
          JSON.stringify(transitionState),
          "EX",
          900000
        );

        res.json({
          responseCode: "000007",
          responseMessage: "Relogin User",
          status: "Success",
          responseBody: { xsrfToken: transitionState.stateId },
        });
      } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          responseCode: "000004",
          responseMessage: "Error while saving transition state",
          status: "Fail",
        });
      }
    } else {
      const authCodeRepo = UMSDataSource.getRepository(UMSOauthCode);
      const authCode = authCodeRepo.create({
        clientId: client_id,
        entityId: cookieInfo.entityId,
        expiry: Date.now() + 900000,
        stale: false,
        code: uuid(),
        metadata: JSON.stringify({}),
      });

      const savedAuthCode = await authCodeRepo.save(authCode);
      res.json({
        responseCode: "000006",
        responseMessage: "Generated Auth Code",
        status: "Success",
        responseBody: {
          redirectUrl: redirect_url,
          state,
          oauthCode: savedAuthCode.code,
        },
      });
    }
  } catch (err: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: err.message,
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  }
};

const authenticateUser = async (req: Request, res: Response) => {
  const { UMSDataSource } = DBConnection;
  const { email, phone, password, xsrfToken, userLoginType, username } =
    req.body;
  const client = RedisConnection.client;

  const regexMail = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  const regexPhone = /^[6-9][0-9]{9}$/;

  // validating email and password as we will get either  of these from FE
  if (email) {
    if (!email.match(regexMail)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        responseCode: "000001",
        responseMessage: "Email not valid",
        status: "Fail",
      });
    }
  }
  if (phone) {
    if (!phone.match(regexPhone)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        responseCode: "000001",
        responseMessage: "Phone not valid",
        status: "Fail",
      });
    }
  }

  if (!password || !xsrfToken) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000001",
      responseMessage: "Missing Fields in Params",
      status: "Fail",
    });
  }

  const savedTransitionObj = await client.get(
    `${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`
  );
  const parsedSavedTransitionObj = JSON.parse(savedTransitionObj);

  if (!parsedSavedTransitionObj || !parsedSavedTransitionObj.stateId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000008",
      responseMessage: "xsrf Token expired or Invalid",
      status: "Fail",
    });
  }

  const { clientId, redirectUrl, state } = parsedSavedTransitionObj;
  let userContactData;

  if (username) {
    userContactData = await UMSDataSource.getRepository(
      UMSEntityIdContact
    ).findOne({
      where: { contactType: "username", contactValue: username },
    });
  } else if (email) {
    userContactData = await UMSDataSource.getRepository(
      UMSEntityIdContact
    ).findOne({
      where: { contactType: "email", contactValue: email },
    });
  } else if (phone) {
    userContactData = await UMSDataSource.getRepository(
      UMSEntityIdContact
    ).findOne({
      where: { contactType: "phone", contactValue: phone },
    });
  }

  // change to const
  if (!userContactData) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000009",
      responseMessage: "User is not registered.",
      status: "Fail",
    });
  }

  const entityId = userContactData.entityId;
  const profileRepo = UMSDataSource.getRepository(UMSEntityProfile);

  const userData = await profileRepo.findOne({
    where: {
      entityId: userContactData.entityId,
      profileType: ValuerProfileType.USER_TYPE,
    },
  });

  const isAppTypeSameAsUserType = Boolean(
    userData?.profileValue === userLoginType
  );

  if (!userData || !isAppTypeSameAsUserType) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      responseMessage: `Unauthorized Request`,
      status: "Fail",
    });
  }

  if (req.body.password !== process.env.MASTER_PASSWORD) {
    const passwordData = await profileRepo.findOne({
      where: {
        entityId: userContactData.entityId,
        profileType: ValuerProfileType.PASSWORD,
      },
    });
    if (!passwordData) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        responseCode: "000010",
        responseMessage: "User has no password set.",
        status: "Fail",
      });
    }
    const comparedPassword = await bcrypt.compare(
      password,
      passwordData.profileValue
    );
    if (!comparedPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        responseCode: "000011",
        responseMessage: "Password is incorrect",
        status: "Fail",
      });
    }
  }

  const clientInfo = await UMSDataSource.getRepository(UMSClientInfo).findOne({
    where: { clientId },
  });

  // if (!clientInfo) {
  //   return res.status(StatusCodes.BAD_REQUEST).json({
  //     responseCode: "000016",
  //     responseMessage: "Client Info Invalid",
  //     status: "Fail",
  //   });
  // }

  const authCode = UMSDataSource.getRepository(UMSOauthCode).create({
    clientId,
    entityId,
    code: uuid(),
    expiry: Date.now() + 900000,
    stale: false,
  });
  // fetching seller, admin or wms cookie on the bases of client Id we are receiving
  const cookieName = getCookieName(clientId);

  const cookie = UMSDataSource.getRepository(UMSCookieInfo).create({
    clientId,
    entityId,
    value: uuid(),
    name: cookieName,
    expiry: Date.now() + 604800000,
  });
  let savedCookie;
  let savedAuthCode;
  UMSDataSource;
  const queryRunner: QueryRunner = await UMSDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await client.del(`${redisPrefix.xsrfTokenObjPrefix}${xsrfToken}`);
    savedCookie = await queryRunner.manager.save(cookie);
    savedAuthCode = await queryRunner.manager.save(authCode);

    client.hset(
      `${redisPrefix.cookiePrefix}${savedCookie.value}`,
      "clientId",
      savedCookie.clientId
    );
    client.hset(
      `${redisPrefix.cookiePrefix}${savedCookie.value}`,
      "entityId",
      savedCookie.entityId
    );
    client.expire(
      `${redisPrefix.cookiePrefix}${savedCookie.value}`,
      savedCookie.expiry
    );

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  } finally {
    await queryRunner.release();
  }

  res.cookie(cookieName, savedCookie.value, {
    httpOnly: true,
    signed: true,
    secure: true,
    sameSite: "none",
  });

  return res.json({
    responseCode: "000012",
    responseMessage: "Generated oauth code & cookie",
    status: "Success",
    responseBody: {
      oauthCode: savedAuthCode.code,
      redirect_url: redirectUrl,
      state,
      userType: userData?.profileValue,
    },
  });
};

const generateToken = async (req: Request, res: Response) => {
  const { UMSDataSource } = DBConnection;
  const { grantType, code } = req.body;
  if (grantType !== "authorization_code") {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      responseCode: "000013",
      responseMessage: "Grant Type Invalid",
      status: "Fail",
    });
  }

  const authorization = req.get("Authorization");
  if (
    !authorization ||
    !authorization?.split(" ")[1] ||
    authorization?.split(" ")[0] !== "Basic"
  ) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000014",
      responseMessage: "Invalid Authorization Code",
      status: "Fail",
    });
  }
  const decodedData = Buffer.from(
    authorization?.split(" ")[1],
    "base64"
  ).toString();

  const clientData = decodedData.split(":");
  if (!clientData[0] && !clientData[1]) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000015",
      responseMessage: "Id & Secret of Client doesnt exist",
      status: "Fail",
    });
  }


  const clientInfoRepo = UMSDataSource.getRepository(UMSClientInfo);
  const clientInfo = await clientInfoRepo.findOne({
    where: { clientId: clientData[0], clientSecret: clientData[1] },
  });

  if (!clientInfo) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000016",
      responseMessage: "Client Info Invalid",
      status: "Fail",
    });
  }
  const authCodeRepo = UMSDataSource.getRepository(UMSOauthCode);
  const authCode = await authCodeRepo.findOne({
    where: { code, stale: false },
  });

  if (!authCode) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000017",
      responseMessage: "Invalid / Used oauth Code ",
      status: "Fail",
    });
  }

  if (authCode.expiry < Date.now()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      responseCode: "000018",
      responseMessage: " oAuthCode Expired ",
      status: "Fail",
    });
  }

  const accessTokenRepo = UMSDataSource.getRepository(UMSAccessToken);

  const accessToken: UMSAccessToken = accessTokenRepo.create();

  accessToken.clientId = clientData[0];
  accessToken.entityId = authCode.entityId;
  accessToken.token = uuid();
  accessToken.expiry = Date.now() + DEFAULT_TOKEN_EXPIRY_INTERVAL;

  let savedAccessToken;

  const profileRepo = UMSDataSource.getRepository(UMSEntityProfile);
  const userTypeData = await profileRepo.findOne({
    where: {
      profileType: ValuerProfileType.USER_TYPE,
      entityId: authCode.entityId,
    },
  });

  const queryRunner: QueryRunner = await UMSDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    authCode.stale = true;
    savedAccessToken = await queryRunner.manager.save(accessToken);
    const { client } = RedisConnection;

    client.hset(
      `${redisPrefix.accessTokenPrefix}${savedAccessToken.token}`,
      "clientId",
      savedAccessToken.clientId
    );
    client.hset(
      `${redisPrefix.accessTokenPrefix}${savedAccessToken.token}`,
      "entityId",
      savedAccessToken.entityId
    );
    client.expire(
      `${redisPrefix.accessTokenPrefix}${savedAccessToken.token}`,
      604800000
    );

    await queryRunner.manager.save(authCode);
    await queryRunner.commitTransaction();
  } catch (error: any) {
    logger.error(error.message);
    await queryRunner.rollbackTransaction();
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  } finally {
    await queryRunner.release();
  }
  return res.json({
    responseCode: "000019",
    responseMessage: "Generated Access Token",
    status: "Success",
    responseBody: {
      accessToken: savedAccessToken.token,
      entityId: authCode.entityId,
      userType: userTypeData?.profileValue,
      token_expiry_millis: savedAccessToken.expiry,
    },
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const { UMSDataSource } = DBConnection;
  const cookieData: IDecodedDataType = req["userData"];
  const accessTokenRepo = UMSDataSource.getRepository(UMSAccessToken);
  const cookieRepo = UMSDataSource.getRepository(UMSCookieInfo);

  const cookies: UMSCookieInfo[] = await cookieRepo.find({
    where: { clientId: cookieData.clientId, entityId: cookieData.entityId },
  });
  const accessTokens: UMSAccessToken[] = await accessTokenRepo.find({
    where: { clientId: cookieData.clientId, entityId: cookieData.entityId },
  });

  const queryRunner: QueryRunner = await UMSDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    await queryRunner.manager.remove(accessTokens);
    await queryRunner.manager.remove(cookies);
    const { client } = RedisConnection;

    for (const cookieItem of cookies) {
      await client.hdel(
        `${redisPrefix.cookiePrefix}${cookieItem.value}`,
        "clientId"
      );
      await client.hdel(
        `${redisPrefix.cookiePrefix}${cookieItem.value}`,
        "entityId"
      );
    }

    for (const accessTokenItem of accessTokens) {
      await client.hdel(
        `${redisPrefix.accessTokenPrefix}${accessTokenItem.token}`,
        "clientId"
      );
      await client.hdel(
        `${redisPrefix.accessTokenPrefix}${accessTokenItem.token}`,
        "entityId"
      );
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      responseCode: "000005",
      responseMessage: "Internal Server Error",
      status: "Fail",
    });
  } finally {
    await queryRunner.release();
  }
  return res.json({
    responseCode: "000022",
    responseMessage: "Logged out user",
    status: "Success",
  });
};

const userRoles = async (req: Request, res: Response) => {
  // get name from entity_id

  // TODO fix Raw query and create indexes

  const accessToken: IDecodedDataType = req["userData"];
  const { UMSDataSource } = DBConnection;
  const joinResult = await UMSDataSource.manager
    .query(`SELECT ums_acl_group.name as group_name, ums_acl_permissions.name FROM ums_acl_entity_group_mapping LEFT JOIN
 ums_acl_group ON ums_acl_entity_group_mapping.acl_group_id=ums_acl_group.id LEFT JOIN ums_acl_group_permission_mapping ON
 ums_acl_group.id = ums_acl_group_permission_mapping.acl_group_id LEFT JOIN ums_acl_permissions ON
 ums_acl_group_permission_mapping.acl_permission_id = ums_acl_permissions.id WHERE ums_acl_entity_group_mapping.entity_id = ${accessToken.entityId}`);

  if (!joinResult) {
    return {
      responseCode: "000025",
      responseMessage: "No roles Found",
      status: "Fail",
    };
  }
  const rolesArray: { name: string; permissions: [string] }[] = [];

  joinResult.forEach((col: { name: string; group_name: string }) => {
    if (!rolesArray.find((obj) => obj.name === col.group_name)) {
      const newObject: { name: string; permissions: [string] } = {
        name: col.group_name,
        permissions: [col.name],
      };
      rolesArray.push(newObject);
    } else {
      rolesArray[
        rolesArray.findIndex((obj) => obj.name === col.group_name)
      ].permissions.push(col.name);
    }
  });

  res.json({
    responseCode: "000026",
    responseMessage: "Auth Roles",
    status: "Success",
    responseBody: {
      entityId: accessToken.entityId,
      roles: { groups: rolesArray },
    },
  });
};

export {
  authenticateClient,
  authenticateUser,
  generateToken,
  logoutUser,
  userRoles,
};
