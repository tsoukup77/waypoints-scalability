const express = require("express");
const app = express();
const port = process.env.PORT || 3300;

const { scrypt, scryptSync } = require("node:crypto");

const server = app.listen(port, () => {
  console.log(`Server listening on ${port}.`);
});

app.get("/compute", (req, res, next) => {
  for (let i = 0; i < 1e6; i++);
  res.json({ ok: true });
});

app.get("/bcrypt", async (req, res, next) => {
  var salt = await bcrypt.genSalt(10);
  var hash = bcrypt.hash("B4c0//", salt);
  res.json({ hash });
});

app.get("/hash", async (req, res, next) => {
  const key = scryptSync("password", "salt", 64);
  res.json({ hash: key.toString("base64") });
});

app.get("/hash-async", async (req, res, next) => {
  scrypt("password", "salt", 64, (err, key) => {
    res.json({ hash: key.toString("base64") });
  });
});
