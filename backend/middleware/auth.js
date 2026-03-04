import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || '';
        const [, token] = auth.split(' ');

        if (!token) {
            return res.status(401).json({ message: 'Authentication token is missing.' });
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
}


export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const [, token] = auth.split(" ");

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch {
    // Optional auth: ignore invalid token.
  }

  return next();
}
