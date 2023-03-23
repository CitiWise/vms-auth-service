export class CustomError extends Error {
    private responseCode;

    constructor(msg: string, responseCode?: string) {
        super(msg);
        if (responseCode) {
            this.responseCode = responseCode;
        }
    }
}
