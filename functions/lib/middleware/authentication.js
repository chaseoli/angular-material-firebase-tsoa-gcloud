"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function expressAuthentication(request, securityName, scopes) {
    if (securityName === 'api_key') {
        return new Promise((resolve) => {
            return resolve();
        });
    }
    return Promise.reject({});
}
exports.expressAuthentication = expressAuthentication;
;
//# sourceMappingURL=authentication.js.map