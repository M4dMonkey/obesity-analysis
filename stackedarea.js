

// draw new chart
var duration = 1000;
function parseData(d, idx, columns){
  for (var i = 1, n = columns.length; i< n; ++i){
    d[columns[i]] = parseFloat(d[columns[i]]);
  }
  return d;
}

function addFakedColumn(data){
  data.forEach(function(element){
    element.fakedCol = 0;
  });
  data.columns.push("fakedCol");
}

var xScale;

function bothSex(data_male, data_female){
  var columns = data_male.columns;
  var data_both_sex = [];
  data_both_sex["columns"] = columns;
  for (var i=0; i < data_male.length; ++i){
    data_both_sex[i] = {};
    data_both_sex[i]["years"] = data_male[i]["years"];
    columns.slice(1).forEach(function(e){
      m = data_male[i][e];
      f = data_female[i][e];
      avg = (m + f) / 2;
      data_both_sex[i][e] = avg;
    });
  }
  return data_both_sex;
}

var currentSex = "both";
var currentdataPrefix = "main";
var color = d3.scaleOrdinal().range(d3.schemeCategory20);

var detailed = false;
var clickedData = null;

d3.queue()
  .defer(d3.csv, "main_male.csv", parseData)
  .defer(d3.csv, "main_female.csv", parseData)
  .defer(d3.csv, "normal_male.csv", parseData)
  .defer(d3.csv, "normal_female.csv", parseData)
  .defer(d3.csv, "overweight_male.csv", parseData)
  .defer(d3.csv, "overweight_female.csv", parseData)
  .defer(d3.csv, "obesity_g1_male.csv", parseData)
  .defer(d3.csv, "obesity_g1_female.csv", parseData)
  .defer(d3.csv, "obesity_g2_male.csv", parseData)
  .defer(d3.csv, "obesity_g2_female.csv", parseData)
  .defer(d3.csv, "obesity_g3_male.csv", parseData)
  .defer(d3.csv, "obesity_g3_female.csv", parseData)
  .await(function(error, mm, mf, nm, nf, owm, owf, og1m, og1f, og2m, og2f, og3m, og3f){

    // add a faked column for main data
    addFakedColumn(mm);
    addFakedColumn(mf);

    var dataset = {
      "main_male": mm,
      "main_female": mf,
      "normal_male": nm,
      "normal_female": nf,
      "overweight_male": owm,
      "overweight_female": owf,
      "obesity_g1_male": og1m,
      "obesity_g1_female": og1f,
      "obesity_g2_male": og2m,
      "obesity_g2_female": og2f,
      "obesity_g3_male": og3m,
      "obesity_g3_female": og3f
    };
    console.log(dataset);

    var svg = d3.select("#interact-stack-area svg");
    var margin = {
      top: 120,
      right: 300,
      bottom: 50,
      left: 50
    };

    var drawWidth = svg.attr("width") - margin.left - margin.right,
    drawHeight = svg.attr("height") - margin.top - margin.bottom;

    var x = d3.scalePoint().range([0, drawWidth]);
    var y = d3.scaleLinear().range([drawHeight, 0]);
    x.domain(["1988-1994", "1999-2002", "2003-2006", "2007-2010", "2011-2014"]);
    y.domain([0, 1.0]);

    var drawG = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = drawG.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", "translate(0," + drawHeight+ ")")
      .call(d3.axisBottom(x).ticks(5));

    var yAxis = drawG.append("g")
      .attr("class", "axis axis-y")
      .call(d3.axisLeft(y).ticks(10, "%"));

    // draw init chart
    var stack = d3.stack();
    var dataToDraw = returnDataToDraw(dataset, currentSex, currentdataPrefix);
    var keys = dataToDraw.columns.slice(1)
    stack.keys(keys);

    var layer = drawG.selectAll(".layer").data(stack(dataToDraw));
    var enterLayer = layer.enter().append("g").attr("class", "layer");
    var path = enterLayer.append("path")
      .style("opacity", 1e-6)
      .style("fill", "white");


    var layerArea = d3.area()
      .x(function(d,i){
        var ret = x(d.data.years);
        // console.log(ret);
        return ret;
      })
      .y0(function(d){
        var ret = y(d[0]);
        // console.log(ret);
        return ret;
      })
      .y1(function(d){
        var ret = y(d[1]);

        return ret;
      });

    path.transition()
      .attr("class", "area")
      .style("fill", function(d){
        return color(d.index);
      })
      .duration(duration)
      .style("opacity", 1)
      .attr("d", layerArea);

// init indicator
    var rectH = 20;
    var rectW = 50;
    for (var i = 0; i < keys.length; i++) {
      var indicator = drawG.append("g").attr("class", "indicator");
      var rect = indicator.append("rect")
        .attr("x", drawWidth + 20)
        .attr("y", function(d) {
          return  i * (rectH + 5);
        })
        .attr("width", rectW)
        .attr("height", rectH)
        .style("fill", function() {
          return color(i);
        });

      var text = indicator.append("text")
        .text(keys[i])
        .attr("x", drawWidth + 20 + rectW + 3)
        .attr("y", function(d) {
          return  i * (rectH + 5) + 10;
        })
        .attr("dy", "0.35em")
        .style("font-size", "10pt");
      if(keys[i] == "fakedCol"){
        indicator.attr("visibility", "hidden");
      }

    }
// end init indicator

// init title

var titleGroup = svg.append("g")
  .attr("transform", "translate(80, 100)");

var titleText = titleGroup.append("text")
  .attr("id", "graph-title")
  .text("Normal weight, overweight, and obesity among adults: United States, selected years 1988-1994 through 2011-2014 (both sexes)");


// end init title

// sex choice btn groups --------------------------------------------
    {var btnGroup = svg.append("g")
      .attr("transform", "translate(30, 20)");

    var male = svg.append("g")
      .attr("class", "btn");

    male.append("rect")
      .attr("x", 10)
      .attr("y", 10)
      .attr("width", 50)
      .attr("height", 50)
      .style("fill", "steelblue")
      .attr("rx", 10)
      .attr("ry", 10)
      .style("stroke","black")
      .style("stroke-width", 2)
      .style("opacity", 0.5);
    male.append("text")
      .attr("x", 10 + 25)
      .attr("y", 10+25)
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .text("Male");
    male.on("mouseover", function(d){
      d3.select(this).style("opacity", 0.7);
    });
    male.on("mouseout", function(d){
      d3.select(this).style("opacity", 1);
    });

    male.on("click", function(d){
      console.log("click");
      currentSex = "male";
      updatePath(dataset, drawG);
    });

    var female = svg.append("g")
      .attr("class", "btn");
    female.append("rect")
      .attr("x", 70)
      .attr("y", 10)
      .attr("width", 50)
      .attr("height", 50)
      .style("fill", "steelblue")
      .attr("rx", 10)
      .attr("ry", 10)
      .style("stroke","black")
      .style("stroke-width", 2)
      .style("opacity", 0.5);
    female.append("text")
      .attr("x", 70 + 25)
      .attr("y", 10 + 25)
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .text("Female");
    female.on("mouseover", function(d){
      d3.select(this).style("opacity", 0.7);
    });
    female.on("mouseout", function(d){
      d3.select(this).style("opacity", 1);
    });
    female.on("click", function(d){
      console.log("click");
      currentSex = "female";
      updatePath(dataset, drawG);
    });

    var both = svg.append("g")
      .attr("class", "btn");
    both.append("rect")
      .attr("x", 70+60)
      .attr("y", 10)
      .attr("width", 50)
      .attr("height", 50)
      .style("fill", "steelblue")
      .attr("rx", 10)
      .attr("ry", 10)
      .style("stroke","black")
      .style("stroke-width", 2)
      .style("opacity", 0.5);
    both.append("text")
      .attr("x", 70 + 25 + 60)
      .attr("y", 10 + 25)
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .text("Both");
    both.on("mouseover", function(d){
      d3.select(this).style("opacity", 0.7);
    });
    both.on("mouseout", function(d){
      d3.select(this).style("opacity", 1);
    });
    both.on("click", function(d){
      console.log("click");
      currentSex = "both";
      updatePath(dataset, drawG);
    });

    var back = svg.append("g")
      .attr("class", "btn");
    back.append("rect")
      .attr("x",  drawWidth)
      .attr("y", 10)
      .attr("width", 50)
      .attr("height", 50)
      .style("fill", "gray")
      .attr("rx", 10)
      .attr("ry", 10)
      .style("stroke","black")
      .style("stroke-width", 2)
      .style("opacity", 0.5);
    back.append("text")
      .attr("x", 25 +drawWidth)
      .attr("y", 10 + 25)
      .style("fill", "black")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .text("Back");
    back.on("mouseover", function(d){
      d3.select(this).style("opacity", 0.7);
    });
    back.on("mouseout", function(d){
      d3.select(this).style("opacity", 1);
    });
    back.on("click", function(d){
      console.log("click");
      if(detailed){
        detailed = false;
        updatePath(dataset, drawG);
      }
      else {
        if(currentdataPrefix != "main"){
        currentdataPrefix = "main";
        updatePath(dataset, drawG);
        }
      }

    });
  }



// sex choice btn groups end-----------------------------------------

// set path click listener
    

    path.on("mouseout", function() {
      d3.select(this).style("opacity", 1);
    });
    path.on("mouseover", function(d) {
      d3.select(this).style("opacity", 0.7);
    });
    path.on("click", function(data){
      console.log("clickeddata");
      console.log(data);
      if (currentdataPrefix == "main"){
        currentdataPrefix = data.key;
        clickedData = data;
        updatePath(dataset, drawG);
      }
      else{
        detailed = true;
        clickedData = data;
        updatePath(dataset, drawG);
      }
      
    });


    function updatePath(_dataset, svgGroup){
      var stack = d3.stack();
      var dataToDraw = returnDataToDraw(_dataset, currentSex, currentdataPrefix);
      var keys = dataToDraw.columns.slice(1)
      stack.keys(keys);

      var path = svgGroup.selectAll(".layer path").data(stack(dataToDraw));

      var detailedArea = d3.area()
        .x(function(d, i){
          return x(d.data.years);
        })
        .y0(function(d, i){
          return y(0);
        })
        .y1(function(d, i, layerData){

          if (clickedData.index == layerData.index){
            return y(d[1] - d[0]);
          }
          return y(0);
        });


      if (detailed){
        path.transition().duration(duration).attr("d", detailedArea);
      }
      else{
        path.transition().duration(duration).attr("d", layerArea);
      }

      updateIndicator(keys, svgGroup);
      updateGraphTitle();
    }

    function updateIndicator(_keys, _svgGroup){
      var indicator = _svgGroup.selectAll(".indicator")
        .attr("visibility", function(d, i){
          if(_keys[i] == "fakedCol"){
            return "hidden";
          }else{
            return "visible";
          }
        });

      var text = _svgGroup.selectAll(".indicator text")
        .text(function(d, i){
          return _keys[i];
        });
    }

    function updateGraphTitle(){
      console.log(clickedData);
      var titleText;
      if(clickedData == null){
        titleText = getDisplayText(null, currentSex, currentdataPrefix, detailed);
      }else{
        titleText = getDisplayText(clickedData.key, currentSex, currentdataPrefix, detailed);
      }
      
      var titleBox = d3.selectAll("#graph-title");
      titleBox.text(titleText);
    }

  });



