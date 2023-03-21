import { Request, Response, NextFunction } from 'express';

const validate = (schema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const submitData = { ...req.body };
            await schema.validateAsync(submitData);
            next();
        } catch (err: any) {
            if (err && err.details && err.details[0] && err.details[0].message) {
                return res.status(400).json({
                    responseCode: '000099',
                    responseMessage: err.message,
                    status: 'Fail'
                });
            }
            return err;
        }
    };
};

export { validate };
