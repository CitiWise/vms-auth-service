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
  APP_VALUER = "valuer",
  APP_LENDER = "lender",
}

export const contactFields = ['phone', 'email'];

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


export const getValuerProfileFields = [
  ValuerProfileType.NAME,
  ValuerProfileType.PAN,
  ValuerProfileType.SIGNATURE,
  ValuerProfileType.PHOTO,
  ValuerProfileType.IS_EMAIL_VERIFIED,
  ValuerProfileType.ACCOUNT_VERIFIED,
  ValuerProfileType.ADDRESS,
];

export const getLenderProfileFields = [
  LenderProfileType.IS_BANK,
  LenderProfileType.BANK_NAME,
  LenderProfileType.BRANCH_NAME,
  LenderProfileType.ADDRESS,
  LenderProfileType.POC_NAME,
  LenderProfileType.LOGO,
  LenderProfileType.SIGNATURE,
  LenderProfileType.IS_EMAIL_VERIFIED,
  LenderProfileType.ACCOUNT_VERIFIED,
];

export const updateValuerProfileFields = [
  ValuerProfileType.NAME,
  ValuerProfileType.PAN,
  ValuerProfileType.SIGNATURE,
  ValuerProfileType.PHOTO,
  ValuerProfileType.ADDRESS,
];

export const updateLenderProfileFields = [
  LenderProfileType.BANK_NAME,
  LenderProfileType.BRANCH_NAME,
  LenderProfileType.ADDRESS,
  LenderProfileType.POC_NAME,
  LenderProfileType.LOGO,
  LenderProfileType.SIGNATURE
];

export const updateContactProfileFields = ['email', 'phone'];

export const sessionCookies = {
  SESSION_COOKIE_LMS: 'SESSION_COOKIE_LENDER',
  SESSION_COOKIE_VMS: 'SESSION_COOKIE_VALUER'
};

export const OTP_VERIFICATION_EXPIRY_TIME = 300; // secs
export const MAX_RESEND_OTP_ATTEMPTS = 5;
export const MAX_INCORRECT_ATTEMPTS_ALLOWED = 10;
export enum EAuthMode {
    PHONE = 'phone',
    EMAIL = 'email'
}

export const EMAIL_TEMPLATE_FILE_NAME_MAPPER = {
  signupEmailOtp: { fileName: 'signup-otp', subject: 'Email Verification OTP' },
  forgotPasswordOtp: { fileName: 'forgot-password-otp', subject: 'Email Verification OTP' }
};


