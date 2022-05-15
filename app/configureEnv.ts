import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function configureEnv() {
  const { error: localDotEnvError } = dotenv.config({ path: resolve(__dirname, '../.env') });
  if( localDotEnvError ) {
    console.log("dotenv - Unable to load .env", localDotEnvError);
  }

  //Load firebase SDK
  process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(__dirname, '../keys/firebaseService.json');
}