const express = require("express");
const router = express.Router();

router.get('/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

module.exports = router;
