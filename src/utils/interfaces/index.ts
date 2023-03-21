interface IProfileType {
  name?: string;
  website?: string;
  poc?: string;
  pocPhone?: string;
  orderRate?: {
    price: string;
    currency: string;
  };
  logoUrl?: string;
  signUrl?: string;
  plan?: string;
  pan?: string;
  gst?: string;
  hsn?: boolean;
  address?: string;
  type?: string;
  cgstPercentage?: string;
  sgstPercentage?: string;
  igstPercentage?: string;
  UserType?: string;
  lightningAccess?: string;
  accessToken?: string;
}

interface IContactType {
  phone?: string;
  email?: string;
}

interface IDecodedDataType {
  entityId: string;
  clientId: string;
}

interface ICreateProfileType {
  entityId: string;
  profileType: string;
  profileValue: string;
}

interface IOmsAddress {
  pincode: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
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

export {
  IProfileType,
  IContactType,
  IDecodedDataType,
  ICreateProfileType,
  IAddressType,
  IOmsAddress,
};
