import got from 'got';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getAuth } from 'firebase-admin/auth'
import configureEnv from './configureEnv.js';
import authRouter from './authRouter.js';
import getFirebaseService from './firebaseService.js';

configureEnv();

const openCors = cors();
const bingoClientCors = cors({
  origin: process.env.SITE_ORIGIN
})
const jsonParser = bodyParser.json();

const app = express();

app.get("/health", openCors, async (req, res, next) => {
  try {
    const auth = getAuth(await getFirebaseService());
    if( auth ) res.status(200).send("OK");
    else res.status(500).send("NO AUTH");
  } catch (e) {
    res.status(500).send("ERROR");
  }
  next();
});

app.options("/createUser", bingoClientCors);
app.post("/createUser", bingoClientCors, jsonParser, async (req, res, next) => {
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
      return next();
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

app.get("/auth/health", openCors, authRouter, (req, res, next) => {
  res.status(200).send("OK");
  next();
})

authRouter.post("/deleteUserData", async (req, res, next) => {
  res.sendStatus(200);
})

authRouter.post("/exportUserData", async (req, res, next) => {
  res.sendStatus(200);
})

app.use("/auth", bingoClientCors, authRouter);

app.use((req, res, next) => {
  console.log(`${res.statusCode} ${req.method} ${req.path}`);
  next();
})

app.listen(3010, () => {
  console.log("App listening on http://localhost:3010")
})