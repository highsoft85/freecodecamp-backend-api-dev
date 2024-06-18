const express = require("express");
const router = express.Router();

router.get("/whoami", function (req, res) {
  const ip = req.headers['x-forwarded-for']; 
  const language = req.headers['accept-language'];
  const software = req.headers['user-agent'];
  res.send({ipaddress: ip, language: language, software: software});
})

module.exports = router;
