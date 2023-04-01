import { Request, Response, NextFunction } from "express";
import { RedisConnection } from "../../libs/redisConnection";
import { logger } from "../../utils/logger";
import { AppType, redisPrefix, reqUserDataKey, sessionCookies } from "../../utils/constants";
import {
  UMSAccessToken,
  UMSClientInfo,
  UMSCookieInfo,
} from "../../typeorm/entities";
import { DBConnection } from "../../typeorm/dbCreateConnection";

const validateAppCookies = async (
  req: Request,
  res: Response,
  next: NextFunction,
  cookieName: string
) => {
  // making cookieName for different panel and getting cookie from different panel so cookie name will be different
  // So no cookie will be re initialized or re assigned
  const cookie = req.signedCookies[cookieName];

  if (!cookie) {
    return res.status(401).json({
      responseCode: "000028",
      responseMessage: "No Cookie Present",
      status: "Fail",
    });
  }

  const { client } = RedisConnection;
  const cachedCookie: any = await client.hgetall(
    `${redisPrefix.cookiePrefix}${cookie}`
  );
  if (cachedCookie) {
    req[reqUserDataKey] = { ...cachedCookie };
    logger.info("Using Cached cookie");
  } else {
    const { UMSDataSource } = DBConnection;
    const cookieRepo = UMSDataSource.getRepository(UMSCookieInfo);
    const cookieData = await cookieRepo.findOne({ where: { value: cookie } });
    if (!cookieData || cookieData.expiry < Date.now()) {
      res.clearCookie(cookieName);
      return res.status(401).json({
        responseCode: "000029",
        responseMessage: " Cookie Present is Invalid",
        status: "Fail",
      });
    }
    req[reqUserDataKey] = { ...cookieData };
  }
  next();
};

const validateCookie = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If appType is ingress-source than it should be a s2s call else validate cookies
  const appType = String(req.headers.apptype);
  const panelCookieName =
    {
      [AppType.APP_VALUER]: sessionCookies.SESSION_COOKIE_VMS,
      [AppType.APP_LENDER]: sessionCookies.SESSION_COOKIE_LMS,
    }[appType] || "";
  return validateAppCookies(req, res, next, panelCookieName);
};

const validateAuthorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { UMSDataSource } = DBConnection;
  const authorization = req.get("Authorization");
  if (
    !authorization ||
    !authorization?.split(" ")[1] ||
    authorization?.split(" ")[0] !== "Basic"
  ) {
    return res.status(401).json({
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
    return res.status(401).json({
      responseCode: "000014",
      responseMessage: "Invalid Authorization Code",
      status: "Fail",
    });
  }

  const clientInfoRepo = UMSDataSource.getRepository(UMSClientInfo);
  const clientInfo = await clientInfoRepo.findOne({
    where: { clientId: clientData[0], clientSecret: clientData[1] },
  });
  if (!clientInfo) {
    res.status(401).json({
      responseCode: "000016",
      responseMessage: "Client Info Invalid",
      status: "Fail",
    });
  }

  const accessTokenRepo = UMSDataSource.getRepository(UMSAccessToken);
  if (!req.get("x-session-token")) {
    return res.status(401).json({
      responseCode: "000023",
      responseMessage: "Token not found",
      status: "Fail",
    });
  }

  const { client } = RedisConnection;
  const cachedToken: any = await client.hgetall(
    `${redisPrefix.accessTokenPrefix}${req.get("x-session-token")}`
  );
  if (cachedToken) {
    req[reqUserDataKey] = { ...cachedToken };
    logger.info("Using Cached token");
  } else {
    const accessToken = await accessTokenRepo.findOne({
      where: { token: req.get("x-session-token") },
    });
    if (!accessToken || accessToken.expiry < Date.now()) {
      return res.status(401).json({
        responseCode: "000024",
        responseMessage: " Access Token expired",
        status: "Fail",
      });
    }
    req[reqUserDataKey] = { ...accessToken };
  }
  next();
};

export { validateCookie, validateAuthorization };
