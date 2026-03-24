import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../utils/db";
import { RequestReset, VerifyReset, CompleteReset } from "../types"
import { validateEmail } from "../utils/validation";

export const requestReset = async (req: Request, res: Response) => {
    
};

export const verifyReset = async (req: Request, res: Response) => {
    
};

export const completeReset = async (req: Request, res: Response) => {
    
};