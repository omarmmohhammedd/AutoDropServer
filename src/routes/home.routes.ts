import { Request, Response, Router } from "express";

const homeRouter = Router();
homeRouter.get("/", (req:Request,res:Response)=>{
    res.sendStatus(200);
});

export default homeRouter;
