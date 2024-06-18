const express = require("express");
const router = express.Router();

var multer = require('multer');
var upload = multer({ dest: 'uploads/' });

router.post('/fileanalyse', upload.single('upfile'), (req, res) => {
  try {
    res.json({
      "name": req.file.originalname,
      "type": req.file.mimetype,
      "size": req.file.size
    });
  } catch (err) {
    res.send(400);
  }
});

module.exports = router;
