import express, { RequestHandler } from 'express';
import { getAuth as serviceGetAuth } from 'firebase-admin/auth';
import getFirebaseService from './firebaseService.js';

const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = res.getHeader('Authorization')?.toString();
    if( !authHeader ) return next('router');
    const token = await serviceGetAuth(
      await getFirebaseService()
    ).verifyIdToken(authHeader)
    res.locals.userId = token.uid;
    next();
  } catch (e) {
    return next('router');
  }
}
const authenticatedRouter = express.Router();
authenticatedRouter.use(authMiddleware)
export default authenticatedRouter;