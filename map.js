var height = 450,
    width = 800;
var svg = d3.select("#map")
    .append("svg")
    .attr("height", height)
    .attr("width", width);


var svg2 = d3.select("#map2")
    .append("svg")
    .attr("height", height)
    .attr("width", width);
var svg3 = d3.select("#detail").attr("height", 500)
    .attr("width", 500);

var textGroup = svg3.append("g").attr("transform", "translate(100, 100)");
var bubble = textGroup.append("text").attr("id", "bubble").style("font-size", "20px");
// bubble.append("tspan").attr("dy", "1.6em").attr("x", 0).attr("id", "bubble-line1");
// bubble.append("tspan").attr("dy", "2.2em").attr("x", 0).attr("id", "bubble-line2");
// bubble.append("tspan").attr("dy", "1.2em").attr("x", 0).attr("id", "bubble-line3");

var projection = d3.geoEquirectangular()
    .translate([width / 2, height / 2])
    .scale(120);

var path = d3.geoPath()
    .projection(projection);
var countries;
var obesity;
var countryCode;
var femaleData;
var year = 1975;
var colorScale1;
var colorScale2;
var label = ['<10', '10~19', '20~29', '30~39', '40~49', '>50']
var sequentialF = ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f']

var sequentialM = ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#2b8cbe']

