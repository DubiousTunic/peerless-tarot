const express = require('express')
const app = express()
const port = 3000

//4chan tripcode generator
const tripcode = require('tripcode');

//sanitization and validation
const { check, validationResult } = require('express-validator');
//decodes from validator
const he = require('he');

//other handlers
const path = require('path')
const bodyParser= require('body-parser')


app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// Express Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

/*
  this is the only db, it is local and lists readers in this format:
  readers { 
    "tripcode" {
      sequence : "initiatorSequence",
      hail : "peerSequence"        
    },
    "tripcode2" { etc.
  }
*/
var readers = {};

/*
  After 5 minutes of inactivity delete reader tripcode from db
*/
app.post("/ping", function(req,res){
  resetTimer();
  res.end();
})

function resetTimer(trips){
  var reader = readers[trips]
  clearTimeout(reader.timer);
  reader.timer = setTimeout(function(){
    delete readers[trips];
  }, 300000)
}


//server responses in order of client operations

/*
  An Oracle initiates a data-channel
  Signal "sequence" saved to oracle tripcode in :readers
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
    res.json({tripcode : trips});
})

/*
  Peer retrieves sequence from initial Oracle; 
  sequence entered on Peer clientside
*/
app.get("/sequence/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  var tripcode = he.decode(req.params.tripcode);
  
  console.log("TRIPCODE: " + tripcode);

  res.json({sequence : JSON.stringify(readers[tripcode].sequence)});
})

/*
  Oracle sequence posted to peer client; 
  magick established; 
  final sequence for Oracle generated, saved to .hail property of :readers.tripcode
  (so to get the Peer response sequence in your Oracle it's readers.tripcode.hail)
  The hail property is longpolled by the Oracle after initiate is called from the client
*/
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

/*
  Oracle longpolls for Peer response sequence, stored in :readers[tripcode].hail
*/
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
  Connection established, remove tripcode from :readers
*/
app.post("/established/:tripcode", [check("tripcode").not().isEmpty().trim().escape()], function(req,res){
  const errors = validationResult(req);
   if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  var trips = tripcode(he.decode(req.params.tripcode));
  if(readers[trips]){
    delete readers[trips];
  }
  res.end();
})

/*
  #peer view on clientside calls this
  generates a list of Oracles (as tripcodes) from :readers
*/
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

