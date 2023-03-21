import bcrypt from 'bcrypt';
import { Request } from 'express';
import { ICreateProfileType } from '../interfaces';

const generateProfileDataFromFields = async (
    entityId: string,
    fields: string[],
    req: Request
): Promise<ICreateProfileType[]> => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const dataArray: ICreateProfileType[] = [];
        fields.forEach((field) => {
            if (req.body[field]) {
                dataArray.push({
                    profileType: field,
                    profileValue: req.body[field],
                    entityId
                });
            }
        });

        return dataArray;
    } catch (err) {
        throw err;
    }
};

export { generateProfileDataFromFields };
