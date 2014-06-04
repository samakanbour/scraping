document.addEventListener('DOMContentLoaded', function () {
	var key = "0AhtG6Yl2-hiRdFgxZk5iZjMzNVM0eEp1YTJKSTVtTXc"
	Tabletop.init({
		key: key,
		callback: showInfo,
		simpleSheet: true
	})
});

function showInfo(data) {
	$('form, article').fadeIn();
	var lineData = Sheetsee.makeArrayOfObject(Sheetsee.getOccurance(data, "artist"));
	var lineOptions = {
		units: "units",
		labels: "label",
		m: [0, 0, 0, 0],
		w: 960,
		h: 400,
		div: "#line",
		yaxis: "",
		hiColor: "#E4EB29"
	}
	Sheetsee.d3LineChart(lineData, lineOptions);
	var bubbleData = Sheetsee.makeArrayOfObject(Sheetsee.getOccurance(data, "genre"));
	for (var i in bubbleData) {
		bubbleData[i].label = bubbleData[i].label.toUpperCase();
	}
	Sheetsee.d3BubbleChart(bubbleData, {
		name: 'label',
		size: 'units',
		group: 'label',
		div: '#bubble'
	});
	var meta = [{}, {}];
	data.forEach(function (d) {
		if (d.sex == 'f') {
			if (d.rank in meta[0]) {
				meta[0][d.rank] += 1;
			} else {
				meta[0][d.rank] = 1;
			}
		} else if (d.sex == 'm') {
			if (d.rank in meta[1]) {
				meta[1][d.rank] += 1;
			} else {
				meta[1][d.rank] = 1;
			}
		} else {
			if (d.rank in meta[0]) {
				meta[0][d.rank] += 1;
				if (d.rank in meta[1]) {
					meta[1][d.rank] += 1;
				} else {
					meta[1][d.rank] = 1;
				}
			} else {
				meta[0][d.rank] = 1;
			}
		}
	});
	var females = [];
	var males = [];
	for (var i = 0; i < 20; i++) {
		females.push(0);
		males.push(0);
	}
	for (var i = 0; i < 100; i++) {
		if (meta[0][i]) {
			females[Math.floor(i / 5)] += meta[0][i];
		}
		if (meta[1][i]) {
			males[Math.floor(i / 5)] += meta[1][i];
		}
	}
	var lay = [females, males];
	var num = -1;
	var stack = d3.layout.stack(),
		layers = stack(d3.range(2).map(function () {
			num += 1;
			return bumpLayer(lay[num]);
		}));
	var bar = new d3BarChart(layers, {
		margin: {top: 20, right: 0, bottom: 20, left: 0},
		width: 980,
		height: 500
	});
	$('.radio').click(function() {
		$('#'+this.innerHTML)[0].checked = true;
		bar.change(this.innerHTML);
	});

	var matrixData = {nodes:[], links:[]};
	for (var d in data) {
		matrixData.nodes.push({name: data[d].track, group: data[d].artist, words: data[d].snippet.split(" ")});
		if (d == 90) {
			break;
		}
	}
	for (var i = 0; i < matrixData.nodes.length; i++) {
		for (var j = i; j < matrixData.nodes.length; j++) {
			var source = matrixData.nodes[i];
			var target = matrixData.nodes[j];
			var value = countCommonWords(source.words, target.words);
			value += countCommonWords(target.words, source.words);
			matrixData.links.push({source: i, target: j, value: value});
		}
	}
    d3Matrix(matrixData, {
		margin: {top: 250, right: 0, bottom: 10, left: 250},
		width: 980,
		height: 980
	});
}

function bumpLayer(a) {
	return a.map(function (d, i) {
		return {
			x: i,
			y: Math.max(0, d)
		};
	});
}

function countCommonWords(s1, s2) {
	if (s1.length == 0) {
		return 0;
	} else {
		if (s2.indexOf(s1[0]) != -1) {
			return 1 + countCommonWords(s1.splice(1), s2);
		} else {
			return countCommonWords(s1.splice(1), s2);
		}
	}
}