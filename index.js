var requestAnimFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
var cancelRequestAnimFrame = window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame;
var getUserMedia = navigator.webkitGetUserMedia ? "webkitGetUserMedia" : "mozGetUserMedia";

var charts = {
	colors : ["#004c67","#310067","#670200","#196700"],
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
			
			this.xRange = d3.scale.linear().range([200, 710]).domain([0, 3]);
			this.yRange = d3.scale.linear().range([600, 30]).domain([0, 250000]);
			this.xAxis = d3.svg.axis().scale(this.xRange).tickSubdivide(0).tickSize(9,6,2).tickPadding(8).orient("top");
			this.yAxis = d3.svg.axis().scale(this.yRange).ticks(3).tickSubdivide(1).tickSize(9, 6, 2).orient("left");
			
			this.xAxisElement = this.svg.append("svg:g");
			this.yAxisElement = this.svg.append("svg:g").attr("transform", "translate(200,0)");
			
			this.xAxisElement.call(this.xAxis);
			this.yAxisElement.call(this.yAxis);
						
			
			this.svg.selectAll("rect").data(this.data).enter().append("rect").attr("fill", charts.colors[0]).attr("y", 600).attr("height", function (d) {
				return 0;
			}).attr("width", 150).attr("x", function (d, i) {
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
			}).attr("width", 150).attr("fill", charts.colors[1]).attr("x", function (d, i) {
				return self.xRange(i);
			}).transition().duration(3550).attr("height", function (d) {
				return 600 - self.yRange(d);
			}).attr("y", function (d, i) {
				return self.yRange(d);
			});
			
			self.yAxisElement.transition().duration(3550).call(self.yAxis);
			
			Reveal.removeEventListener("fragmentshown", charts.crime.showSouthAfricaPrivate);
			Reveal.addEventListener("fragmentshown", charts.crime.showSouthAfricaCompanies);
		},
		showSouthAfricaCompanies : function () {
			
			var self = charts.crime;
			
			var svg = d3.select("#crime_securitycompanies");
			
			var data = [1127, 9320];
			
			var xRange = d3.scale.linear().range([0, 340]).domain([0, 2]);
			var yRange = d3.scale.linear().range([600, 30]).domain([0, 10000]);
			var xAxis = d3.svg.axis().scale(xRange).tickSubdivide(0).tickSize(9,6,2).tickPadding(8).orient("top");
			var yAxis = d3.svg.axis().scale(yRange).ticks(3).tickSubdivide(1).tickSize(9, 6, 2).orient("right");
			
			var xAxisElement = svg.append("svg:g");
			var yAxisElement = svg.append("svg:g").attr("transform", "translate(320,0)");
			
			xAxisElement.call(xAxis);
			yAxisElement.call(yAxis);
						
			
			svg.selectAll("rect").data(data).enter().append("rect").attr("fill", function (d, i) {
				return charts.colors[i];
			}).attr("y", 600).attr("height", function (d) {
				return 0;
			}).attr("width", 150).attr("x", function (d, i) {
				return xRange(i);
			}).transition().duration(3550).attr("height", function (d) {
				return 600 - yRange(d);
			}).attr("y", function (d, i) {
				return yRange(d);
			});
			
			Reveal.removeEventListener("fragmentshown", charts.crime.showSouthAfricaCompanies);
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
				{ name : "Beschleunigungs-sensor", icon : "icon/gyroscope.svg" },
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
	},
	scenarioInformalSettlements : {
		INDEXH: 9,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			this.canvas = document.getElementById("map_canvas");
		
			var mapOptions = {
				center: new google.maps.LatLng(-25.714602550921747, 28.423822051525125),
				zoom: 18,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				disableDefaultUI: true,
				backgroundColor: "#cde9f3"
			};
			
			this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
			
			Reveal.addEventListener("fragmentshown", this.showScenarioDetails);
		},
		stop : function () {
			
		},
		showScenarioDetails : function () {
			var self = charts.scenarioInformalSettlements;
		
			var canvas = d3.select(self.canvas);
			canvas.transition().duration(1000).style("-webkit-transform", "rotateX(90deg) translateY(20%)");
			
			Reveal.removeEventListener("fragmentshown", charts.scenarioInformalSettlements.showScenarioDetails);
		}
	},
	unasableReports : {
		INDEXH: 10,
		init : function () {
			
			this.container = d3.select("#reports");
			this.images = this.container.selectAll("img");
			
			this.charts = [];
			var charts = this.charts;
			
			this.rawData = [];
			this.svgs = [];
			var rawData = this.rawData;
			var svgs = this.svgs;
			var self = this;
						
			this.images.each(function () {
				d3.select(this).on("load", function () {
					var container = d3.select(this.parentNode);
					var images = d3.select(this);
					var dimensions = images.node().getBoundingClientRect();
					var canvas = container.append("canvas").attr("width", dimensions.width).attr("height", dimensions.height);
					var context = canvas.node().getContext("2d");
					
					context.drawImage(images.node(), 0, 0, dimensions.width, dimensions.height);
					
					var origData = context.getImageData(0, 0, dimensions.width, dimensions.height).data;
					var brightness = [];
					
					for (var i = 0; i < origData.length; i = i + 4) {
						brightness.push(origData[i] * 0.2126 + origData[i + 1] * 0.7152 + origData[i + 2] * 0.0722);
					}
					
					canvas.remove();
										
					var xRange = d3.scale.linear().domain([0, 255]).range([0, dimensions.width]);
					var data = d3.layout.histogram().bins(xRange.ticks(255))(brightness);
					var yRange = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.y; })]).range([dimensions.height, 0]);
										
					var svg = container.append("svg").attr("width", dimensions.width).attr("height", dimensions.height);
					svg.selectAll("rect").data(data).enter().append("rect").attr("x", function (d) {
						return xRange(d.x)
					}).attr("y", function (d) {
						return yRange(d.y);
					}).attr("height", function (d) {
						return dimensions.height - yRange(d.y);
					}).attr("width", xRange(data[0].dx));
					
					charts.push({
						svg : svg,
						data : origData,
						dimensions : dimensions,
						xRange : xRange,
						yRange : yRange
					});
					
				}.bind(this));
			});
			
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			Reveal.addEventListener("fragmentshown", this.showColors);
		},
		stop : function () {
			
		},
		showColors : function () {
			debugger;
			var self = charts.unasableReports;
			var uniqueColors = [];
			
			for (var i = 0; i < self.charts.length; i++) {
				var colors = [];
				for (var j = 0; j < self.charts[i].data.length; j = j + 4) {
					var hue = 0;
					var max = d3.max([self.charts[i].data[j + 0], self.charts[i].data[j + 1], self.charts[i].data[j + 2]]);
					var min = d3.min([self.charts[i].data[j + 0], self.charts[i].data[j + 1], self.charts[i].data[j + 2]]);
					
					if (max === min) {
						hue = 0;
					} else if (max === self.charts[i].data[j + 0]) {
						hue = 60 * (self.charts[i].data[j + 1] - self.charts[i].data[j + 2]) / (max - min);
					} else if (max === self.charts[i].data[j + 1]) {
						hue = 60 * (2 + (self.charts[i].data[j + 2] - self.charts[i].data[j + 0]) / (max - min));
					} else if (max === self.charts[i].data[j + 2]) {
						hue = 60 * (4 + (self.charts[i].data[j + 0] - self.charts[i].data[j + 1]) / (max - min));
					}
					
					hue += hue < 0 ? 360 : 0;
					
					colors.push(hue);
				}
				
				//uniqueColors.push(colors);
				
				var xRange = self.charts[i].xRange.domain([0, 360]);
				var data = d3.layout.histogram().bins(xRange.ticks(360))(colors);
				var yRange = self.charts[i].yRange.domain([0, d3.max(data, function(d) { return d.y; })]);
				
				self.charts[i].svg.selectAll("rect").data(data).transition().duration(1000).attr("x", function (d) {
					return xRange(d.x)
				}).attr("y", function (d) {
					return yRange(d.y);
				}).attr("height", function (d) {
					return self.charts[i].dimensions.height - yRange(d.y);
				}).attr("width", xRange(data[0].dx));
			}
			
			Reveal.addEventListener("fragmentshown", self.showColors);
		}
	},
	activityRecognition : {
		INDEXH: 11,
		init : function () {
			Reveal.addEventListener("slidechanged", this.start.bind(this));
			this.start.call(this, event);
		},
		start : function (event) {
			if (event.indexh !== this.INDEXH) {
				this.stop();				
				return;
			}
			
			this.svg = d3.select("#accelerometer");
			
			var dimensions = this.svg.node().getBoundingClientRect();
			
			this.width = dimensions.width;
			this.height = dimensions.height;
			
			
			this.data = [
			[-0.46309182,-0.7627395,-0.88532263,-0.6946377,-0.9942854,-1.3075534,-1.3756552,-1.4165162,-1.334794,-1.920469,-1.7570249,-2.3018389,-2.3699405,-2.152015,-2.2609777,-2.3018389,-1.9477097,-1.9885708,-1.920469,-1.1441092,-1.1441092,-1.1849703,-0.9942854,-1.1441092,-0.38136974,-0.61291564,0.10896278,0.3405087,-0.08172209,0.27240697,0.84446156,0.46309182,-0.14982383,0.3405087,0.50395286,0.50395286,1.334794,0.27240697,0.50395286,0.50395286,0.3405087,0.42223078,-0.23154591,-0.38136974,-0.42223078,-0.42223078],
			[9.697687,9.847511,9.847511,9.765789,9.847511,9.80665,9.847511,9.997335,9.956474,9.956474,9.888372,9.915613,9.956474,9.956474,9.956474,9.888372,9.847511,9.888372,9.888372,10.038197,10.18802,10.18802,9.997335,9.697687,9.575105,9.466142,9.656827,9.384419,9.697687,9.615966,9.80665,9.466142,9.384419,9.507003,9.656827,9.847511,9.847511,9.915613,9.956474,10.119919,10.337844,10.310603,10.337844,10.119919,9.765789,9.915613],
			[1.9885708,1.7570249,2.1111538,1.9885708,1.525479,1.8387469,1.7570249,1.7978859,1.9885708,1.879608,1.525479,1.8387469,1.4982382,1.6480621,1.4982382,1.607201,1.334794,1.2666923,1.607201,1.3756552,1.4165162,1.879608,1.56634,1.879608,2.1383946,1.6889231,1.56634,1.3075534,1.9477097,1.920469,1.920469,1.6480621,1.879608,2.4516625,2.1111538,2.8330324,2.4925237,2.4108016,2.1383946,2.4108016,2.0294318,2.070293,2.2609777,1.4573772,1.9477097,2.4516625]
			];
						
			var max = d3.max(this.data, function (d) {
				return d3.max(d);
			});
			
			var min = d3.min(this.data, function (d) {
				return d3.min(d);
			});
			
			if (Math.abs(min) > Math.abs(max)) {
				this.totalMax = Math.abs(min);
			} else {
				this.totalMax = Math.abs(max);
			}
			
			this.totalMin = - this.totalMax; 
			
			this.data = [
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			];
			
						
			
			this.xRange = d3.scale.linear().range([60, this.width - 10]).domain([0, this.data[0].length]);
			this.yRange = d3.scale.linear().range([this.height - 10, 10]).domain([this.totalMin, this.totalMax]);
			this.xAxisElement = this.svg.append("g");
			this.yAxisElement = this.svg.append("g");
			this.lineFunction = d3.svg.line()
				.x(function(d, i) {
					return this.xRange(i);
				}.bind(this))
				.y(function(d) {
					return this.yRange(d);
				}.bind(this));
			this.areaFunction = d3.svg.area()
				.x(function(d, i) {
					return this.xRange(i);
				}.bind(this))
				.y0(function (d) {
					return this.height / 2;
				}.bind(this))
				.y1(function(d) {
					return this.yRange(d);
				}.bind(this));
				
			var colors = ["green", "blue", "red"];
				
			this.path = this.svg.selectAll("path").data(this.data).enter().append("path").attr("stroke-width", "2").attr("stroke", function (d, i) {
				return colors[i];
			}).attr("fill", "rgba(0, 128, 0, 0)").attr("d", this.lineFunction).classed("data", true);
			
			this.data = [
			[-0.46309182,-0.7627395,-0.88532263,-0.6946377,-0.9942854,-1.3075534,-1.3756552,-1.4165162,-1.334794,-1.920469,-1.7570249,-2.3018389,-2.3699405,-2.152015,-2.2609777,-2.3018389,-1.9477097,-1.9885708,-1.920469,-1.1441092,-1.1441092,-1.1849703,-0.9942854,-1.1441092,-0.38136974,-0.61291564,0.10896278,0.3405087,-0.08172209,0.27240697,0.84446156,0.46309182,-0.14982383,0.3405087,0.50395286,0.50395286,1.334794,0.27240697,0.50395286,0.50395286,0.3405087,0.42223078,-0.23154591,-0.38136974,-0.42223078,-0.42223078],
			[9.697687,9.847511,9.847511,9.765789,9.847511,9.80665,9.847511,9.997335,9.956474,9.956474,9.888372,9.915613,9.956474,9.956474,9.956474,9.888372,9.847511,9.888372,9.888372,10.038197,10.18802,10.18802,9.997335,9.697687,9.575105,9.466142,9.656827,9.384419,9.697687,9.615966,9.80665,9.466142,9.384419,9.507003,9.656827,9.847511,9.847511,9.915613,9.956474,10.119919,10.337844,10.310603,10.337844,10.119919,9.765789,9.915613],
			[1.9885708,1.7570249,2.1111538,1.9885708,1.525479,1.8387469,1.7570249,1.7978859,1.9885708,1.879608,1.525479,1.8387469,1.4982382,1.6480621,1.4982382,1.607201,1.334794,1.2666923,1.607201,1.3756552,1.4165162,1.879608,1.56634,1.879608,2.1383946,1.6889231,1.56634,1.3075534,1.9477097,1.920469,1.920469,1.6480621,1.879608,2.4516625,2.1111538,2.8330324,2.4925237,2.4108016,2.1383946,2.4108016,2.0294318,2.070293,2.2609777,1.4573772,1.9477097,2.4516625]
			];

			
			this.svg.selectAll("path.data").data(this.data).transition().duration(1500).attr("d", this.lineFunction);
			
			
			this.xAxisElement.attr("transform", "translate(" + 0 + "," + (this.height / 2 - 1) + ")");
			this.yAxisElement.attr("transform", "translate(" + 60 + "," + (0) + ")");
		
			// Setup Axis
			this.xAxis = d3.svg.axis().scale(this.xRange).orient("bottom").tickSubdivide(0).tickSize(9, 6, 2).tickPadding(8);
			this.yAxis = d3.svg.axis().scale(this.yRange).orient("left").tickSubdivide(0).tickSize(9, 6, 2).tickPadding(8);
		
			this.xAxisElement.call(this.xAxis);
			this.yAxisElement.call(this.yAxis);

			Reveal.addEventListener("fragmentshown", this.showIntegral);
		},
		stop : function () {
			
		},
		showIntegral : function () {
			var self = charts.activityRecognition;
			
			var data = self.data.slice(0, 1);
						
			self.svg.selectAll("path.data").data(data).exit().transition().duration(1000).attr("stroke", "#cde9f3");
			self.svg.selectAll("path.data").data(data).classed("focus", true).transition().delay(1000).duration(1000).attr("d", self.areaFunction).attr("fill", "rgba(0, 128, 0, 1)");
			
			Reveal.removeEventListener("fragmentshown", self.showIntegral);
			Reveal.addEventListener("fragmentshown", self.showDoppelIntegral);
		},
		showDoppelIntegral : function () {
			var self = charts.activityRecognition;
			
			var origData = self.data.slice(0, 1)[0];
			var data = [];
			
			origData.forEach(function (value, i) {
				data.push(numerics.integrate(origData, 0, i));
			});
			
			data[0] = 0;
			
			data = [data];
			
			
			var max = d3.max(data, function (d) {
				return d3.max(d);
			});
			
			var min = d3.min(data, function (d) {
				return d3.min(d);
			});
			
			if (Math.abs(min) > Math.abs(max)) {
				var totalMax = Math.abs(min);
			} else {
				var totalMax = Math.abs(max);
			}
			
			var totalMin = - totalMax; 
						
			self.xRange = self.xRange.domain([0, self.data[0].length]);
			self.yRange = self.yRange.domain([totalMin, totalMax]);
			
			self.xAxisElement.transition().duration(1000).call(self.xAxis);
			self.yAxisElement.transition().duration(1000).call(self.yAxis);
			
			self.svg.selectAll("path.data.focus").data(data).transition().delay(1000).duration(1000).attr("d", self.areaFunction);
			
			Reveal.removeEventListener("fragmentshown", self.showDoppelIntegral);
		}
	}
}

