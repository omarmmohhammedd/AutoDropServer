import { Router } from "express";
import {
  deleteAliExpressToken,
  deleteSallaToken,
} from "../controllers/tokenController";

const router = Router();
router.delete("/aliExpressToken/:id", deleteAliExpressToken);
router.delete("/sallaToken/:id", deleteSallaToken);
export default router;
