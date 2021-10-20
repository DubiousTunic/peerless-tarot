$(document).ready(function(){
  $(".cards").hide();
  $("#incoming").hide();
  $(".draw").hide();
  $(".query").hide();
  $(".query_submission").hide();
  $("#awaiting_query").hide();
  $("#discovered_query").hide();
  $(".connection").hide();
  $("#awaiting").hide();
  $("#connected").hide()
  $(".interpretation").hide();
  $(".final").hide();

ANCHOR.load();

//damned

function assembleSpread(threeThreeThree){
  console.log("HERE");
  $("#data_1").show();
  console.log(threeThreeThree);
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[0]))).clone().appendTo($("#data_1 #key_2"));
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[1]))).clone().appendTo($("#data_1 #key_1"));
  $("#tarot_" + Math.abs(parseInt(threeThreeThree[2]))).clone().appendTo($("#data_1 #key_3"));

  console.log(Math.abs(threeThreeThree[0]) + " " + Math.abs(threeThreeThree[1]) + " " + Math.abs(threeThreeThree[2]))

  if(threeThreeThree[0] < 0){
   $("#data_1 #key_2").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[0])).attr("class") + "</class>");
   flip($(".data #tarot_" + Math.abs(threeThreeThree[0])));
  }
  else{
    $("#data_1 #key_2").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[0])).attr("class") + "</class>");
  }
  $("#data_1 #key_2").fadeIn(1000);
  if(threeThreeThree[1] < 0){
    $("#data_1 #key_1").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[1])).attr("class") + "</class>");
    flip($(".data #tarot_" + Math.abs(threeThreeThree[1])));
  }
  else{
    $("#data_1 #key_1").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[1])).attr("class") + "</class>");
  }
  $("#data_1 #key_1").fadeIn(2000);
  if(threeThreeThree[2] < 0){
    $("#data_1 #key_3").append("<span class='title'>" + "-" + $("#tarot_" + Math.abs(threeThreeThree[2])).attr("class") + "</class>");
    flip($(".data #tarot_" + Math.abs(threeThreeThree[2])));
  }
  else{    
   $("#data_1 #key_3").append("<span class='title'>" + $("#tarot_" + Math.abs(threeThreeThree[2])).attr("class") + "</class>");
  }
  $("#data_1 #key_3").fadeIn(3000);


  $("#data_1 #key_1").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $("#data_1 #key_2").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $("#data_1 #key_3").css({'transform' : 'rotate('+ (Math.floor(Math.random() * 8) - 8) +'deg)'})
  $(".interpretation").fadeIn(777);
  $(".final").show();
}

function flip(id){
  id.css({"transform": "scaleY(-1)"})
}

var p;

$("form").submit(function(e){
  e.preventDefault();
  p = new SimplePeer({ 
    initiator: true,
    config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
    trickle: false,
    reconnectTimer: 100,
    iceTransportPolicy: 'relay',
  })

  var tripcode = $("#tripcode").val();
  p.on('connect', () => {
    console.log('CONNECT')
    $("#awaiting").hide();
    $("#connected").show();
    $(".query_submission").fadeIn()
    $("#awaiting_query").fadeIn();
    $(".draw").fadeIn(777);

    $(".draw").click(function(e){
      e.preventDefault();
      $(".interpretation").empty();
      $(".key").empty();
      threeThreeThreeSpread(function(err, result){
        console.log(result);
        var threeThreeThree = result;
        assembleSpread(threeThreeThree);
        p.send(JSON.stringify(threeThreeThree));
      });
      //and then 
    })
  })

  $(".interpretation").change(function(){
    p.send($(".interpretation").val());
  })

  p.on('data', data => {
    console.log('data: ' + data)
    $(".query_submission").fadeIn(1337);
    $("#awaiting_query").fadeOut(777);
    $("#discovered_query").fadeIn();
    $("#query_submission").text(data);
  })

  p.on('signal', data => {
  console.log(data)
  //document.querySelector('#outgoing').textContent = JSON.stringify(data)
   //list #uuid

   $.post("/initiate", {sequence : JSON.stringify(data), trips : encodeURIComponent(tripcode)}, function(data){
      $(".connection").show();
      $("#awaiting").fadeIn();
      var interval = setInterval(function(){
        $.get("/hail/" + encodeURIComponent(tripcode), function(data){
          if(data){            
            p.signal(JSON.parse(data.sequence));
            clearInterval(interval); 
          }
        })
      },3333)
      getReaders();
    })   

    
  })

  p.on('error', err => console.log('error', err))

})

/*
document.querySelector('form').addEventListener('submit', ev => {
  ev.preventDefault()
  p.signal(JSON.parse(document.querySelector('#incoming').value))
})
*/

$(".peer").click(function(e){
  e.preventDefault();
  $(".oracles").fadeIn(2000);
})

setInterval(function(){
  getReaders();
}, 10000)

getReaders();

function getReaders(){
  $.get("/readers", function(data){
    $(".readers").empty();
    if(!data.tripcodes){
      return;
    }
    data.tripcodes.forEach(function(tripcode){
      var li = document.createElement("li");

      $(li).append("<a class='magick' href='#magick?tripcode=" + escape(tripcode) + "'>" + tripcode + "</a>");
      //li != law ACOLYTE
      $(".readers").append(li);
      $(".magick").click(function(e){
        e.preventDefault();
        //retrieve sequence
        $("#oracles").hide();
        var tripcode = encodeURIComponent($(this).text());
        $.get("/sequence/" + tripcode, function(data){
          //send signal
          p = new SimplePeer({
            initiator : false,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },
            trickle : false,
            reconnectTimer: 100,
            iceTransportPolicy: 'relay',
          })


          p.signal(JSON.parse(data.sequence));

          var sequence = data.sequence;
          p.on('signal', data=>{

            console.log("MAGICK SIGNAL SENT");
            $.post("/magick", {sequence : JSON.stringify(data), tripcode : encodeURIComponent(tripcode)}, function(data){
              console.log("MAGICK SIGNAL SUCCESS");
              
            })
          })

          p.on('connect', () => {
            console.log('CONNECT')   
            $(".query").fadeIn(333);

              $("#query").click(function(e){
                e.preventDefault();
                console.log($(".query input").val())
                var query = $(".query input").val();
                p.send(query);
              })         
          })

          p.on('data', data => {
            console.log('data: ' + data)
            var arr; 
            try{
              //data is an array
              arr = JSON.parse(data);
              assembleSpread(arr);
            }
            catch(e){
              //data is an oracle
              $(".final span").text(data);
            }
          })

          p.on('error', err => console.log('error', err))



        })
      })
    })
  })
}

function encodeStr(rawStr){
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
   return '&#'+i.charCodeAt(0)+';';
  });
} 

//TODO: check when someone leaves the channel
})
