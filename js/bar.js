d3BarChart = function(layers, o) {
	var n = layers.length;
	var m = layers[0].length;
	var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); }),
	    yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });

	var x = d3.scale.ordinal()
	    .domain(d3.range(m))
	    .rangeRoundBands([0, o.width], .08);

	var y = d3.scale.linear()
	    .domain([0, yStackMax])
	    .range([o.height, 0]);

	var color = d3.scale.linear()
	    .domain([0, n - 1])
	    .range(["#F56FEA", "#556"]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .tickSize(0)
	    .tickPadding(6)
	    .orient("bottom");

	var svg = d3.select("#bar").append("svg")
	    .attr("width", o.width + o.margin.left + o.margin.right)
	    .attr("height", o.height + o.margin.top + o.margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + o.margin.left + "," + o.margin.top + ")");

	var layer = svg.selectAll(".layer")
	    .data(layers)
	  .enter().append("g")
	    .attr("class", "layer")
	    .style("fill", function(d, i) { return color(i); });

	var rect = layer.selectAll("rect")
	    .data(function(d) { return d; })
	  .enter().append("rect")
	    .attr("x", function(d) { return x(d.x); })
	    .attr("y", o.height)
	    .attr("width", x.rangeBand())
	    .attr("height", 0);

	rect.transition()
	    .delay(function(d, i) { return i * 10; })
	    .attr("y", function(d) { return y(d.y0 + d.y); })
	    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + o.height + ")")
	    .call(xAxis);

	d3.selectAll("input").on("change", change);

	var timeout = setTimeout(function() {
	  d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
	}, 2000);

	this.change = function(value) {
		if (value === "grouped") transitionGrouped();
	  	else transitionStacked();
	}

	function change() {
	  clearTimeout(timeout);
	  if (this.value === "grouped") transitionGrouped();
	  else transitionStacked();
	}

	function transitionGrouped() {
	  y.domain([0, yGroupMax]);

	  rect.transition()
	      .duration(500)
	      .delay(function(d, i) { return i * 10; })
	      .attr("x", function(d, i, j) { return x(d.x) + x.rangeBand() / n * j; })
	      .attr("width", x.rangeBand() / n)
	    .transition()
	      .attr("y", function(d) { return y(d.y); })
	      .attr("height", function(d) { return o.height - y(d.y); });
	}

	function transitionStacked() {
	  y.domain([0, yStackMax]);

	  rect.transition()
	      .duration(500)
	      .delay(function(d, i) { return i * 10; })
	      .attr("y", function(d) { return y(d.y0 + d.y); })
	      .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	    .transition()
	      .attr("x", function(d) { return x(d.x); })
	      .attr("width", x.rangeBand());
	}
}