import moment from 'moment';
import 'moment-timezone';

/**
 * @returns {number} - time left till midnight in secs
 */
export const getTimeLeftForTheDay = (): number | any => {
    try {
        let currentDate: any = new Date();
        currentDate = moment(currentDate).to('Asia/Kolkata');
        const endDate = moment.parseZone(currentDate).endOf('day');
        const timeLeft = endDate.diff(moment(currentDate)); // in ms

        return Math.round(timeLeft / 1000);
    } catch (err) {
        throw err;
    }
};
