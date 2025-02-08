import { Router } from "express";
import { generateCV } from "../controllers/AI";

const aiRoute = Router();

aiRoute.post('/translate', generateCV);

export default aiRoute;