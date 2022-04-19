import express from 'express';

const app = express();

app.get("/health", (req, res, next) => {
  res.status(200).send("OK");
  next();
})

app.use((req, res, next) => {
  console.log(`${res.statusCode} ${req.method} ${req.path}`);
  next();
})

app.listen(3010, () => {
  console.log("App listening on http://localhost:3010")
})