function getDisplayText(_key, _currentSex, _currentdataPrefix, _detailed){
  var textsForDisplay = {
    "main": "Normal weight, overweight, and obesity among adults: United States, selected years 1988-1994 through 2011-2014 ",
    "normal" : "Normal weight",
    "overweight" : "Over weight",
    "obesity_g1" : "Grade1 Obesity",
    "obesity_g2" : "Grade2 Obesity",
    "obesity_g3" : "Grade3 Obesity",
    "20-over" : "20 and over",
    "both" : "(both sex)",
    "male" : "(male)",
    "female": "(female)"
  };

  var baseStr = "<Type> among adults aged <Age-Range> by age group: United States, selected years 1988-1994 through 2011-2014 <Sex>";

  if (_currentdataPrefix =="main"){
    return textsForDisplay["main"] + textsForDisplay[_currentSex];
  }
  if (_detailed){
    var rtStr = baseStr;
    rtStr = rtStr.replace("<Type>", textsForDisplay[_currentdataPrefix]);
    rtStr = rtStr.replace("<Age-Range>", textsForDisplay[_key]);
    rtStr = rtStr.replace("<Sex>", textsForDisplay[_currentSex]);
    return rtStr;
  }else{
    var rtStr = baseStr;
    rtStr = rtStr.replace("<Type>", textsForDisplay[_currentdataPrefix]);
    rtStr = rtStr.replace("<Age-Range>", textsForDisplay["20-over"]);
    rtStr = rtStr.replace("<Sex>", textsForDisplay[_currentSex]);
    return rtStr;
  }

}


function returnDataToDraw(dataset, sex, prefix){
  switch(sex){
    case "both":
      var d_male = dataset[prefix+"_male"];
      var d_female = dataset[prefix+"_female"];
      return bothSex(d_male, d_female);
    case "male":
      return dataset[prefix+"_male"];
    case "female":
      return dataset[prefix+"_female"];
  }
}


