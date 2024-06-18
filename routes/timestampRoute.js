const express = require("express");
const router = express.Router();

// Display the current time and its unix conversion for GET requests to the path /api
// Use JSON notation! 
router.get('/', (req, res) => {
  var time = new Date();
  var currentTime = time;
  var unixTime = time.getTime();
  res.json({"unix": unixTime, "utc": currentTime.toUTCString()});
});

router.get('/:time?', (req, res) => {
  // Extract the number entered after the time
  var enteredTime = req.params.time;

  // Try to parse the string entered
  var parsed = Date.parse(enteredTime);

  // If parsed is a number, treat the entered value as a valid UTC time
  // If parsed is NaN, treat the entered value as a valid unix time
  if (!isNaN(parsed)) {
    var utc = new Date(enteredTime);
    var unix = utc.getTime();
  } else {
    unix = new Number(enteredTime);
    utc = new Date(unix);
  }
  // Debug statement to see the original values and conversions
  console.log(`entered time: ${enteredTime} current time: ${utc} unix time: ${unix}`);

  // Send an error JSON object if the date is still invalid
  // Otherwise, send the time in unix and utc format
  if (utc == "Invalid Date") {
      res.json({"error": utc.toString()});
  } else {
      res.json({'unix': unix, 'utc': utc.toUTCString()});
  }
});

module.exports = router;
