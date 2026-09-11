//custom err class
class ExpressError extends Error {//extends the err class of express >>inherit
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }
}

module.exports = ExpressError;