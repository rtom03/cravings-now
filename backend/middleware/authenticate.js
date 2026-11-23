import jwt from "jsonwebtoken";
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : req.cookies?.token;
    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({
            message: "Authentication configuration error",
        });
    }
    try {
        const payload = jwt.verify(token, jwtSecret);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
};
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            message: "Forbidden",
        });
    }
    next();
};
