const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const hostname = '127.0.0.3';
const port = 8000;



app.get(/[\s\S]*/, function(req, res) {
  let router = req.url;
  if(router == "/favicon.ico") router = "/";
  if(router.startsWith("/login"))
  {
    fs.readFile("login.html", "utf-8",(err, data)=>{
      if(err) throw err;
      res.send(data);
    });
  }
  else if (router.startsWith("/password")) {
    fs.readFile("passwords.html", "utf-8",(err, data)=>{
      if(err) throw err;
      res.send(data);
    });
  }
  else
  {
    fs.readFile("login.html", "utf-8",(err, data)=>{
      if(err) throw err;
      res.send(data);
    });
  }
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});