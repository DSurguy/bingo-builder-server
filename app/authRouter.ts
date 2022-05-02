import express, { RequestHandler } from 'express';
import { getAuth as serviceGetAuth } from 'firebase-admin/auth';
import getFirebaseService from './firebaseService.js';

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']?.toString();
    if( !authHeader ) return next("Missing Authorizationn");
    const token = await serviceGetAuth(
      await getFirebaseService()
    ).verifyIdToken(authHeader.replace(/^Bearer\s+/, ""))
    res.locals.userId = token.uid;
    next();
  } catch (e) {
    return next("Invalid Authorization");
  }
}
const authenticatedRouter = express.Router();
authenticatedRouter.use(authMiddleware)
export default authenticatedRouter;