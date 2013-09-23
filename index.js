var requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
var cancelRequestAnimFrame = window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame;
var getUserMedia = navigator.webkitGetUserMedia ? "webkitGetUserMedia" : "mozGetUserMedia";

var charts = {
	journey : {
		INDEXH: 1,
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
			
			d3.select("#journeyimages").transition().duration(60000).ease("linear").style("margin-left", "-3043px");
		},
		stop : function () {
			
		},
		nextImage : function () {
				
		}
	},
	crime : {
		INDEXH: 2,
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
			
			this.svg = d3.select("#crime");
			
			this.data = [220000, 240000];
			
			this.xRange = d3.scale.linear().range([200, 900]).domain([0, 3]);
			this.yRange = d3.scale.linear().range([600, 0]).domain([0, 250000]);
			this.xAxis = d3.svg.axis().scale(this.xRange).tickSubdivide(0).tickSize(9,6,2).tickPadding(8).orient("top");
			this.yAxis = d3.svg.axis().scale(this.yRange).ticks(3).tickSubdivide(1).tickSize(9, 6, 2).orient("left");
			
			this.xAxisElement = this.svg.append("svg:g");
			this.yAxisElement = this.svg.append("svg:g").attr("transform", "translate(200,0)");
			
			this.xAxisElement.call(this.xAxis);
			this.yAxisElement.call(this.yAxis);
						
			
			this.svg.selectAll("rect").data(this.data).enter().append("rect").attr("y", 600).attr("height", function (d) {
				return 0;
			}).attr("width", 200).attr("fill", "green").attr("x", function (d, i) {
				return self.xRange(i);
			}).transition().duration(3550).attr("height", function (d) {
				return 600 - self.yRange(d);
			}).attr("y", function (d, i) {
				return self.yRange(d);
			});
						
			Reveal.addEventListener("fragmentshown", this.showSouthAfricaPrivate);
		},
		showSouthAfricaPrivate : function () {
		
			var self = charts.crime;
			
			self.data.push(480000);
			self.yRange = self.yRange.domain([0, 500000]);
			
			self.svg.selectAll("rect").data(self.data).transition().duration(3550).attr("height", function (d) {
				return 600 - self.yRange(d);
			}).attr("y", function (d, i) {
				return self.yRange(d);
			});
			
			self.svg.selectAll("rect").data(self.data).enter().append("rect").attr("y", 600).attr("height", function (d) {
				return 0;
			}).attr("width", 200).attr("fill", "green").attr("x", function (d, i) {
				return self.xRange(i);
			}).transition().duration(3550).attr("height", function (d) {
				return 600 - self.yRange(d);
			}).attr("y", function (d, i) {
				return self.yRange(d);
			});
			
			self.yAxisElement.transition().duration(3550).call(self.yAxis);
			
			Reveal.removeEventListener("fragmentshown", charts.crime.showSouthAfricaPrivate);
		}
	},
	audio : {
		SMOOTHING : 0.8,
		FFT_SIZE : 1024,
		WIDTH : 1800,
		HEIGHT : 1080,
		INDEXH : 3,
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
			
			this.context = window.AudioContext ? (new window.AudioContext()) : new window.webkitAudioContext;
			this.analyser = this.context.createAnalyser();
			
			this.analyser.minDecibels = -140;
			this.analyser.maxDecibels = -50;
			this.analyser.smoothingTimeConstant = this.SMOOTHING;
			this.analyser.fftSize = this.FFT_SIZE;
			
			this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
			this.times = new Uint8Array(this.analyser.frequencyBinCount);
			
			
			// Not showing vendor prefixes.
			navigator[getUserMedia]({video: false, audio: true}, function(audioStream) {
				
				self.audioStream = audioStream;
				self.microphone = self.context.createMediaStreamSource(audioStream);
				
				// microphone -> filter -> destination.
				self.microphone.connect(self.analyser);
				
				self.animationFrame = requestAnimFrame(self.draw.bind(self));
			}, function (e) {
				console.log('Reeeejected!', e);
			});
			
			
			
			
			var dimensions = document.getElementById("audio").getBoundingClientRect();
			
			this.svg = d3.select("#audio");
			this.WIDTH = dimensions.width;
			this.HEIGHT = dimensions.height;
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
				return "hsl(" + this.colorRange(d3.mean(this.freqs)) + ", 70%, 40%)";
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
		INDEXH : 6,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			this.canvas = d3.select("#mobileSensors > ul");
			this.data = [
				{ name : "GPS", icon : "icon/gps.svg" },
				{ name : "Beschleunigungs-sensor", icon : "icon/gps.svg" },
				{ name : "Gyroskop", icon : "icon/gyroscope.svg" },
				{ name : "Mikrofon", icon : "icon/microphone.svg" },
				{ name : "Frontkamera", icon : "icon/camera.svg" },
				{ name : "Rückkamera", icon : "icon/camera.svg" },
				{ name : "3G", icon : "icon/gps.svg" }
			];
			
			this.scaleAngle = d3.scale.linear().domain([0, this.data.length]).range([-Math.PI / 2, Math.PI * 1.5]);
			
			this.list = this.canvas.selectAll("li").data(this.data).enter().append("li").style("left", function (d, i) {
				return Math.cos(this.scaleAngle(i)) * 400 + "px";
			}.bind(this)).style("top", function (d, i) {
				return Math.sin(this.scaleAngle(i)) * 330 + "px";
			}.bind(this));
						
			this.list.each(function (d) {
				var li = d3.select(this);
				li.append("img").attr("width", 40).attr("src", function (d) { return d.icon });
				li.append("p").text(function (d) { return d.name; });
			});
			
			Reveal.addEventListener("fragmentshown", this.plopp);
		},
		plopp : function (event) {
			d3.select("#iPhone").style("display", "none");
			d3.select("#Samsung").style("display", "block");
			
			charts.mobileSensors.list.transition().duration(500).delay(function (d, i) {
				return i * 150 + 700;
			}).style("top", "1800px");
			
			Reveal.removeEventListener("fragmentshown", charts.mobileSensors.plopp);
		},
		stop : function (event) {
			
		}
	},
	resultsUshahidi : {
		INDEXH : 5,
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
					],
					color : "#004c67"
				},
				{
					name : "www.reclaimnaija.net (Nigeria)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 2.75 },
						{ axis: "Anzahl Meldungen pro Tag", value: 0 }, 
						{ axis: "Verifizierte Meldungen", value: 0.2 }
					],
					color : "#310067"
				},
				{
					name : "Ghana Votes 2012 (Ghana)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 6.52 }, 
						{ axis: "Meldungen via SMS", value: 11.3 },  
						{ axis: "Verifizierte Meldungen", value: 85.2 }
					],
					color : "#670200"
				},
				{
					name : "Syria Tracker (Syrien)",
					data : [
						{ axis: "Anzahl Meldungen pro Tag", value: 3.47 }, 
						{ axis: "Meldungen via SMS", value: 0 },  
						{ axis: "Verifizierte Meldungen", value: 98.4 }
					],
					color : "#196700"
				}
			];
					
			
			this.container = d3.select("#resultsUshahidi > div");
			
			var enter = this.container.selectAll("div").data(this.data).enter();
			var chartContainers = enter.append("div").classed("multipleStarPlots", true);
			var charts = chartContainers.append("svg").attr("width", 300).attr("height", 300);
						
			chartContainers.each(function (d, i, e) {
				RadarChart.draw(d3.select(this), [d.data], { w: 300, h: 300, color : function () { return d.color } });
			});
			
			chartContainers.append("p").text(function (d) {
				return d.name;
			});
			
			// 
		},
		stop : function () {
			
		}
	},
	picnic : {
		INDEXH: 8,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			this.data = [{
				name : "Meine persönliche Sicherheit wird verbessert",
				data : [
					{ axis: "P", value: 1 },
					{ axis: "I", value: 0.1 },
					{ axis: "C", value: 0.1 },
					{ axis: "M", value: 1 }
				],
				color : "#004c67"
			}, {
				name : "Jemand bekommt Hilfe",
				data : [
					{ axis: "P", value: 1 },
					{ axis: "I", value: 0.1 },
					{ axis: "C", value: 0.1 },
					{ axis: "M", value: 1 }
				],
				color : "#310067"
			}, {
				name : "Misstände aufzeigen",
				data : [
					{ axis: "P", value: 0.8 },
					{ axis: "I", value: 0.1 },
					{ axis: "C", value: 0.1 },
					{ axis: "M", value: 0.5 }
				],
				color : "#670200"
			}];
			
			this.container = d3.select("#picnic > div");
			
			var enter = this.container.selectAll("div").data(this.data).enter();
			var chartContainers = enter.append("div").classed("multipleStarPlots", true);
			var charts = chartContainers.append("svg").attr("width", 300).attr("height", 300);						
			chartContainers.each(function (d, i, e) {
				RadarChart.draw(d3.select(this), [d.data], { w: 300, h: 300, color : function () { return d.color } });
			});
			
			chartContainers.append("p").text(function (d) {
				return d.name;
			});

		},
		stop : function () {
			
		}
	}
}

Reveal.addEventListener( 'ready', function( event ) {
	charts.crime.init.call(charts.crime);
	charts.journey.init.call(charts.journey);
	charts.audio.init.call(charts.audio);
	charts.mobileSensors.init.call(charts.mobileSensors);
	charts.resultsUshahidi.init.call(charts.resultsUshahidi);
	charts.picnic.init.call(charts.picnic);
});