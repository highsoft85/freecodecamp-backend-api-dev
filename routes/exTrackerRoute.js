const express = require("express");
const mongoose = require('mongoose');
const shortid = require('shortid');

const router = express.Router();

// Connect Mongo DB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/exercise-track', {
//	useNewUrlParser: true,
//	useUnifiedTopology: true,
});

// Import Mongo DB Atlas models
const User = require('../models/user');
const Exercise = require('../models/exercise');

//* Endpoints
/*
 * GET
 * Get all users
 */
router.get('/users', async function (req, res) {
	console.log('### get all users ###'.toLocaleUpperCase());
  try{
    const data = await User.find();
    res.status(200).json(data);
  } catch (error){
    res.status(500).json(error)
  }
});

/*
 * POST
 * Create a new user
 */
router.post('/users', async function (req, res) {
	// Get username input into form
  const inputUsername = req.body.username;
  console.log("input username:", inputUsername);

  // Check to see if the username has already been entered
  try{
    const data = await User.findOne({username: inputUsername});
    if (!data) { // If username is not stored yet, create and save a User object
      const newUser = new User({username: inputUsername});
  
      // Save the user
      const result = await newUser.save();

      // Remove the key-value pair associated with the key __v
      const reducedData = {
        "username": result.username, 
        "_id": result._id
      };
      res.json(reducedData);
    } else { // If username is already stored, send a message to the user
      res.send(`Username ${inputUsername} already exists.`);
    }
  } catch (error){
    res.status(500).json(error)
  }
});

// PATH /api/users/:_id/exercises
// POST: Store new exercise in the Exercise model 
router.post('/users/:_id/exercises', async (req, res) => {
  // Get data from form
  const userID = req.body[":_id"] || req.params._id;
  const descriptionEntered = req.body.description;
  const durationEntered = req.body.duration;
  const dateEntered = req.body.date;

  // Print statement for debugging
  console.log(userID, descriptionEntered, durationEntered, dateEntered);

  // Make sure the user has entered in an id, a description, and a duration
  // Set the date entered to now if the date is not entered
  if (!userID) {
    res.json("Path `userID` is required.");
    return;
  }
  if (!descriptionEntered) {
    res.json("Path `description` is required.");
    return;
  }
  if (!durationEntered) {
    res.json("Path `duration` is required.");
    return;
  }

  try {
    // Check if user ID is in the User model
    const user = await User.findOne({"_id": userID});
    const usernameMatch = user.username;
      
    // Create an Exercise object
    const newExercise = new Exercise({
      username: usernameMatch,
      description: descriptionEntered,
      duration: durationEntered
    });

    // Set the date of the Exercise object if the date was entered
    if (dateEntered) {
      newExercise.date = dateEntered;
    }
    
    // Save the exercise
    const exercise = await newExercise.save();
    console.log(exercise);
    const exerciseObject = {
      "_id": userID,
      "username": exercise.username,
      "date": exercise.date.toDateString(),
      "duration": exercise.duration,
      "description": exercise.description
    };

    // Send JSON object to the response
    res.json(exerciseObject);
  } catch(error) {
    res.status(500).json(error);
  }
});

// PATH /api/users/:_id/logs?[from][&to][&limit]
router.get('/api/users/:_id/logs', (req, res) => {
  const id = req.body["_id"] || req.params._id;
  var fromDate = req.query.from;
  var toDate = req.query.to;
  var limit = req.query.limit;

  console.log(id, fromDate, toDate, limit);

  // Validate the query parameters
  if (fromDate) {
    fromDate = new Date(fromDate);
    if (fromDate == "Invalid Date") {
      res.json("Invalid Date Entered");
      return;
    }
  }

  if (toDate) {
    toDate = new Date(toDate);
    if (toDate == "Invalid Date") {
      res.json("Invalid Date Entered");
      return;
    }
  }

  if (limit) {
    limit = new Number(limit);
    if (isNaN(limit)) {
      res.json("Invalid Limit Entered");
      return;
    }
  }

  // Get the user's information
  User.findOne({ "_id" : id }, (error, data) => {
    if (error) {
      res.json("Invalid UserID");
      return console.log(error);
    }
    if (!data) {
      res.json("Invalid UserID");
    } else {

      // Initialize the object to be returned
      const usernameFound = data.username;
      var objToReturn = { "_id" : id, "username" : usernameFound };

      // Initialize filters for the count() and find() methods
      var findFilter = { "username" : usernameFound };
      var dateFilter = {};

      // Add to and from keys to the object if available
      // Add date limits to the date filter to be used in the find() method on the Exercise model
      if (fromDate) {
        objToReturn["from"] = fromDate.toDateString();
        dateFilter["$gte"] = fromDate;
        if (toDate) {
          objToReturn["to"] = toDate.toDateString();
          dateFilter["$lt"] = toDate;
        } else {
          dateFilter["$lt"] = Date.now();
        }
      }

      if (toDate) {
        objToReturn["to"] = toDate.toDateString();
        dateFilter["$lt"] = toDate;
        dateFilter["$gte"] = new Date("1960-01-01");
      }

      // Add dateFilter to findFilter if either date is provided
      if (toDate || fromDate) {
        findFilter.date = dateFilter;
      }

      // console.log(findFilter);
      // console.log(dateFilter);

      // Add the count entered or find the count between dates
      Exercise.count(findFilter, (error, data) => {
        if (error) {
          res.json("Invalid Date Entered");
          return console.log(error);
        }
        // Add the count key 
        var count = data;
        if (limit && limit < count) {
          count = limit;
        }
        objToReturn["count"] = count;


        // Find the exercises and add a log key linked to an array of exercises
        Exercise.find(findFilter, (error, data) => {
          if (error) return console.log(error);

          // console.log(data);

          var logArray = [];
          var objectSubset = {};
          var count = 0;

          // Iterate through data array for description, duration, and date keys
          data.forEach(function(val) {
            count += 1;
            if (!limit || count <= limit) {
              objectSubset = {};
              objectSubset.description = val.description;
              objectSubset.duration = val.duration;
              objectSubset.date = val.date.toDateString();
              console.log(objectSubset);
              logArray.push(objectSubset);
            }
          });

          // Add the log array of objects to the object to return
          objToReturn["log"] = logArray;

          // Return the completed JSON object
          res.json(objToReturn);
        });

      });

    }
  });
});

// ----------------
// ADDITIONAL PATHS (not required for the FreeCodeCamp project)

// PATH /api/exercises/
// Display all of the exercises in the Mongo DB model titled Exercise
router.get('/api/exercises', (req, res) => {
  Exercise.find({}, (error, data) => {
    if (error) return console.log(error);
    res.json(data);
  })
});

module.exports = router;