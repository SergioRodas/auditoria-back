"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const auth_1 = require("../auth/auth");
const getUser = (req) => {
    var _a;
    const userToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userToken;
    if (userToken) {
        const user = (0, auth_1.authenticate)(userToken);
        return user;
    }
    return null;
};
exports.getUser = getUser;
