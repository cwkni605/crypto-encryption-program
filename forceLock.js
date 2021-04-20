const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { json } = require('express');
const nodemailer = require('nodemailer');// needs install
const {google} = require('googleapis');//   needs install
const hostname = '127.0.0.5';
const port = 8000;


app.get(/[\s\S]*/, function(req, res) {
  let router = req.url;
  if(router == "/favicon.ico") router = "/";

  if(router.startsWith("/password"))
  {
    fs.readFile("passwords.html", "utf-8",(err, siteData)=>
    {
      if(err) throw err;
      let slashpos;
      slashpos = [];
      for(let i = 0; i < router.length; i++)
      {
        if (router[i] === "/" && i != 0)
        {
          slashpos.push(i);
        }
      }
      let userName = router.slice(slashpos[0]+1,slashpos[1]);
      let hashedUserName = CryptoJS.SHA256(userName).toString(CryptoJS.enc.Hex);
      let userKey = router.slice(slashpos[1]+1,slashpos[2]);
      let rollingKey = router.slice(slashpos[2]+1,slashpos[3]);
      console.log(userName);
      console.log(userKey);
      console.log(rollingKey);
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${hostname}:8000/`);
        }
        else
        {
          try
          {
            fileData = fileData.toString();
            fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
            for (let I = 0; I < fileData.length; I++)
            {
              const dataTrio = fileData[I];
              output.push(`<tr><td>${dataTrio.site}</td><td>${dataTrio.username}</td><td>${dataTrio.password}</td></tr>`);
            }
            if(fileData.length == 0)
            {
              output.push(`<tr><td>You Have not added a...</td><td>Username</td><td>Or password</td></tr>`);
            }
            siteData = siteData.replace("^^_u_^^", output.join(''));
            res.send(siteData);
          }
          catch (error)
          {
            res.redirect(`http://${hostname}:8000/`);
          }
        }
      });
    });
  }
  else if(router.startsWith("/new"))
  {
    fs.readFile("passwords.html", "utf-8",(err, siteData)=>
    {
      if(err) throw err;
      let slashpos;
      slashpos = [];
      for(let i = 0; i < router.length; i++)
      {
        if (router[i] === "/" && i != 0)
        {
          slashpos.push(i);
        }
      }
      let userName = router.slice(slashpos[0]+1,slashpos[1]);
      let hashedUserName = CryptoJS.SHA256(userName).toString(CryptoJS.enc.Hex);
      let userKey = router.slice(slashpos[1]+1,slashpos[2]);
      let rollingKey = router.slice(slashpos[2]+1,slashpos[3]);
      let newSite = router.slice(slashpos[3]+1,slashpos[4]);
      let newUsername = router.slice(slashpos[4]+1,slashpos[5]);
      let newPassword = router.slice(slashpos[5]+1,slashpos[6]);
      console.log(userName);
      console.log(userKey);
      console.log(rollingKey);
      console.log(newSite);
      console.log(newUsername);
      console.log(newPassword);
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${hostname}:8000/`);
        }
        else
        {
          try {
            fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
            fileData.push({"site":newSite,"username":newUsername,"password":newPassword});
            //fileData = []; //resets the data
            let encryptData = encryptMax(fileData, userKey);
            fs.writeFileSync(hashedUserName+".txt", encryptData.data);
            res.redirect(`http://${hostname}:8000/password/${userName}/${userKey}/${encryptData.path}/`);
          } catch (error) {
            console.log(error);
            res.redirect(`http://${hostname}:8000/`);
          }
        }
      });
    });
  }
  else if(router.startsWith("/refresh"))
  {
    fs.readFile("passwords.html", "utf-8",(err, siteData)=>
    {
      if(err) throw err;
      let slashpos;
      slashpos = [];
      for(let i = 0; i < router.length; i++)
      {
        if (router[i] === "/" && i != 0)
        {
          slashpos.push(i);
        }
      }
      let userName = router.slice(slashpos[0]+1,slashpos[1]);
      let hashedUserName = CryptoJS.SHA256(userName).toString(CryptoJS.enc.Hex);
      let userKey = router.slice(slashpos[1]+1,slashpos[2]);
      let rollingKey = router.slice(slashpos[2]+1,slashpos[3]);
      console.log("r",userName);
      console.log("r",userKey);
      console.log("r",rollingKey);
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${hostname}:8000/`);
        }
        else
        {
          try
          {
            fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
            let encryptData = encryptMax(fileData, userKey);
            fs.writeFileSync(hashedUserName+".txt", encryptData.data);
            res.redirect(`http://${hostname}:8000/password/${userName}/${userKey}/${encryptData.path}/`);
          }
          catch(error)
          {
            console.log(error);
            res.redirect(`http://${hostname}:8000/`);
          }
        }
      });
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

