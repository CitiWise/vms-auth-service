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
