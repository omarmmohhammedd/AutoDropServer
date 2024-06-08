"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const homeRouter = (0, express_1.Router)();
homeRouter.get("/", (req, res) => {
    res.sendStatus(200);
});
exports.default = homeRouter;
