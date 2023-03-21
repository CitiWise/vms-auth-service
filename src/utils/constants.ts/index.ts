import { LenderProfileType, ValuerProfileType } from "../../types/profile";

export enum EClientId {
  vms = "vms",
  lms = "lms",
}
export enum UserType {
  VALUER = "valuer",
  LENDER = "lender",
}
export enum AppType {
  APP_VALUER = "appValuer",
  APP_LENDER = "appLender",
}

export const reqUserDataKey = "userData";

export const redisPrefix = {
  cookiePrefix: "UMS_COOKIE_",
  accessTokenPrefix: "UMS_ACCESS_TOKEN_",
  integrationTokenPrefix: "UMS_INTEGRATION_ACCESS_TOKEN",
  signupEmailOtp: "UMS_SIGNUP_EMAIL_OTP_",
  signupPhoneOtp: "UMS_SIGNUP_PHONE_OTP_",
  forgotPasswordOtp: "FORGOT_PASSWORD_OTP_",
  totalOtpSent: "TOTAL_OTP_SENT_",
  xsrfTokenObjPrefix: "XSRF_TOKEN_",
  trackingLayout: "TRACKING_LAYOUT_",
};

export const createLenderAccountFields = [
    LenderProfileType.IS_BANK,
    LenderProfileType.BANK_NAME,
    LenderProfileType.BRANCH_NAME,
    LenderProfileType.PASSWORD,
    LenderProfileType.POC_NAME,
    LenderProfileType.USER_TYPE
];

export const createValuerAccountFields = [
    ValuerProfileType.NAME,
    ValuerProfileType.PAN,
    ValuerProfileType.PASSWORD,
    ValuerProfileType.USER_TYPE
];

export const constants = {
  SESSION_COOKIE_LMS: 'SESSION_COOKIE_LMS',
  SESSION_COOKIE_VMS: 'SESSION_COOKIE_VMS'
};
