"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectToHomeIfAuthenticated = exports.requireAuth = void 0;
const auth_1 = require("../auth/auth");
require("dotenv").config();
const requireAuth = (req, res, next) => {
    var _a;
    const userToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userToken;
    if (!userToken) {
        return res.redirect("/login");
    }
    try {
        const userDecoded = (0, auth_1.authenticate)(userToken);
        if (userDecoded)
            next();
    }
    catch (err) {
        console.error("Error al verificar el token JWT:", err);
        return res.redirect("/login");
    }
};
exports.requireAuth = requireAuth;
const redirectToHomeIfAuthenticated = (req, res, next) => {
    var _a;
    const userToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userToken;
    if (userToken) {
        try {
            const userDecoded = (0, auth_1.authenticate)(userToken);
            if (userDecoded)
                return res.redirect("/");
        }
        catch (err) {
            console.error("Error al verificar el token JWT:", err);
        }
    }
    next();
};
exports.redirectToHomeIfAuthenticated = redirectToHomeIfAuthenticated;
