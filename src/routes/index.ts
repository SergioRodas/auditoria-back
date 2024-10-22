import express from "express";
import { redirectToHomeIfAuthenticated, requireAuth } from "../middlewares/authMiddleware";
import { getUser } from "../utils/userUtils";
import { dataTableData } from '../constants/datatableDefault';

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
    let username = getUser(req)?.username;

    res.render("home", {
        username,
        name: "home",
    });
});

router.get("/export-by-valuation", requireAuth, (req, res) => {
    let username = getUser(req)?.username;

    res.render("exportByValuation", {
        username,
        dataTableData,
        name: "exportByValuation"
    });
});

router.get("/daily-balance", requireAuth, (req, res) => {
    let username = getUser(req)?.username;

    res.render("dailyBalance", {
        username,
        name: "dailyBalance"
    });
});

router.get("/negative-comments", requireAuth, (req, res) => {
    let username = getUser(req)?.username;

    res.render("negativeComments", {
        username,
        name:  "negativeComments",
    });
});

router.post("/download-excel", requireAuth, (req, res) => {
    const { filePath } = req.body;

    res.download(filePath, 'notas.xlsx', (err) => {
        if (err) {
            console.error('Error al descargar el archivo:', err);
            res.status(500).send('Error al descargar el archivo');
        }
    });
});

router.get("/login", redirectToHomeIfAuthenticated, (req, res) => {
    res.render("login", { title: "Login" });
});

router.get("/logout", (req, res) => {
    res.clearCookie("userToken");
    res.redirect("/login");
});

export default router;
