const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express();
const CryptoJS = require('crypto-js');
const { json } = require('express');
const hostname = '127.0.0.5';
const bighostname = '192.168.1.202';//on dev computer'192.168.1.179';
const port = 8000;


app.get(/[\s\S]*/, function(req, res) {
  let router = req.url;
  if(router == "/favicon.ico"){
    res.sendFile(__dirname + "/" + "favicon.ico");
  }
  else if(router.startsWith("/newUser"))
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
      /* probaly will break the program because roll key does not exist
      let rollingKey = router.slice(slashpos[2]+1,slashpos[3]);
      //*/
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, irrelevant)=>
      {
        if(err)
        {
          fs.writeFileSync(__dirname + "/" + hashedUserName + ".txt", "");
          fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
          {
            if(err)
            {
              res.redirect(`http://${bighostname}:8000/`);
            }
            else
            {
              try {
                //fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
                //fileData.push({"site":newSite,"username":newUsername,"password":newPassword});
                fileData = []; //resets the data
                let encryptData = encryptMax(fileData, userKey);
                fs.writeFileSync(hashedUserName+".txt", encryptData.data);
                res.redirect(`http://${bighostname}:8000/password/${userName}/${userKey}/${encryptData.path}/`);
              } catch (error) {
                console.log(error);
                res.redirect(`http://${bighostname}:8000/`);
              }
            }
          });
        }
        else
        {
          res.redirect(`http://${bighostname}:8000/`);
        }
      });
    });
  }
  else if(router.startsWith("/password"))
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
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${bighostname}:8000/`);
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
            res.redirect(`http://${bighostname}:8000/`);
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
      let newSite = router.slice(slashpos[3]+1,slashpos[4]).replace(/(%20)/g, " ");
      let newUsername = router.slice(slashpos[4]+1,slashpos[5]).replace(/(%20)/g, " ");
      let newPassword = router.slice(slashpos[5]+1,slashpos[6]).replace(/(%20)/g, " ");
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${bighostname}:8000/`);
        }
        else
        {
          try {
            fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
            fileData.push({"site":newSite,"username":newUsername,"password":newPassword});
            //fileData = []; //resets the data
            let encryptData = encryptMax(fileData, userKey);
            fs.writeFileSync(hashedUserName+".txt", encryptData.data);
            res.redirect(`http://${bighostname}:8000/password/${userName}/${userKey}/${encryptData.path}/`);
          } catch (error) {
            console.log(error);
            res.redirect(`http://${bighostname}:8000/`);
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
      let output = [];
      fs.readFile(__dirname + "/" + hashedUserName + ".txt",(err, fileData)=>
      {
        if(err)
        {
          res.redirect(`http://${bighostname}:8000/`);
        }
        else
        {
          try
          {
            fileData = JSON.parse(decryptMax(fileData, userKey, rollingKey));
            let encryptData = encryptMax(fileData, userKey);
            fs.writeFileSync(hashedUserName+".txt", encryptData.data);
            res.redirect(`http://${bighostname}:8000/password/${userName}/${userKey}/${encryptData.path}/`);
          }
          catch(error)
          {
            console.log(error);
            res.redirect(`http://${bighostname}:8000/`);
          }
        }
      });
    });
  }
  else
  {
    console.log("attempt at intrution, failed login attempt, or first join detected, sending root\nSource: " + router + "\n" + req.url + "\n");
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
/*
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
//*/
app.listen(port, bighostname, () => {
  console.log(`Server running at http://${bighostname}:${port}/`);
})

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