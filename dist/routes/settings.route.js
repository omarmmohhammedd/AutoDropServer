"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Authentication_1 = __importDefault(require("../assits/Authentication"));
const settings_1 = require("../controllers/settings");
const express_1 = __importDefault(require("express"));
const settingRoute = express_1.default.Router();
settingRoute.get('/', [(0, Authentication_1.default)()], settings_1.getUserSettings);
settingRoute.patch('/', [(0, Authentication_1.default)()], settings_1.updateUserSettings);
settingRoute.patch('/user', [(0, Authentication_1.default)()], settings_1.updateUserData);
exports.default = settingRoute;
