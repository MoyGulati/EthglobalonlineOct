import * as ipfsClient from "ipfs-http-client";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import fileUpload from "express-fileupload";
import cors from "cors";

// const express = require("express");
// const bodyParser = require("body-parser");
// const fileUpload = require("express-fileupload");
// const fs = require("fs");

// import * as IPFS from 'ipfs-core';
// const ipfs = await IPFS.create();
// const { cid } = await ipfs.add('Hello');
// console.log(cid);

const ipfs = await ipfsClient.create({
  url: "http://127.0.0.1:5001/api/v0",
});

// const ipfs = await IPFS.create();

const app = express();

let accountData;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.render("home");
});
app.post("/account", (req, res) => {
  accountData = req.body.account;
  console.log("Received account data:", accountData);
  req.session.save(() => {
    console.log("Session data saved");
    res.render("home");
  });

  // res.render("home");
});

app.post("/upload", (req, res) => {
  const file = req.files.file;
  const fileName = req.body.fileName;
  const filePath = "files/" + fileName;

  file.mv(filePath, async (err) => {
    if (err) {
      console.log("Error: Failed to download the file");
      return res.status(500).send(err);
    }

    const fileHash = await addFile(fileName, filePath);
    fs.unlink(filePath, (err) => {
      if (err) console.log(err);
    });

    res.render("upload", { fileName, fileHash, accountData });
  });
});

const addFile = async (fileName, filePath) => {
  const file = fs.readFileSync(filePath);
  const fileAdded = await ipfs.add({ path: fileName, content: file });
  console.log("fileAdded: ", fileAdded);
  const fileHash = fileAdded.cid.toString();
  console.log("CID: ", fileHash);
  return fileHash;
};

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