function encryptMax(text, passkey)
{
  let path = "";
  let encrypted = JSON.stringify(text);
  for (let i = 0; i < 10; i++)
  {
    let rand = Math.round(Math.random()*4);
    path = path.concat(rand);
    //console.log(path,encrypted,passkey);
    if (rand == 0) {
      encrypted = String(CryptoJS.AES.encrypt(encrypted, passkey));
    }
    if (rand == 1) {
      encrypted = String(CryptoJS.DES.encrypt(encrypted, passkey));
    }
    if (rand == 2) {
      encrypted = String(CryptoJS.TripleDES.encrypt(encrypted, passkey));
    }
    if (rand == 3) {
      encrypted = String(CryptoJS.RC4.encrypt(encrypted, passkey));
    }
    if (rand == 4) {
      encrypted = String(CryptoJS.Rabbit.encrypt(encrypted, passkey));
    }
  }
  output = {"data":encrypted,"path":path};
  return output;
}

function decryptMax(encryptedText, passkey, path)
{
  let decrypted = String(encryptedText);
  for (let i = 0; i < path.length; i++)
  {
    let currentPath = path[path.length-1-i];
    if (currentPath == 0) {
      decrypted = CryptoJS.AES.decrypt(decrypted, passkey).toString(CryptoJS.enc.Utf8);
    }
    if (currentPath == 1) {
      decrypted = CryptoJS.DES.decrypt(decrypted, passkey).toString(CryptoJS.enc.Utf8);
    }
    if (currentPath == 2) {
      decrypted = CryptoJS.TripleDES.decrypt(decrypted, passkey).toString(CryptoJS.enc.Utf8);
    }
    if (currentPath == 3) {
      decrypted = CryptoJS.RC4.decrypt(decrypted, passkey).toString(CryptoJS.enc.Utf8);
    }
    if (currentPath == 4) {
      decrypted = CryptoJS.Rabbit.decrypt(decrypted, passkey).toString(CryptoJS.enc.Utf8);
    }
  }
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function decrypt(encryptedText, passkey)
{
  return decrypted = CryptoJS.AES.decrypt(encryptedText, passkey).toString(CryptoJS.enc.Utf8);
}

function encrypt(text, passkey)
{
  return encrypted = CryptoJS.AES.encrypt(text, passkey);
}
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

//max encrypt and decrypt
/*
fs.readFile("cknight167.txt",(err, fileData)=>
{
  //fileData = JSON.parse(fileData);
  fileData = fileData.toString();
  console.log(fileData);
  fileData = String(encrypt(fileData,"logger"));
  fs.writeFileSync("cknight167.txt",fileData);
});
//*/
/*
fs.readFile("cknight167.txt",(err, fileData)=>
{
  fileData = fileData.toString();
  fileData = decrypt(fileData,"logger");
  console.log(JSON.parse(fileData));
});
//*/

//rolling key test (functional)
/*
fs.readFile("cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90"+".txt",(err, fileData)=>
{
  fileData = encryptMax(fileData,"logger");
  fs.writeFileSync("cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90.txt",fileData.data);
  console.log(fileData.path);
});
//*/
/*
fs.readFile("testing.txt",(err, fileData)=>
{
  if(err) throw err
  fileData = decryptMax(fileData, "logger", "0110432121");
  console.log(JSON.parse(fileData));
});
//*/

//hashing a file name
/*.toString(CryptoJS.enc.Hex);
let oldname = "testing";
let hashedName = CryptoJS.SHA256(oldname).toString(CryptoJS.enc.Hex);
fs.renameSync(oldname+".txt", hashedName+".txt");
//*/


//define client information from google developer console
const CLIENT_ID = '239833299288-attcbt6cg8iu8n8fvvkt2u77i8d54kd2.apps.googleusercontent.com';
const CLIENT_SECRET = 'FGpJigJM0ORp-G3JewO-AdXL';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground/';
const REFRESH_TOKEN = '1//04JsW_0UQn8nfCgYIARAAGAQSNwF-L9IrDc20phbP_leTiZUWt4Ejt-jAET5HlDcbxdP5IXmVOSQNx-gOT4UthbWzbwZWkag5Smc';

//using the google object create and populate authentication creds
const oAuth2client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuth2client.setCredentials({refresh_token: REFRESH_TOKEN});

//send email function
async function sendMail(from, to, title, body, attachments="") {
    try {
      const accessToken = await oAuth2client.getAccessToken();
      const transport = nodemailer.createTransport({
          service:'gmail',
          auth:{
            type:'oAuth2',
            user:'cknight167@west-mec.org',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
          }
        });
      const eMail = {
        from: `${from}<cknight167@west-mec.org>`,
        to: to,
        subject: title,
        text: body,
        html: body
      }
      if(attachments != "")
      {
        eMail.attachments=[{path: "resources/"+attachments}];
      }
      const result = await transport.sendMail(eMail);
      return result;
    }
    catch (error) {
      return error;
    }
}
//sendMail("Connor Knight Test","mcrowell206@west-mec.org","this is a test", "this is a test for my two step oAuth for my password manager.").then(result => console.log("Email sent...", result)).catch((error)=> console.log(error.message));