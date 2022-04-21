const dotenv = require("dotenv");
import { resolve } from 'path';

export default function configureEnv() {
  const { localDotEnvError } = dotenv.config({ path: resolve(__dirname, '../.env.local') });
  if( localDotEnvError ) {
    console.log("dotenv - Unable to load .env.local", localDotEnvError);
  }

  const { realEnvError } = dotenv.config({ path: resolve(__dirname, '../.env')});
  if( realEnvError ) {
    console.log("dotenv - Unable to load .env", realEnvError);
  }

  //Load firebase SDK
  process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(__dirname, '../keys/firebaseService.json');
}