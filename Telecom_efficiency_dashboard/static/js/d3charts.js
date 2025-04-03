<<<<<<< HEAD
// d3charts.js – Real D3 Rendering Logic

console.log("📊 D3 script loaded");

Promise.all([
  d3.json("/data"),
  d3.json("/ticket_counts"),
  d3.json("/monthly_trends")
]).then(([mainData, ticketData, trendData]) => {
  console.log("✅ Data loaded", { mainData, ticketData, trendData });
  renderCharts(mainData, ticketData, trendData);
}).catch(err => console.error("❌ Data load error:", err));

function renderCharts(mainData, ticketData, trendData) {
  const viewType = document.getElementById("viewType").value;
  const topN = document.getElementById("topN").value;
  const order = document.getElementById("orderType").value;

  const filtered = mainData.filter(d => d.type === viewType);
  const sorted = filtered.sort((a, b) => order === "top" ? b.change - a.change : a.change - b.change);
  const sliced = topN === "all" ? sorted : sorted.slice(0, +topN);

  renderEfficiencyChart(sliced);
  renderTicketChart(ticketData.filter(d => sliced.some(s => s.label === d.label)));
  renderTrendChart(trendData);
}

function renderEfficiencyChart(data) {
  const width = 800, height = 400;
  const margin = { top: 30, right: 20, bottom: 50, left: 200 };

  const svg = d3.select("#efficiencyChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.change)).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(Math.min(0, d.change)))
    .attr("y", d => y(d.label))
    .attr("width", d => Math.abs(x(d.change) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", d => d.change >= 0 ? "#2ecc71" : "#e74c3c");
}

function renderTicketChart(data) {
  const width = 800, height = 400;
  const margin = { top: 30, right: 20, bottom: 50, left: 200 };

  const svg = d3.select("#ticketShareChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d["2023"], d["2024"]))])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar2023")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.label))
    .attr("width", d => x(d["2023"]) - x(0))
    .attr("height", y.bandwidth() / 2)
    .attr("fill", "#3498db");

  svg.selectAll(".bar2024")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("width", d => x(d["2024"]) - x(0))
    .attr("height", y.bandwidth() / 2)
    .attr("fill", "#e67e22");
}

function renderTrendChart(trendData) {
  const width = 800, height = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const svg = d3.select("#trendChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const parseDate = d3.timeParse("%Y-%m");
  trendData.forEach(d => { d.date = parseDate(d.Month); });

  const x = d3.scaleTime()
    .domain(d3.extent(trendData, d => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trendData, d => Math.max(d["2023"], d["2024"]))]).nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.timeFormat("%b %y")))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  const line2023 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d["2023"]));

  const line2024 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d["2024"]));

  svg.append("path")
    .datum(trendData)
    .attr("fill", "none")
    .attr("stroke", "#2980b9")
    .attr("stroke-width", 2)
    .attr("d", line2023);

  svg.append("path")
    .datum(trendData)
    .attr("fill", "none")
    .attr("stroke", "#c0392b")
    .attr("stroke-width", 2)
    .attr("d", line2024);
}

// Dropdown listeners
["viewType", "topN", "orderType"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    Promise.all([
      d3.json("/data"),
      d3.json("/ticket_counts"),
      d3.json("/monthly_trends")
    ]).then(([mainData, ticketData, trendData]) => {
      renderCharts(mainData, ticketData, trendData);
    });
  });
});
=======
// d3charts.js – Real D3 Rendering Logic

console.log("📊 D3 script loaded");

Promise.all([
  d3.json("/data"),
  d3.json("/ticket_counts"),
  d3.json("/monthly_trends")
]).then(([mainData, ticketData, trendData]) => {
  console.log("✅ Data loaded", { mainData, ticketData, trendData });
  renderCharts(mainData, ticketData, trendData);
}).catch(err => console.error("❌ Data load error:", err));

function renderCharts(mainData, ticketData, trendData) {
  const viewType = document.getElementById("viewType").value;
  const topN = document.getElementById("topN").value;
  const order = document.getElementById("orderType").value;

  const filtered = mainData.filter(d => d.type === viewType);
  const sorted = filtered.sort((a, b) => order === "top" ? b.change - a.change : a.change - b.change);
  const sliced = topN === "all" ? sorted : sorted.slice(0, +topN);

  renderEfficiencyChart(sliced);
  renderTicketChart(ticketData.filter(d => sliced.some(s => s.label === d.label)));
  renderTrendChart(trendData);
}

function renderEfficiencyChart(data) {
  const width = 800, height = 400;
  const margin = { top: 30, right: 20, bottom: 50, left: 200 };

  const svg = d3.select("#efficiencyChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.change)).nice()
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", d => x(Math.min(0, d.change)))
    .attr("y", d => y(d.label))
    .attr("width", d => Math.abs(x(d.change) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", d => d.change >= 0 ? "#2ecc71" : "#e74c3c");
}

function renderTicketChart(data) {
  const width = 800, height = 400;
  const margin = { top: 30, right: 20, bottom: 50, left: 200 };

  const svg = d3.select("#ticketShareChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => Math.max(d["2023"], d["2024"]))])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([margin.top, height - margin.bottom])
    .padding(0.2);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  svg.selectAll(".bar2023")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.label))
    .attr("width", d => x(d["2023"]) - x(0))
    .attr("height", y.bandwidth() / 2)
    .attr("fill", "#3498db");

  svg.selectAll(".bar2024")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.label) + y.bandwidth() / 2)
    .attr("width", d => x(d["2024"]) - x(0))
    .attr("height", y.bandwidth() / 2)
    .attr("fill", "#e67e22");
}

function renderTrendChart(trendData) {
  const width = 800, height = 400;
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };

  const svg = d3.select("#trendChart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  const parseDate = d3.timeParse("%Y-%m");
  trendData.forEach(d => { d.date = parseDate(d.Month); });

  const x = d3.scaleTime()
    .domain(d3.extent(trendData, d => d.date))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trendData, d => Math.max(d["2023"], d["2024"]))]).nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.timeFormat("%b %y")))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  const line2023 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d["2023"]));

  const line2024 = d3.line()
    .x(d => x(d.date))
    .y(d => y(d["2024"]));

  svg.append("path")
    .datum(trendData)
    .attr("fill", "none")
    .attr("stroke", "#2980b9")
    .attr("stroke-width", 2)
    .attr("d", line2023);

  svg.append("path")
    .datum(trendData)
    .attr("fill", "none")
    .attr("stroke", "#c0392b")
    .attr("stroke-width", 2)
    .attr("d", line2024);
}

// Dropdown listeners
["viewType", "topN", "orderType"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    Promise.all([
      d3.json("/data"),
      d3.json("/ticket_counts"),
      d3.json("/monthly_trends")
    ]).then(([mainData, ticketData, trendData]) => {
      renderCharts(mainData, ticketData, trendData);
    });
  });
});
>>>>>>> a095f20 (Added all local project folders to GitHub repo)
