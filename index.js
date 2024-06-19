require('dotenv').config();
let dns = require('dns')
const validUrl = require("valid-url");
let bodyParser = require("body-parser");
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
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

  console.log(url)

  let t = await validateUrl(url);

  if(t != "ok"){
    res.json({
      error: t
    });
    return
  }

  res.json({
    original_url: url,
    short_url: 1,
  });
})

app.get("/api/shorturl/:url", (req, res) => {
  console.log(req.params.url);
  req.baseUrl = ""
  res.redirect(302, "" + req.params.url);
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

async function validateUrl(url){

  if(!url || url == ""){
    return "empty url";
  }

  const hostname = new URL(url).hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "ok"
  }

  try{
    await dns.promises.lookup(url, {});
  } catch(e){
      return "invalid url";
  }

  return "ok"

}