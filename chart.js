var margin = {top: 40, right: 100, bottom: 70, left: 150},
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], .55);

var x = d3.scale.linear()
    //.rangeRoundBands([0, width]);
    .rangeRound([10, width-10], 0.02 );
    //.domain([0, 100]);

var color = d3.scale.ordinal()

    .range([ '#99372e', '#f99e97','#515b6e','#8d97aa','#E6E6E6']);
    //.range([ '#99372e', '#d25c4d','#77a5c5','#b4cad6','#f2eee6']);
    //.range(['#f2eee6', '#b4cad6', '#77a5c5', '#c35b4f', '#99372e']);
    //.range(['#99372e', '#b9615f', '#a59bb6', '#c4c5d3', '#f2eee6']);
    //.range(['#99372e', '#be5966', '#979aba', '#bebfd0', '#e6e6e6']);
   // .range(['#99372e', '#c05b68', '#9d9eb9', '#c7c5cf', '#f2eee6']);
    //.range(["A2ACBF",'99B2BF', '99BFB9', 'BF9F99', 'F2EEE6'])
    //.range(["b33040", "#d25c4d", "#f2b447", "#d9d574", "#a4a5a5"]);
    //.range(["#99372E", "#BF9F99", "#BFB999", "#99B2BF", "#E6E6E6"]);
    //.range(['#f2eee6', '#b4cad6', '#77a5c5', '#c35c44', '#99372e']);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .innerTickSize(-height+45)
    .outerTickSize(0)
    .tickPadding(5)
    .ticks(5)
    .tickFormat(function(d) {
        if (d < 0) {
            return d * -1+"%"
        }
        else {
            return d+"%"}
    });

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var widthValue = width + margin.left + margin.right
var heightValue = height + margin.top + margin.bottom

var svg = d3.select("#figure").append("svg")
    .attr("viewBox", `0 0 ${widthValue} ${heightValue}`)
    .attr("id", "d3-plot")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    color.domain(["реальный срок", "условный срок", "штраф", "примирение/декриминализация", "данные изъяты"]);
    d3.csv("data_p.csv", function(error, data) {

  data.forEach(function(d) {

    d["реальный срок"] = +d[1]*100/d.N;
    d["условный срок"] = +d[2]*100/d.N;
    d["штраф"] = +d[3]*100/d.N;
    d["примирение/декриминализация"] = +d[4]*100/d.N;
    d["данные изъяты"] = +d[5]*100/d.N;
    var x0 = -1*(d["реальный срок"]);
    var idx = 0;

    d.boxes = color.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1]}; })
  });


  var min_val = d3.min(data, function(d) {
          return d.boxes["0"].x0;
          });

  //var max_val = d3.max(data, function(d) {
          //return d.boxes["4"].x1;
          //});

  x.domain([min_val, 100]).nice();
  y.domain(data.map(function(d) { return d.stat; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height - margin.bottom+50})`)
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      //.attr("transform", `translate(0,-50)`)
      .call(yAxis);

  var vakken = svg.selectAll(".stat")
      .data(data)
    .enter().append("g")
      .attr("class", "bar")
      .attr("transform", function(d) { return "translate(0," + y(d.stat) + ")"; })
      .on("mouseover", function(d) {
        svg.selectAll('.y').selectAll('text').filter(function(text) { return text===d.stat; })
            .transition().duration(100).style('font','18px Proto Grotesk');
      })
      .on("mouseout", function(d) {
        svg.selectAll('.y').selectAll('text').filter(function(text) { return text===d.stat; })
            .transition().duration(100).style('font','15px Proto Grotesk');
      });

  var bars = vakken.selectAll("rect")
      .data(function(d) { return d.boxes; })
    .enter().append("g").attr("class", "subbar")
      .on("mousemove", function(d) {
        d3.select(this).style('opacity', 0.8);

        div.transition()
            .duration(10)
            .style("opacity", 1);
        div.html((d.n/d.N*100).toFixed(0)+"%")
            .style("left",(event.pageX-20)+"px")
            .style("top", (event.pageY-25)+"px")
            .style('font','9px Proto Grotesk');
      })

      .on('mouseout', function(d) {
          d3.select(this).style('opacity', 1);
          div.transition()
              .duration(0)
              .style("opacity", 0);

    });

  bars.append("rect")
      .attr("height", y.rangeBand()+"px")
      .attr("x", function(d) { return x(d.x0); })
      .attr("width", function(d) { return x(d.x1) - x(d.x0)+"px"; })
      .style("fill", function(d) { return color(d.name); })


  vakken.insert("rect",":first-child")
      .attr("height", y.rangeBand())
      .attr("x", "1")
      .attr("width", width)
      .attr("fill-opacity", "0")
      .style("fill", "#F5F5F5")
      .attr("class", function(d,index) { return index%2==0 ? "even" : "uneven"; });

  svg.append("g")
      .attr("class", "y axis")
  .append("line")
      .attr("transform", `translate(0,0)`)
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y2", height);

  var startp = svg.append("g").attr("class", "legendbox").attr("id", "mylegendbox");

  var legend_tabs = [0, 130, 257, 335, 573];
  var legend = startp.selectAll(".legend")
      .data(color.domain().slice())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + legend_tabs[i] + ",-25)"; });

  legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);


  legend.append("text")
      .attr("x", 22)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "begin")
      .style("font" ,"13px Proto Grotesk")
      .text(function(d) { return d; });



d3.selectAll(".axis path")
      .style("fill", "none")
      .style("stroke", "none")
      .style("shape-rendering", "crispEdges")


  var movesize = width/2 - startp.node().getBBox().width/2;
  d3.selectAll(".legendbox").attr("transform", "translate(" + movesize  + ",0)");


});