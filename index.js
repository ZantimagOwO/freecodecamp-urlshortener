require("dotenv").config();
let dns = require("dns");
const validUrl = require("valid-url");
let bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const app = express();

let urls = []

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", function (req, res, next) {
  console.log(req.method + " " + req.url);

  if (req.method == "POST") {
    console.log(req.body);
  }

  next();
});

app.post("/api/shorturl", async (req, res) => {
  const url = req.body.url;

  console.log(url);

  let t = await validateUrl(url);

  if (t != "ok") {
    res.json({
      error: t,
    });
    return;
  }

  urls.push(url)

  res.json({
    original_url: url,
    short_url: urls.indexOf(url),
  });
});

app.get("/api/shorturl/:url", async (req, res) => {
  let url = req.params.url;

  console.log(url);
  console.log("urls:" + urls)

  let foundUrl = urls[url]
  console.log("found url: " + foundUrl)
  res.redirect(302, foundUrl);
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

async function validateUrl(url) {
  console.log("Valdiating " + url);

  if (!url || url == "") {
    return "empty url";
  }

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    console.log("COULDNT PARSE");
    return "invalid url";
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    console.log("LOCALHOST URL");
    return "ok";
  }

  try {
    await dns.promises.lookup(hostname, {});
  } catch (e) {
    console.log("DNS NOT FOUND");
    return "invalid url";
  }

  return "ok";
}
