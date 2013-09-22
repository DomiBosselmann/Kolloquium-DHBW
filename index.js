var requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
var cancelRequestAnimFrame = window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame;

var charts = {
	crime : {
		init : function () {
			//alert("hello world");
			
			//var slide = document.getElementById("SACrime");
			Reveal.addEventListener("slidechanged", this.start.bind(this));
		},
		start : function () {
			var self = this;
			
			this.svg = d3.select("#crime");
			
			this.data = [200, 500, 800];
			
			this.xRange = d3.scale.linear().range([0, 1200]).domain([0,this.data.length - 1]);
			this.yRange = d3.scale.linear().range([0, 700]).domain([0, 800]);
			this.xAxis = d3.svg.axis().scale(this.xRange).tickSubdivide(0).tickSize(9,6,2).tickPadding(8).orient("bottom");
			this.yAxis = d3.svg.axis().scale(this.yRange).ticks(3).tickSubdivide(1).tickSize(9, 6, 2).orient("left");
			
			var xAxis = this.svg.append("svg:g");
			var yAxis = this.svg.append("svg:g");
			
			xAxis.call(this.xAxis);
			yAxis.call(this.yAxis);
			
			
			this.svg.selectAll("rect").data(this.data).enter().append("rect").attr("y", 700).attr("height", function (d) {
				return 0;
			}).attr("width", 200).attr("fill", "green").attr("x", function (d, i) {
				return 210 * i;
			}).transition().duration(12550).delay(function (d, i) {
				return i * 300;
			}).attr("height", function (d) {
				return self.yRange(d);
			}).attr("y", function (d, i) {
				console.log(700 - self.yRange(d));
				return 700 - self.yRange(d);
			});
			
			//alert("immer weiter");
			window.setTimeout(this.showSouthAfricaPrivate.bind(this), 12550);
		},
		showSouthAfricaPrivate : function () {
			//alert("boah, jetzt wirds aber verboten");
			
			var self = this;
			
			this.data.push(8000);
			this.yRange = this.yRange.domain([0, 8000]);
			
			this.svg.selectAll("rect").data(this.data).transition().duration(12550).delay(function (d, i) {
				return i * 300;
			}).attr("height", function (d) {
				return self.yRange(d);
			}).attr("y", function (d, i) {
				return 700 - self.yRange(d);
			});
			
			this.svg.selectAll("rect").data(this.data).enter().append("rect").attr("y", 700).attr("height", function (d) {
				return 0;
			}).attr("width", 200).attr("fill", "green").attr("x", function (d, i) {
				return 210 * i;
			}).transition().duration(12550).delay(function (d, i) {
				return i * 300;
			}).attr("height", function (d) {
				return self.yRange(d);
			}).attr("y", function (d, i) {
				return 700 - self.yRange(d);
			});
		}
	},
	audio : {
		SMOOTHING : 0.8,
		FFT_SIZE : 1024,
		WIDTH : 1800,
		HEIGHT : 1080,
		INDEXH : 2,
		EPSILON : 3,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				if (this.context) {
					this.stop();
				}
				
				return;
			}
			
			var self = this;
						
			this.cancelDraw = false;
			
			this.context = new window.AudioContext();
			this.analyser = this.context.createAnalyser();
			
			this.analyser.minDecibels = -140;
			this.analyser.maxDecibels = -50;
			this.analyser.smoothingTimeConstant = this.SMOOTHING;
			this.analyser.fftSize = this.FFT_SIZE;
			
			this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
			this.times = new Uint8Array(this.analyser.frequencyBinCount);
			
			
			// Not showing vendor prefixes.
			navigator.mozGetUserMedia({video: false, audio: true}, function(audioStream) {
				
				self.audioStream = audioStream;
				self.microphone = self.context.createMediaStreamSource(audioStream);
				
				// microphone -> filter -> destination.
				self.microphone.connect(self.analyser);
				
				self.animationFrame = requestAnimFrame(self.draw.bind(self));
			}, function (e) {
				console.log('Reeeejected!', e);
			});
			
			
			
			
			
			this.svg = d3.select("#audio");
			this.path = this.svg.append("path").attr("stroke-width", "2").attr("stroke", "red").attr("fill", "none");
			this.xRange = d3.scale.linear().range([0, this.WIDTH]).domain([0, this.analyser.frequencyBinCount]);
			this.yRange = d3.scale.linear().range([0, this.HEIGHT]).domain([0, 256]);
			this.colorRange = d3.scale.linear().range([0, 359]).domain([0, this.analyser.frequencyBinCount]);
			this.lineFunction = d3.svg.line()
				.x(function(d, i) {
					return this.xRange(i);
				}.bind(this))
				.y(function(d) {
					return this.yRange(d);
				}.bind(this));
			
			/*VisualizerSample.prototype.getFrequencyValue = function(freq) {
			  var nyquist = context.sampleRate/2;
			  var index = Math.round(freq/nyquist * this.freqs.length);
			  return this.freqs[index];
			}*/
		},
		draw : function () {
			
			
			// Get the frequency data from the currently playing music
			this.analyser.getByteFrequencyData(this.freqs);
			this.analyser.getByteTimeDomainData(this.times);
			
			var highest = function (data) {
				var grouped = [];
				var lastIndex;
				var sum = 0;
				
				for (var j = 0; j < data.length; j = j + 15) {
					for (var k = 0; k < 16; k++) {
						sum += data[j + k];
					}
					grouped.push(sum);
					sum = 0;
				}
				
				console.log(grouped[0], grouped[3],grouped[5]);
				
				var max = 0, i;
				
				for (var j = 0; j < grouped.length; j++) {
					if (grouped[j] > max) {
						max = grouped[j];
						i = j;
					}
				}
				
				return i;
			}
			
			var lowpass = function (data) {
				var filteredData = new Uint8Array(this.analyser.frequencyBinCount);
				
				for (var i = 0; i < data.length; i++) {
					filteredData[i] = Math.abs(128 - data[i]) < this.EPSILON ? 128 : data[i];
				}
				
				return filteredData;
			}
									
			this.path.attr("d", this.lineFunction(lowpass.call(this, this.times))).attr("stroke", function () {
				return "hsl(" + this.colorRange(d3.mean(this.freqs)) + ", 100%, 50%)";
			}.bind(this));
			
			this.animationFrame = !this.cancelDraw ? requestAnimFrame(this.draw.bind(this)) : null;
		},
		stop : function () {
			this.audioStream.stop();
			this.cancelDraw = true;
			this.path.remove();
		}
	},
	mobileSensors : {
		INDEXH : 4,
		init : function () {
			alert("doch");
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			alert("ja");
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			this.canvas = d3.select("#mobileSensors > ul");
			this.data = ["GPS", "Beschleunigungssensor", "Gyroskop", "Mikrofon", "Frontkamera", "Rückkamera"];
			
			this.list = canvas.selectAll("li").data(data).enter().append("li").text(function (d) { return d; });
			
			Reveal.addEventListener("fragmentshown", this.plopp.bind(this));
		},
		plopp : function (event) {
			debugger;
		},
		stop : function (event) {
			
		}
	},
	resultsUshahidi : {
		INDEXH : 3,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
						
			this.data = [
				{
					name : "Uchaguzi (Kenia)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 100 }, 
						{ axis: "Meldungen via SMS", value: 87.5 },  
						{ axis: "Verifizierte Meldungen", value: 64.8 }
					]
				},
				{
					name : "www.reclaimnaija.net (Nigeria)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 2.75 },
						{ axis: "Anzahl Meldungen pro Tag", value: 0 }, 
						{ axis: "Verifizierte Meldungen", value: 0.2 }
					]
				},
				{
					name : "Ghana Votes 2012 (Ghana)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 6.52 }, 
						{ axis: "Meldungen via SMS", value: 11.3 },  
						{ axis: "Verifizierte Meldungen", value: 85.2 }
					]
				},
				{
					name : "Syria Tracker (Syrien)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 3.47 }, 
						{ axis: "Meldungen via SMS", value: 0 },  
						{ axis: "Verifizierte Meldungen", value: 98.4 }
					]
				}
			];
					
			
			this.container = d3.select("#resultsUshahidi > div");
			
			var enter = this.container.selectAll("div").data(this.data).enter();
			var chartContainers = enter.append("div").classed("multipleStarPlots", true);
			var charts = chartContainers.append("svg").attr("width", 300).attr("height", 300);
			chartContainers.append("p").text(function (d) {
				return d.name;
			});
						
			chartContainers.each(function (d, i, e) {
				RadarChart.draw(d3.select(this), [d.data], { w: 300, h: 300 });
			});
			
			// 
		},
		stop : function () {
			
		}
	}
}

Reveal.addEventListener( 'ready', function( event ) {
	charts.crime.init.call(charts.crime);
	charts.audio.init.call(charts.audio);
	charts.mobileSensors.init.call(charts.mobileSensors);
	charts.resultsUshahidi.init.call(charts.resultsUshahidi);
});