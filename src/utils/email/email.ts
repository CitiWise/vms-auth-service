import fs from 'fs';
import path from 'path';

const getEmailTemplate = (templateFileName) => {
    const topLevelDir = path.resolve(__dirname, '../..');
    const emailTemplate = String(
        fs.readFileSync(path.resolve(topLevelDir + `/templates/email/${templateFileName}.html`))
    );

    return emailTemplate;
};

export const populateTemplateWithValues = (templateFileName, htmlTemplateFieldsNameMap) => {
    let htmlTemplate = getEmailTemplate(templateFileName);

    Object.entries(htmlTemplateFieldsNameMap).forEach(([htmlFieldName, fieldValue]) => {
        const regex = new RegExp(`{{${htmlFieldName}}}`);
        htmlTemplate = htmlTemplate.replace(regex, String(fieldValue));
    });

    return htmlTemplate;
};
