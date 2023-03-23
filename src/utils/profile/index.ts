import { Request } from "express";
import { getRepository } from "typeorm";
import { UMSEntityIdContact, UMSEntityProfile } from "../../typeorm/entities";
import { AppType } from "../constants";
import { IContactType, IProfileType } from "../interfaces";

export interface IActionObject {
  updateObjectArray: UMSEntityProfile[];
  deleteObjectArray: UMSEntityProfile[];
}

export interface IActionPrefernceObject {
  updateObjectArray: UMSEntityProfile[];
}

const generateActionObject = async (
  entityId: string,
  fields: string[],
  userData: UMSEntityProfile[],
  req: Request | { body: {} }
): Promise<IActionObject> => {
  try {
    const updateObjectArray: UMSEntityProfile[] = [];
    const deleteObjectArray: UMSEntityProfile[] = [];
    for (const fieldValue of fields) {
      const userObj: UMSEntityProfile | undefined = userData.find(
        (userObject) => userObject.profileType === fieldValue
      );

      if (userObj && req.body[fieldValue]) {
        userObj.profileValue = req.body[fieldValue] ? req.body[fieldValue] : "";
        updateObjectArray.push(userObj);
      } else if (!userObj && req.body[fieldValue]) {
        const userProfileRepo = getRepository(UMSEntityProfile);
        const userProfileData = userProfileRepo.create({
          entityId,
          profileType: fieldValue,
          profileValue: req.body[fieldValue],
        });
        updateObjectArray.push(userProfileData);
      } else if (userObj && !req.body[fieldValue]) {
        deleteObjectArray.push(userObj);
      }
    }

    return { updateObjectArray, deleteObjectArray };
  } catch (Error: any) {
    return Error;
  }
};

const generateContactActionObject = (
  entityId: string,
  fields: string[],
  userData: UMSEntityIdContact[],
  req: Request
): {
  updateContactObjectArray: UMSEntityIdContact[];
  deleteContactObjectArray: UMSEntityIdContact[];
} => {
  try {
    const updateContactObjectArray: UMSEntityIdContact[] = [];
    const deleteContactObjectArray: UMSEntityIdContact[] = [];

    for (const fieldValue of fields) {
      const userObj: UMSEntityIdContact | undefined = userData.find(
        (userObject) => userObject.contactType === fieldValue
      );

      if (userObj && req.body[fieldValue]) {
        userObj.contactValue = req.body[fieldValue] || "";
        updateContactObjectArray.push(userObj);
      } else if (!userObj && req.body[fieldValue]) {
        const userProfileContactRepo = getRepository(UMSEntityIdContact);
        const userProfileData = userProfileContactRepo.create({
          entityId,
          contactType: fieldValue,
          contactValue: req.body[fieldValue],
        });
        updateContactObjectArray.push(userProfileData);
      } else if (userObj && !req.body[fieldValue]) {
        deleteContactObjectArray.push(userObj);
      }
    }

    return { updateContactObjectArray, deleteContactObjectArray };
  } catch (Error: any) {
    return Error;
  }
};

const generateUserProfileFromData = async (
  fields: string[],
  userData: UMSEntityProfile[]
): Promise<IProfileType> => {
  try {
    const profileObject: IProfileType = {};
    fields.forEach((field) => {
      const userObj: UMSEntityProfile | undefined = userData.find(
        (userObject) => userObject.profileType === field
      );
      if (!userObj) {
        profileObject[field] = null;
        return profileObject;
      }

      profileObject[field] = userObj?.profileValue;
    });
    return profileObject;
  } catch (Error: any) {
    return Error;
  }
};

const generateUserContactFromData = async (
  fields: string[],
  userContactData: UMSEntityIdContact[]
): Promise<IContactType> => {
  try {
    const contactObject: IContactType = {};
    fields.forEach((field) => {
      const userObj: UMSEntityIdContact | undefined = userContactData.find(
        (userObject) => userObject.contactType === field
      );
      if (userObj) {
        contactObject[field] = userObj?.contactValue;
      }
    });
    return contactObject;
  } catch (Error: any) {
    return Error;
  }
};

/**
 * function to find contact value from contact type e.g. email
 * @param entityId string
 * @param contactType string
 * @returns contact value depending upon the entitiy id and contact type provide e.g. email
 */
const fetchContactFieldValue = async (
  entityId: string,
  contactType: string
): Promise<string> => {
  try {
    const userProfileContactRepo = getRepository(UMSEntityIdContact);
    const userContactData = await userProfileContactRepo.findOne({
      where: { entityId, contactType },
    });

    if (!userContactData) {
      throw new Error(`field ${contactType} not found!`);
    }

    return userContactData.contactValue;
  } catch (error: any) {
    return error;
  }
};

export {
  generateUserContactFromData,
  generateUserProfileFromData,
  generateActionObject,
  generateContactActionObject,
  fetchContactFieldValue,
};
