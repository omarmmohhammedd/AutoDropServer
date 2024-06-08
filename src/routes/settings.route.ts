import Authentication from "../assits/Authentication"
import { getUserSettings, updateUserData, updateUserSettings } from "../controllers/settings"
import express from 'express';

const settingRoute = express.Router()

settingRoute.get('/',[Authentication()],getUserSettings)
settingRoute.patch('/',[Authentication()],updateUserSettings)
settingRoute.patch('/user',[Authentication()],updateUserData)

export default settingRoute