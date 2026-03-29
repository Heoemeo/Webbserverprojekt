import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// Vi utökar Express Request så vi kan spara userId på requesten
export interface AuthRequest extends Request {
    userId?: number
}

export const authenticateToken = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    // Hämtar Authorization-headern
    const authHeader = req.headers.authorization

    // Kollar att den finns och börjar med "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token missing" })
    }

    // Tar ut själva tokenen
    const token = authHeader.split(" ")[1]

    try {
        // Verifierar token med samma secret som vid login
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number
        }

        // Sparar user id på requesten
        req.userId = decoded.id

        // Går vidare till controller
        next()
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" })
    }
}
