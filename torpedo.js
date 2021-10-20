const express = require('express')
const redis = require('redis');
const app = express()
const tripcode = require('tripcode');
const path = require('path')
const { check, validationResult } = require('express-validator');
const port = 3000
const bodyParser= require('body-parser')
const he = require('he');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

const client = redis.createClient();

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

var readers = {};

function resetTimer(trips){
  var reader = readers[trips]
  clearTimeout(reader.timer);
  reader.timer = setTimeout(function(){
    delete readers[trips];
  }, 300000)
}


/*
  A reader initiates a data-channel
  Request sequence saved in redis db
*/
app.post("/initiate", [check("trips").not().isEmpty().trim().escape(), check("sequence").not().isEmpty().custom(value => {
    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  }).trim().escape()], function(req,res){
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var trips = tripcode(he.decode(req.body.trips));
    console.log(trips);
    readers[trips] = {};
    readers[trips].sequence = JSON.parse(he.decode(req.body.sequence));
    resetTimer(trips); 
    res.end();
})

app.get("/hail/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var trips = tripcode(he.decode(req.params.tripcode));
  if(readers[trips] && readers[trips].hail){
    res.json({sequence : JSON.stringify(readers[trips].hail)});
  }
  else{
    res.end();
  }
})

/*
  A querent joins a data-channel
  Multiple querents can join a data-channel (by God I hope this is true)
*/
app.post("/acolyte", [check("trips").not().isEmpty().trim().escape()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
})

app.post("/magick", [check("tripcode").not().isEmpty().trim().escape(), check("sequence").not().isEmpty().custom(value => {
    try {
      JSON.parse(value);
    } catch (e) {
      return false;
    }
    return true;
  }).trim().escape()], function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //wat
    var tripcode = decodeURIComponent(decodeURIComponent(req.body.tripcode));
    console.log("TRIPCODE :" + tripcode);
    console.log(readers[tripcode])
    readers[tripcode].hail = JSON.parse(he.decode(req.body.sequence));
    res.end();
})


app.get("/sequence/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var tripcode = he.decode(req.params.tripcode);
  
  console.log("TRIPCODE: " + tripcode);

  res.json({sequence : JSON.stringify(readers[tripcode].sequence)});
})

app.get("/readers", function(req,res){
  console.log(Object.keys(readers));
  res.json({tripcodes : Object.keys(readers) });
})


app.all('*', (req, res) => {
  res.sendFile(__dirname + '/public/thought.html')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

