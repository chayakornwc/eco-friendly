"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = require("body-parser");
const exceptions_1 = require("./exceptions");
const validate_signature_1 = require("./validate-signature");
function isValidBody(body) {
    return (body && typeof body === "string") || Buffer.isBuffer(body);
}
function middleware(config) {
    if (!config.channelSecret) {
        throw new Error("no channel secret");
    }
    const secret = config.channelSecret;
    return (req, res, next) => {
        // header names are lower-cased
        // https://nodejs.org/api/http.html#http_message_headers
        const signature = req.headers["x-line-signature"];
        if (!signature) {
            next(new exceptions_1.SignatureValidationFailed("no signature"));
            return;
        }
        let getBody;
        if (isValidBody(req.rawBody)) {
            // rawBody is provided in Google Cloud Functions and others
            getBody = Promise.resolve(req.rawBody);
        }
        else if (isValidBody(req.body)) {
            getBody = Promise.resolve(req.body);
        }
        else {
            // body may not be parsed yet, parse it to a buffer
            getBody = new Promise(resolve => {
                body_parser_1.raw({ type: "*/*" })(req, res, () => resolve(req.body));
            });
        }
        getBody.then(body => {
            if (!validate_signature_1.default(body, secret, signature)) {
                next(new exceptions_1.SignatureValidationFailed("signature validation failed", signature));
                return;
            }
            const strBody = Buffer.isBuffer(body) ? body.toString() : body;
            try {
                req.body = JSON.parse(strBody);
                next();
            }
            catch (err) {
                next(new exceptions_1.JSONParseError(err.message, strBody));
            }
        });
    };
}
exports.default = middleware;
