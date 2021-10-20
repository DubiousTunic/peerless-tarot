function threeThreeThreeSpread(cb){

	var arrDigits = [];
	//some quirk with quantum / tarot combination? 
	getData(arrDigits, function(err, data){

			//nonquantum upsidedown technically reverses structure of quantum computing

			var upsidedown = Math.floor(Math.random() * 2);
			
			if(upsidedown === 1){
				upsidedown = -1
			}
		
			if(upsidedown === -1){
				arrDigits.push(data * -1);
			}
			else{
				arrDigits.push(data);
			}
			console.log(arrDigits);
			getData(arrDigits, function(err, data){				
					var upsidedown = Math.floor(Math.random() * 2);
				
					if(upsidedown === 1){
						upsidedown = -1
					}

					if(upsidedown === -1){
						arrDigits.push(data * -1);
					}
					else{
						arrDigits.push(data);
					}
				    console.log(arrDigits);
	
					getData(arrDigits, function(err, data){						
							var upsidedown = Math.floor(Math.random() * 2);
					
							if(upsidedown === 1){
								upsidedown = -1
							}
							if(upsidedown === -1){
								arrDigits.push(data * -1);
							}
							else{
								arrDigits.push(data);
							}
						    console.log(arrDigits);
							cb(null, arrDigits);							
					});	
			});
		
	});
}

function getData(arrDigits, cb){
	$.get("https://qrng.anu.edu.au/API/jsonI.php?length=1&type=uint8&size=6", function(data){
		console.log("draw");
		var data2 = data.data[0];
		//console.log(data);

		//the reason the errors get produced is because the API gives numbers 1-255 without an option to minify the Set so we have to recursively call the fn until we get num 0-77
		if(Math.abs(data2) <= 77 && arrDigits.indexOf(Math.abs(data2)) === -1){	
			cb(null, data2);
		}
		else{			
			//so apparently this form of recursion causes an error?
			
			getData(arrDigits, cb);						
		}
	})
}	