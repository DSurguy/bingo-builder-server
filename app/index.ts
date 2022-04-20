import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createUserWithEmailAndPassword, getAuth, signOut } from 'firebase/auth';
import configureEnv from './configureEnv';
import getFirebaseApp from './firebase';

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

app.post("/auth/createUser", bingoClientCors, jsonParser, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if( !email || !password ) return res.status(400);
    const auth = getAuth(await getFirebaseApp());
    const user = await createUserWithEmailAndPassword(auth, email, password);
    signOut(auth);
    res.sendStatus(200);
  } catch (e) {
    console.error("Error creating user", e);
    res.sendStatus(500);
  }
  next();
});

app.use((req, res, next) => {
  console.log(`${res.statusCode} ${req.method} ${req.path}`);
  next();
})

app.listen(3010, () => {
  console.log("App listening on http://localhost:3010")
})