var numerics = {
	calcFirstDerivation : function (a, b, c, d, e) {
		// a & b in the past
		// c current
		// d & e in the future
		
		if (b === undefined) {
			return (- 0.5 * e + 2 * d - 1.5 * c) / 3;
		}
		
		if (d === undefined) {
			return (1.5 * c - 2 * b + 0.5 * a) / 3;
		}
		
		return (0.2 * e + 0.1 * d - 0.1 * b - 0.2 * a) / 5;
	},
	integrate : function (y, start, end, scale) {
		start = start || 0;
		end = end || y.length - 1;
		
		scale = scale || 1;
		
		var n = end - start;
		var sum = 0;
		
		if (n === 0) {
			return sum;
		}
		
		if (n % 2 === 1) {
			sum += numerics.integrateViaTrapez(y, end - 1, end);
			sum += numerics.integrateViaSimpson(y, start, end - 1);
		} else {
			sum += numerics.integrateViaSimpson(y, start, end);
		}
		
		return sum / scale;
	},
	integrateViaSimpson : function (y, start, end) {
		var sum = 0;
		var h = 2;
		var n = end - start;
		var i = start;
		var a = 0;
		var b = 0;
		var c;
		
		if (n % 2 === 1) {
			throw new RangeError("Can't be integrated, because the range is not gerade.");
		}
		
		if (n === 0) {
			return 0;
		}
		
		c = y[start] + y[end];
		
		for (; i < end; i = i + h) {
			a += y[i + 0.5 * h];
			b += i === end - h ? 0 : y[i + h];
		}
		
		sum += c / 2 + 2 * a + b;
					
		return sum * h / 3;
	},
	integrateViaTrapez : function (y, start, end) {
		var sum;
		var h = 1;
		var n = end - start;
		var i = start;
		var a = y[start] + y[end];
		var b = 0;
		
		for (; i < end - h; i = i + h) {
			b += y[i + h];
		}
		
		sum = a / 2 + b;
		
		return sum * h;
	}
}

Reveal.addEventListener( 'ready', function( event ) {
	charts.unasableReports.init.call(charts.unasableReports);
	charts.crime.init.call(charts.crime);
	charts.journey.init.call(charts.journey);
	charts.audio.init.call(charts.audio);
	charts.mobileSensors.init.call(charts.mobileSensors);
	charts.resultsUshahidi.init.call(charts.resultsUshahidi);
	charts.picnic.init.call(charts.picnic);
	charts.scenarioInformalSettlements.init.call(charts.scenarioInformalSettlements);
	charts.activityRecognition.init.call(charts.activityRecognition);
});