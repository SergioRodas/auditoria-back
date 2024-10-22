"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const userUtils_1 = require("../utils/userUtils");
const datatableDefault_1 = require("../constants/datatableDefault");
const router = express_1.default.Router();
router.get("/", authMiddleware_1.requireAuth, (req, res) => {
    var _a;
    let username = (_a = (0, userUtils_1.getUser)(req)) === null || _a === void 0 ? void 0 : _a.username;
    res.render("home", {
        username,
        name: "home",
    });
});
router.get("/export-by-valuation", authMiddleware_1.requireAuth, (req, res) => {
    var _a;
    let username = (_a = (0, userUtils_1.getUser)(req)) === null || _a === void 0 ? void 0 : _a.username;
    res.render("exportByValuation", {
        username,
        dataTableData: datatableDefault_1.dataTableData,
        name: "exportByValuation"
    });
});
router.get("/daily-balance", authMiddleware_1.requireAuth, (req, res) => {
    var _a;
    let username = (_a = (0, userUtils_1.getUser)(req)) === null || _a === void 0 ? void 0 : _a.username;
    res.render("dailyBalance", {
        username,
        name: "dailyBalance"
    });
});
router.get("/negative-comments", authMiddleware_1.requireAuth, (req, res) => {
    var _a;
    let username = (_a = (0, userUtils_1.getUser)(req)) === null || _a === void 0 ? void 0 : _a.username;
    res.render("negativeComments", {
        username,
        name: "negativeComments",
    });
});
router.post("/download-excel", authMiddleware_1.requireAuth, (req, res) => {
    const { filePath } = req.body;
    res.download(filePath, 'notas.xlsx', (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
            res.status(500).send('Error al descargar el archivo');
        }
    });
});
router.get("/login", authMiddleware_1.redirectToHomeIfAuthenticated, (req, res) => {
    res.render("login", { title: "Login" });
});
router.get("/logout", (req, res) => {
    res.clearCookie("userToken");
    res.redirect("/login");
});
exports.default = router;
