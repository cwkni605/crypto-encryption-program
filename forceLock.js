const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { json } = require('express');
const hostname = '127.0.0.3';
const port = 8000;


app.get(/[\s\S]*/, function(req, res) {
  let router = req.url;
  if(router == "/favicon.ico") router = "/";

  if(router.startsWith("/password"))
  {
    fs.readFile("passwords.html", "utf-8",(err, siteData)=>
    {
      if(err) throw err;
      let userName = router.slice(router.indexOf("/"),router.lastIndexOf("/"));
      userName = userName.slice(userName.lastIndexOf("/")+1);
      let userKey = router.slice(router.lastIndexOf("/")+1);
      let output = [];
      fs.readFile(userName + ".txt",(err, fileData)=>
      {
        if(err) throw err;
        fileData = fileData.toString();
        fileData = JSON.parse(decrypt(fileData, userKey).toString(CryptoJS.enc.Utf8));
        for (let I = 0; I < fileData.length; I++)
        {
          const dataTrio = fileData[I];
          output.push(`<tr><td>${dataTrio.site}</td><td>${dataTrio.username}</td><td>${dataTrio.password}</td></tr>`);
        }
        siteData = siteData.replace("^^_u_^^", output.toString());
        res.send(siteData);
      });
    });
  }
  else if(router.startsWith("/new"))
  {
    //
  }
  else
  {
    fs.readFile("login.html", "utf-8",(err, data)=>{
      if(err) throw err;
      res.send(data);
    });
  }
});

function encrypt(text, passkey)
{
  return encrypted = CryptoJS.AES.encrypt(text, passkey);
}

function decrypt(encryptedText, passkey)
{
  return decrypted = CryptoJS.AES.decrypt(encryptedText, passkey);
}

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
/*
fs.readFile("cknight167.json",(err, fileData)=>
{
  //fileData = JSON.parse(fileData);
  fileData = fileData.toString();
  console.log(fileData);
  fileData = String(encrypt(fileData,"logger"));
  fs.writeFileSync("cknight167.json",fileData);
});

fs.readFile("cknight167.txt",(err, fileData)=>
{
  fileData = fileData.toString();
  fileData = decrypt(fileData,"logger").toString(CryptoJS.enc.Utf8);
  console.log(JSON.parse(fileData));
});
*/