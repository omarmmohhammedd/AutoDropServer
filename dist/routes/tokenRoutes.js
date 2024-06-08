"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tokenController_1 = require("../controllers/tokenController");
const router = (0, express_1.Router)();
router.delete("/aliExpressToken/:id", tokenController_1.deleteAliExpressToken);
router.delete("/sallaToken/:id", tokenController_1.deleteSallaToken);
exports.default = router;
