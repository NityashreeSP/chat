import User from "../models/User.js";
import jwt from "jsonwebtoken";


export const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({message: "unauthorised - no token provided"});
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        if(!decoded) {
            return res.status(401).json({message: "unauthorised - invalid token"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.status(401).json({message: "unauthorised - user not found"});
        }


        req.user = user;
        next();

    } catch(error){
        consolr.log("error in protectRoute middleware", error);
    }


}