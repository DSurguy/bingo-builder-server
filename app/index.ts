import got from 'got';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getAuth } from 'firebase-admin/auth'
import configureEnv from './configureEnv';
import authRouter from './authRouter';
import getFirebaseService from './firebaseService';

configureEnv();

const openCors = cors();
const bingoClientCors = cors({
  origin: process.env.SITE_ORIGIN
})
const jsonParser = bodyParser.json();

const app = express();

app.get("/health", openCors, (req, res, next) => {
  res.status(200).send("OK");
  next();
});

app.options("/auth/createUser", bingoClientCors);
app.post("/auth/createUser", bingoClientCors, jsonParser, async (req, res, next) => {
  try {
    const { email, password, captchaToken } = req.body;
    
    if( 
      !email ||
      !password ||
      !captchaToken ||
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof captchaToken !== 'string'
    ) {
      res.sendStatus(400);
      next();
      return;
    }
    
    const captchaResponse = await got.post('https://www.google.com/recaptcha/api/siteverify', {
      json: {
        secret: process.env.GOOGLE_RECAPTCHA_KEY,
        response: captchaToken,
        remoteip: req.ip
      }
    }).json<{
      "success": boolean;
      "challenge_ts": string; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
      "hostname": string; // the hostname of the site where the reCAPTCHA was solved
      "error-codes"?: string[]; // optional
    }>();

    if( !captchaResponse.success ) {
      res.sendStatus(401);
      next();
      return;
    }
    
    const auth = getAuth(await getFirebaseService());
    await auth.createUser({
      email,
      password,
      emailVerified: false,
    });
    res.sendStatus(200);
  } catch (e) {
    console.error("Error creating user", e);
    res.sendStatus(500);
  }
  next();
});

authRouter.options("/auth/deleteUserData", bingoClientCors);
authRouter.post("/auth/deleteUserData", bingoClientCors, async (req, res, next) => {
  res.sendStatus(200);
})

authRouter.options("/auth/exportUserData", bingoClientCors);
authRouter.post("/auth/exportUserData", bingoClientCors, async (req, res, next) => {
  res.sendStatus(200);
})

app.use(authRouter, (req, res, next) => {
  res.sendStatus(401);
  next();
});

app.use((req, res, next) => {
  console.log(`${res.statusCode} ${req.method} ${req.path}`);
  next();
})

app.listen(3010, () => {
  console.log("App listening on http://localhost:3010")
})