var sequentialColorsF = ['#fef0d9', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f']

var sequentialColorsM = ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#2b8cbe']

$('#yearslider').on('change', function(event) {
    var a = event.value.newValue;
    var b = event.value.oldValue;

    var changed = !($.inArray(a[0], b) !== -1 &&
        $.inArray(a[1], b) !== -1 &&
        $.inArray(b[0], a) !== -1 &&
        $.inArray(b[1], a) !== -1 &&
        a.length === b.length);

    if (changed) {
        year = a;
        //console.log(year)
        showMap(svg, colorScale1, year, femaleData);
        showMap(svg2, colorScale2, year, maleData);

    }
});

d3.queue()
    .defer(d3.json, "world-50m.json")
    .defer(d3.csv, "female.csv")
    .defer(d3.csv, "male.csv")
    .defer(d3.csv, "mapcode.csv")
    .await(function(error, map, female, male, mapcode) {

        countries = topojson.feature(map, map.objects.countries);
        countryCode = d3.map(mapcode, function(d) {
            return d.countrycode;
        })

        femaleData = d3.map(female, function(d) {
            return d.country;
        })

        maleData = d3.map(male, function(d) {
            return d.country;
        })


        colorScale1 = d3.scaleThreshold().domain([1, 10, 20, 30, 40, 50]).range(sequentialColorsF);
        showMap(svg, colorScale1, year, femaleData);
        colorScale2 = d3.scaleThreshold().domain([1, 10, 20, 30, 40, 50]).range(sequentialColorsM);
        showMap(svg2, colorScale2, year, maleData);
    });

function showMap(svg, colorScale, year, data) {

    var paths = svg.selectAll("path.country").data(countries.features);
    paths.enter().append("path").attr("class", "country")
        .merge(paths)
        .attr("d", function(countries) {
            return path(countries);
        })
        .style("fill", function(countries) {
            if (countryCode.has(countries.id)) {
                var countryName = countryCode.get(countries.id).name;
                // console.log(countryName)
                if (data == femaleData) {
                    if (femaleData.has(countryName)) {

                        var femaleGivenCountry = femaleData.get(countryName);
                        if (femaleGivenCountry[year] != null) {
                            var res = femaleGivenCountry[year].split(" ");

                            return colorScale(res[0]);
                        }
                    }
                } else if (data == maleData) {

                    if (maleData.has(countryName)) {
                        var maleGivenCountry = maleData.get(countryName);

                        if (maleGivenCountry[year] != null) {
                            var res = maleGivenCountry[year].split(" ");
                            // console.log(res[0])//prevalence % for men    
                            return colorScale(res[0]);
                        }
                    }
                }

            }
        })
        //                .on("mouseover", function (d) { d3.select(this).attr("stroke","#000000")
        //                .attr("stroke-width",3);       
        //                })
        .on("mouseover", hover)


    .on("mouseout", function(d) {
        d3.select(this).attr("stroke", "#424242").attr("stroke-width", 0.5)
    })


    .attr("fill", "#fff")
        .attr("stroke", "#424242")
        .attr("stroke-width", 0.5);
}
var slider = new Slider("#yearslider", {
    ticks: [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2014],
    ticks_labels: ["1975", "1980", "1985", "1990", "1995", "2000", "2005", "2010", "2014"],
    ticks_snap_bounds: 30
});


// init indicator
var rectH = 20;
var rectW = 50;
var indicatorColor = d3.scaleThreshold().domain([1, 10, 20, 30, 40, 50]).range(sequentialF);
var indicatorColor2 = d3.scaleThreshold().domain([1, 10, 20, 30, 40, 50]).range(sequentialM);
var indicator1Svg = d3.select("#indicator1 svg");
var indicator2Svg = d3.select("#indicator2 svg");
indicator1Svg
    .attr("width", "120")
    .attr("height", "220");
indicator2Svg
    .attr("width", "120")
    .attr("height", "220");

var drawIndicator1 = indicator1Svg
    .append("g")
    .attr("transform", "translate(0,5)");
var drawIndicator2 = indicator2Svg
    .append("g")
    .attr("transform", "translate(0,5)");

var whiteRect1 = drawIndicator1.append("g");
var whiteRect2 = drawIndicator2.append("g");

whiteRect1.append("rect")
    .attr("x", 20)
    .attr("y", 0)
    .attr("width", rectW)
    .attr("height", rectH)
    .style("fill", "white");

whiteRect2.append("rect")
    .attr("x", 20)
    .attr("y", 0)
    .attr("width", rectW)
    .attr("height", rectH)
    .style("fill", "white");

whiteRect1.append("text")
    .text("no data")
    .attr("x", 20 + rectW + 3)
    .attr("y", rectH / 2)
    .attr("dy", "0.35em")
    .style("font-size", "10pt");

whiteRect2.append("text")
    .text("no data")
    .attr("x", 20 + rectW + 3)
    .attr("y", rectH / 2)
    .attr("dy", "0.35em")
    .style("font-size", "10pt");

for (var i = 0; i < 6; i++) {
    var g = drawIndicator1.append("g");
    var g2 = drawIndicator2.append("g");

    var rect = g.append("rect")
        .attr("x", 20)
        .attr("y", function(d) {
            return (i + 1) * (rectH + 5);
        })
        .attr("width", rectW)
        .attr("height", rectH)
        .style("fill", function() {
            return indicatorColor(i * 10);
            // return "red";
        });

    var rect2 = g2.append("rect")
        .attr("x", 20)
        .attr("y", function(d) {
            return (i + 1) * (rectH + 5);
        })
        .attr("width", rectW)
        .attr("height", rectH)
        .style("fill", function() {
            return indicatorColor2(i * 10);
        });

    var text = g.append("text")
        .text(label[i])
        .attr("x", 20 + rectW + 3)
        .attr("y", (i + 1) * (rectH + 5) + rectH / 2)
        .attr("dy", "0.35em")
        .style("font-size", "10pt");

    var text2 = g2.append("text")
        .text(label[i])
        .attr("x", 20 + rectW + 3)
        .attr("y", (i + 1) * (rectH + 5) + rectH / 2)
        .attr("dy", "0.35em")
        .style("font-size", "10pt");
}

var indicator_desc1 = drawIndicator1.append("g").append("text")
    .attr("x", 20)
    .attr("y", 7 * (rectH + 5) + rectH / 2)
    .attr("dy", "0.35em")
    .style("font-size", "10pt");
indicator_desc1.append("tspan").text("female obesity").attr("dy", ".6em").attr("x", 20);
indicator_desc1.append("tspan").text("prevalence rate").attr("dy", "1.2em").attr("x", 20);


var indicator_desc2 = drawIndicator2.append("g").append("text")
    .attr("x", 20)
    .attr("y", 7 * (rectH + 5) + rectH / 2)
    .style("font-size", "10pt");
indicator_desc2.append("tspan").text("male obesity").attr("dy", ".6em").attr("x", 20);
indicator_desc2.append("tspan").text("prevalence rate").attr("dy", "1.2em").attr("x", 20);



function hover(d) {
    var countryName = "null";
    if (countryCode.has(d.id)) {
        countryName = countryCode.get(d.id).name;
    }

    if (femaleData.has(countryName)) {

        var femaleGivenCountry = femaleData.get(countryName);
        if (femaleGivenCountry[year] != null) {
            var res = femaleGivenCountry[year].split(" ");

            var countrydataF = res[0];
        }
    }


    if (maleData.has(countryName)) {
        var maleGivenCountry = maleData.get(countryName);

        if (maleGivenCountry[year] != null) {
            var res = maleGivenCountry[year].split(" ");
            var countrydataM = res[0];
        }
    }

    d3.select("#bubble").text("Country Name: " + countryName + " | Year: " + year + " | Female Prevalence: " + countrydataF + " | Male Prevalence: " + countrydataM);
    // var tspan1 = d3.select("#bubble-line1").text("Country Name: " + countryName + "\n");
    // var tspan2 = d3.select("#bubble-line2").text("Year: " + year);
    // var tspan3 = d3.select("#bubble-line3").text("Female Prevalence: " + countrydataF);

}
