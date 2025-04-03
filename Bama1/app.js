/**
 * Southern Company Data Analysis Tool
 * JavaScript conversion of Python analytics script
 * 
 * This script provides visualization and analysis capabilities for 
 * Southern Company change management data, including:
 * - Change IDs per operational category visualization
 * - Department overtime analysis
 * - Complexity and efficiency metrics
 * - Quadrant analysis for department performance
 */

// Global variables for storing data and state
let globalData = null;
let complexityData = null;
let departmentMetrics = null;

// Main function to initialize the application
function initApp() {
    // Create UI elements
    createUI();

    // Setup file input handler
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);

    // Display initial message
    showMessage("Please upload your Southern Company Excel data file to begin analysis.");
}

// Add this to your app.js file
// Add at the top of your app.js file
function testD3Visualization() {
    console.log("Testing D3 visualization...");
    const testContainer = document.createElement('div');
    testContainer.style.width = '100px';
    testContainer.style.height = '100px';
    testContainer.style.border = '1px solid black';
    document.body.appendChild(testContainer);

    // Create a simple visualization
    const svg = d3.select(testContainer)
        .append('svg')
        .attr('width', 100)
        .attr('height', 100);

    svg.append('circle')
        .attr('cx', 50)
        .attr('cy', 50)
        .attr('r', 40)
        .style('fill', 'red');

    console.log("D3 test visualization complete");
}

// Call this before initApp()
document.addEventListener('DOMContentLoaded', function () {
    testD3Visualization();
    // Then call your regular initialization
    initApp();
});

// Function to create the UI elements
function createUI() {
    const appContainer = document.getElementById('app-container');

    // Create file input section
    const fileSection = document.createElement('div');
    fileSection.className = 'file-section';
    // In your createUI function, modify the header section:
    // In your createUI function, replace the header section:
    // In your createUI function, modify the header section:
    fileSection.innerHTML = `
  <div class="header">
    <div class="logo-container">
      <img src="southern-company-logo.png" alt="Southern Company Logo" class="company-logo">
      <h2>Resource Planning Dashboard</h2>
    </div>
    <div class="date-range">
      <span>Date Range: </span>
      <select id="date-range-selector">
        <option value="currentYear">Current Year</option>
        <option value="previousYear">Previous Year</option>
        <option value="custom">Custom Range</option>
      </select>
    </div>
  </div>
  <div class="metrics-banner">
    <div class="metric">
      <span class="metric-number">528</span>
      <span class="metric-label">Total Change Tickets Completed</span>
    </div>
    <div class="metric">
      <span class="metric-number">4.3 hrs</span>
      <span class="metric-label">Avg. Completion Time</span>
    </div>
    <div class="metric">
      <span class="metric-number">88%</span>
      <span class="metric-label">On-Time Completion Rate</span>
    </div>
  </div>
  <div class="file-input-container">
    <label for="fileInput" class="file-input-label">Select Excel File</label>
    <input type="file" id="fileInput" accept=".xlsx,.xls" />
  </div>
  <div id="message-area" class="message-area"></div>
`;

    // Create analysis tabs
    const tabsSection = document.createElement('div');
    tabsSection.className = 'tabs-section';
    tabsSection.innerHTML = `
    <div class="tabs">
      <button class="tab-button active" data-tab="changeids">ChangeIDs Analysis</button>
      <button class="tab-button" data-tab="overtime">Overtime Analysis</button>
      <button class="tab-button" data-tab="complexity">Complexity Analysis</button>
    </div>
  `;

    // Create content areas for each tab
    const contentSection = document.createElement('div');
    contentSection.className = 'content-section';
    contentSection.innerHTML = `
    <div id="changeids-content" class="tab-content active">
      <div class="controls">
        <div class="control-group">
          <label for="department-dropdown">Customer Department:</label>
          <select id="department-dropdown"></select>
        </div>
      </div>
      <div id="pie-chart-container" class="chart-container"></div>
      <div id="summary-table-container" class="table-container"></div>
    </div>
    
    <div id="overtime-content" class="tab-content">
      <div class="controls">
        <div class="control-group">
          <label for="metric-dropdown">Metric:</label>
          <select id="metric-dropdown">
            <option value="OvertimePercentage">Percentage of Changes Going Overtime</option>
            <option value="TotalOvertimeHours">Total Overtime Hours</option>
            <option value="AvgOvertimeHours">Average Overtime Hours per Change</option>
          </select>
        </div>
        <div class="control-group">
          <label for="num-depts-slider">Number of departments:</label>
          <input type="range" id="num-depts-slider" min="5" max="20" value="10" step="1">
          <span id="num-depts-value">10</span>
        </div>
      </div>
      <div id="overtime-chart-container" class="chart-container"></div>
      <div id="overtime-comparison-container" class="chart-container"></div>
      <div id="overtime-table-container" class="table-container"></div>
    </div>
    
    <div id="complexity-content" class="tab-content">
      <div class="controls">
        <div class="control-group">
          <label for="analysis-dropdown">Analysis:</label>
          <select id="analysis-dropdown">
            <option value="quadrant">Quadrant Analysis (Complexity vs. Efficiency)</option>
            <option value="cei">Top Departments by Complexity Efficiency Index</option>
            <option value="complex-dist">Distribution of Complex Tasks by Department</option>
            <option value="components">Complexity Components Analysis</option>
          </select>
        </div>
        <div class="control-group">
          <label for="comp-dept-dropdown">Department:</label>
          <select id="comp-dept-dropdown"></select>
        </div>
        <div class="control-group">
          <label for="comp-n-depts-slider">Number of departments:</label>
          <input type="range" id="comp-n-depts-slider" min="5" max="25" value="15" step="1">
          <span id="comp-n-depts-value">15</span>
        </div>
      </div>
      <div id="complexity-chart-container" class="chart-container"></div>
      <div id="complexity-table-container" class="table-container"></div>
    </div>
  `;

    // Add all sections to the container
    appContainer.appendChild(fileSection);
    appContainer.appendChild(tabsSection);
    appContainer.appendChild(contentSection);

    // Setup tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-content`).classList.add('active');
        });
    });

    // Setup sliders
    document.getElementById('num-depts-slider').addEventListener('input', (e) => {
        document.getElementById('num-depts-value').textContent = e.target.value;
        if (globalData) updateOvertimeCharts();
    });

    document.getElementById('comp-n-depts-slider').addEventListener('input', (e) => {
        document.getElementById('comp-n-depts-value').textContent = e.target.value;
        if (complexityData) updateComplexityCharts();
    });

    // Setup dropdown change handlers
    document.getElementById('department-dropdown').addEventListener('change', updatePieChart);
    document.getElementById('metric-dropdown').addEventListener('change', updateOvertimeCharts);
    document.getElementById('analysis-dropdown').addEventListener('change', updateComplexityCharts);
    document.getElementById('comp-dept-dropdown').addEventListener('change', updateComplexityCharts);
}

// Function to display messages to the user
function showMessage(message, isError = false) {
    const messageArea = document.getElementById('message-area');
    messageArea.textContent = message;
    messageArea.className = isError ? 'message-area error' : 'message-area';
}

/* Function to handle file uploads
//function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showMessage(`Loading file: ${file.name}...`);

    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            // Parse Excel file
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
                type: 'array',
                cellDates: true,
                cellStyles: true
            });

            // Assume the first sheet is our data
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false, dateNF: 'yyyy-mm-dd HH:mm:ss' });

            // Process the data
            globalData = jsonData;

            // Check if data was loaded successfully
            if (!globalData || globalData.length === 0) {
                showMessage('Error: No data found in the uploaded file.', true);
                return;
            }

            showMessage(`Successfully loaded ${globalData.length} records.`);

            // Initialize the application with the loaded data
            initializeAnalysis(globalData);

        } catch (error) {
            console.error('Error processing file:', error);
            showMessage(`Error processing file: ${error.message}`, true);
        }
    };

    reader.onerror = function () {
        showMessage('Error reading the file.', true);
    };

    reader.readAsArrayBuffer(file);
}*/

// Function to initialize analysis after data is loaded
function initializeAnalysis(data) {
    // Populate dropdowns with unique departments
    populateDepartmentDropdowns(data);

    // Initialize the first tab (ChangeIDs Analysis)
    updatePieChart();

    // Calculate overtime metrics
    calculateOvertimeMetrics(data);

    // Calculate complexity metrics
    calculateComplexityAndEfficiency(data);

    initializeExtendedAnalysis(data);

}

// Function to populate department dropdowns
function populateDepartmentDropdowns(data) {
    // Get unique departments
    const departments = [...new Set(data.map(item => item.CustomerDept))].sort();

    // Populate ChangeIDs tab dropdown
    const deptDropdown = document.getElementById('department-dropdown');
    deptDropdown.innerHTML = '';
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptDropdown.appendChild(option);
    });

    // Populate Complexity tab dropdown
    const compDeptDropdown = document.getElementById('comp-dept-dropdown');
    compDeptDropdown.innerHTML = '';

    // Add "All Departments" option
    const allDeptOption = document.createElement('option');
    allDeptOption.value = 'All Departments';
    allDeptOption.textContent = 'All Departments';
    compDeptDropdown.appendChild(allDeptOption);

    // Add individual departments
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        compDeptDropdown.appendChild(option);
    });
}

// ChangeIDs Analysis Functions
function updatePieChart() {
    if (!globalData) return;

    const selectedDept = document.getElementById('department-dropdown').value;
    const pieChartContainer = document.getElementById('pie-chart-container');
    const summaryTableContainer = document.getElementById('summary-table-container');

    // Clear previous chart and table
    pieChartContainer.innerHTML = '';
    summaryTableContainer.innerHTML = '';

    // Filter data by selected department
    const filteredData = globalData.filter(item => item.CustomerDept === selectedDept);

    if (filteredData.length === 0) {
        pieChartContainer.innerHTML = '<p>No data available for the selected department.</p>';
        return;
    }

    // Count ChangeIDs per OpCat1
    const opcat1Counts = {};
    filteredData.forEach(item => {
        const category = item.OpCat1 || 'Unknown';
        opcat1Counts[category] = (opcat1Counts[category] || 0) + 1;
    });

    // Create pie chart
    createPieChart(pieChartContainer, opcat1Counts, selectedDept, filteredData.length);

    // Create summary table
    createSummaryTable(summaryTableContainer, opcat1Counts);
}

function createPieChart(container, data, departmentName, totalChanges) {
    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 150, bottom: 50, left: 50 };
    const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2 - margin.right / 2},${height / 2})`);

    // Color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Convert data for D3
    const pieData = Object.entries(data).map(([category, count]) => ({
        category,
        count
    }));

    // Generate pie layout
    const pie = d3.pie()
        .value(d => d.count)
        .sort(null);

    const pieArcs = pie(pieData);

    // Generate arc path generator
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    // Generate outer arc for labels
    const outerArc = d3.arc()
        .innerRadius(radius * 1.1)
        .outerRadius(radius * 1.1);

    // Add a tiny offset to each wedge for the exploded effect
    const arcOffset = 0.05;
    const offsetArc = d => {
        const centroid = arc.centroid(d);
        const x = centroid[0] * arcOffset;
        const y = centroid[1] * arcOffset;
        return `translate(${x}, ${y})`;
    };

    // Draw pie segments
    const segments = svg.selectAll('path')
        .data(pieArcs)
        .enter()
        .append('g')
        .attr('transform', offsetArc);

    segments.append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .style('opacity', 0.8)
        .on('mouseover', function () {
            d3.select(this).style('opacity', 1);
        })
        .on('mouseout', function () {
            d3.select(this).style('opacity', 0.8);
        });

    // Add percentage labels
    segments.append('text')
        .attr('transform', d => {
            const pos = arc.centroid(d);
            return `translate(${pos[0]}, ${pos[1]})`;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(d => {
            const percentage = (d.data.count / totalChanges) * 100;
            return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
        });

    // Add title
    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 2 + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`ChangeIDs per OpCat1 for ${departmentName}`);

    svg.append('text')
        .attr('x', 0)
        .attr('y', -height / 2 + 45)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(`Total: ${totalChanges} Changes`);

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(pieArcs)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${radius + 30}, ${-radius + 20 + i * 20})`);

    legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d, i) => color(i));

    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(d => `${d.data.category} (${d.data.count})`);
}

function createSummaryTable(container, data) {
    // Create table elements
    const table = document.createElement('table');
    table.className = 'summary-table';

    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    ['OpCat1', 'Count', 'Percentage'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Calculate total count
    const totalCount = Object.values(data).reduce((sum, count) => sum + count, 0);

    // Create table body
    const tbody = document.createElement('tbody');
    Object.entries(data).forEach(([category, count]) => {
        const row = document.createElement('tr');

        // Category cell
        const categoryCell = document.createElement('td');
        categoryCell.textContent = category;
        row.appendChild(categoryCell);

        // Count cell
        const countCell = document.createElement('td');
        countCell.textContent = count;
        row.appendChild(countCell);

        // Percentage cell
        const percentageCell = document.createElement('td');
        percentageCell.textContent = `${((count / totalCount) * 100).toFixed(1)}%`;
        row.appendChild(percentageCell);

        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Add table to container
    container.appendChild(table);
}

// Overtime Analysis Functions
function calculateOvertimeMetrics(data) {
    try {
        // Ensure datetime columns are correctly formatted
        data.forEach(item => {
            const timeCols = ['SchStartDateTime', 'SchEndDateTime', 'ActualStartDateTime', 'ActualEndDateTime'];
            timeCols.forEach(col => {
                if (item[col]) {
                    // Convert to Date object if it's a string
                    if (typeof item[col] === 'string') {
                        item[col] = new Date(item[col]);
                    }
                }
            });

            // Calculate overtime in hours
            if (item.ActualEndDateTime && item.SchEndDateTime) {
                item.OverTime = (item.ActualEndDateTime - item.SchEndDateTime) / (1000 * 60 * 60);
                item.WentOvertime = item.OverTime > 0;
            } else {
                item.OverTime = 0;
                item.WentOvertime = false;
            }
        });

        // Group by department
        const deptMetrics = {};

        // Get unique departments
        const departments = [...new Set(data.map(item => item.CustomerDept))];

        // Calculate metrics for each department
        departments.forEach(dept => {
            const deptData = data.filter(item => item.CustomerDept === dept);
            const totalChanges = deptData.length;
            const overtimeChanges = deptData.filter(item => item.WentOvertime).length;

            // Calculate total overtime hours for changes that went overtime
            let totalOvertimeHours = 0;
            deptData.forEach(item => {
                if (item.OverTime > 0) {
                    totalOvertimeHours += item.OverTime;
                }
            });

            // Calculate percentage and average
            const overtimePercentage = totalChanges > 0 ? (overtimeChanges / totalChanges) * 100 : 0;
            const avgOvertimeHours = overtimeChanges > 0 ? totalOvertimeHours / overtimeChanges : 0;

            deptMetrics[dept] = {
                TotalChanges: totalChanges,
                OvertimeChanges: overtimeChanges,
                TotalOvertimeHours: totalOvertimeHours,
                OvertimePercentage: overtimePercentage,
                AvgOvertimeHours: avgOvertimeHours
            };
        });

        // Update global data
        globalData.deptMetrics = deptMetrics;

        // Update overtime charts
        updateOvertimeCharts();

    } catch (error) {
        console.error('Error calculating overtime metrics:', error);
        showMessage(`Error calculating overtime metrics: ${error.message}`, true);
    }
}

function updateOvertimeCharts() {
    if (!globalData || !globalData.deptMetrics) return;

    const selectedMetric = document.getElementById('metric-dropdown').value;
    const numDepts = parseInt(document.getElementById('num-depts-slider').value);

    const overtimeChartContainer = document.getElementById('overtime-chart-container');
    const comparisonContainer = document.getElementById('overtime-comparison-container');
    const tableContainer = document.getElementById('overtime-table-container');

    // Clear previous charts and table
    overtimeChartContainer.innerHTML = '';
    comparisonContainer.innerHTML = '';
    tableContainer.innerHTML = '';

    // Convert metrics to sortable array
    const deptArray = Object.entries(globalData.deptMetrics).map(([dept, metrics]) => ({
        dept,
        ...metrics
    }));

    // Sort by selected metric
    deptArray.sort((a, b) => b[selectedMetric] - a[selectedMetric]);

    // Limit to requested number of departments
    const topDepts = deptArray.slice(0, numDepts);

    // Create charts
    createOvertimeBarChart(overtimeChartContainer, topDepts, selectedMetric);
    createComparisonChart(comparisonContainer, topDepts);
    createOvertimeSummaryTable(tableContainer, topDepts);
}

function createOvertimeBarChart(container, data, metric) {
    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 150, bottom: 100, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const y = d3.scaleBand()
        .domain(data.map(d => d.dept))
        .range([0, chartHeight])
        .padding(0.1);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d[metric]) * 1.1])
        .range([0, chartWidth]);

    // Color scale
    const colorScale = d3.scaleSequential()
        .domain([0, data.length])
        .interpolator(d3.interpolateViridis);

    // Draw bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => y(d.dept))
        .attr('height', y.bandwidth())
        .attr('x', 0)
        .attr('width', d => x(d[metric]))
        .attr('fill', (d, i) => colorScale(i))
        .attr('opacity', 0.8);

    // Add value labels
    svg.selectAll('.value-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('y', d => y(d.dept) + y.bandwidth() / 2)
        .attr('x', d => x(d[metric]) + 5)
        .attr('dy', '.35em')
        .style('font-size', '12px')
        .text(d => {
            if (metric === 'OvertimePercentage') {
                return `${d[metric].toFixed(1)}%`;
            } else if (metric === 'TotalOvertimeHours' || metric === 'AvgOvertimeHours') {
                return `${d[metric].toFixed(1)} hrs`;
            } else {
                return d[metric].toFixed(0);
            }
        });

    // Add axes
    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add axis labels
    let xLabel;
    if (metric === 'OvertimePercentage') {
        xLabel = 'Percentage of Changes (%)';
    } else if (metric === 'TotalOvertimeHours') {
        xLabel = 'Total Overtime Hours';
    } else if (metric === 'AvgOvertimeHours') {
        xLabel = 'Average Overtime Hours per Change';
    } else {
        xLabel = metric;
    }

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + margin.bottom - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(xLabel);

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Department');

    // Add title
    let title;
    if (metric === 'OvertimePercentage') {
        title = `Top ${data.length} Departments by Percentage of Changes Going Overtime`;
    } else if (metric === 'TotalOvertimeHours') {
        title = `Top ${data.length} Departments by Total Overtime Hours`;
    } else if (metric === 'AvgOvertimeHours') {
        title = `Top ${data.length} Departments by Average Overtime Hours per Change`;
    } else {
        title = `Top ${data.length} Departments by ${metric}`;
    }

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(title);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisBottom(x)
            .tickSize(chartHeight)
            .tickFormat('')
        )
        .attr('opacity', 0.1);
}

function createComparisonChart(container, data) {
    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 150, bottom: 100, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.dept))
        .range([0, chartWidth])
        .padding(0.2);

    // Primary y-axis for overtime percentage (left)
    const y1 = d3.scaleLinear()
        .domain([0, Math.max(100, d3.max(data, d => d.OvertimePercentage) * 1.1)])
        .range([chartHeight, 0]);

    // Secondary y-axis for average overtime hours (right)
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgOvertimeHours) * 1.1])
        .range([chartHeight, 0]);

    // Draw bars for overtime percentage
    svg.selectAll('.percentage-bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'percentage-bar')
        .attr('x', d => x(d.dept))
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => y1(d.OvertimePercentage))
        .attr('height', d => chartHeight - y1(d.OvertimePercentage))
        .attr('fill', 'steelblue')
        .attr('opacity', 0.6);

    // Draw line for average overtime hours
    const line = d3.line()
        .x(d => x(d.dept) + x.bandwidth() / 2)
        .y(d => y2(d.AvgOvertimeHours));

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add markers for each data point on the line
    svg.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.dept) + x.bandwidth() / 2)
        .attr('cy', d => y2(d.AvgOvertimeHours))
        .attr('r', 5)
        .attr('fill', 'red');

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add primary y-axis (left - percentage)
    svg.append('g')
        .call(d3.axisLeft(y1))
        .selectAll('text')
        .style('font-size', '12px');

    // Add secondary y-axis (right - hours)
    svg.append('g')
        .attr('transform', `translate(${chartWidth}, 0)`)
        .call(d3.axisRight(y2))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${-margin.left / 2}, ${chartHeight / 2}) rotate(-90)`)
        .text('Overtime Percentage (%)')
        .style('fill', 'steelblue')
        .style('font-size', '12px');

    svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${chartWidth + margin.right / 2}, ${chartHeight / 2}) rotate(90)`)
        .text('Average Overtime Hours')
        .style('fill', 'red')
        .style('font-size', '12px');

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + margin.bottom - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Department');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Comparison: Percentage vs Average Hours');

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${chartWidth - 100}, 0)`);

    // Percentage legend
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.6);

    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text('Overtime Percentage (%)');

    // Hours legend
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 15)
        .attr('height', 2)
        .attr('fill', 'red');

    legend.append('circle')
        .attr('cx', 7.5)
        .attr('cy', 26)
        .attr('r', 4)
        .attr('fill', 'red');

    legend.append('text')
        .attr('x', 20)
        .attr('y', 26)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text('Avg Overtime Hours');
}

function createOvertimeSummaryTable(container, data) {
    // Create table element
    const table = document.createElement('table');
    table.className = 'summary-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    ['Department', 'Total Changes', 'Overtime Changes', '% Going Overtime', 'Total Overtime Hours', 'Avg Hours per Overtime']
        .forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    data.forEach(dept => {
        const row = document.createElement('tr');

        // Department cell
        const deptCell = document.createElement('td');
        deptCell.textContent = dept.dept;
        row.appendChild(deptCell);

        // Total Changes cell
        const totalCell = document.createElement('td');
        totalCell.textContent = dept.TotalChanges;
        row.appendChild(totalCell);

        // Overtime Changes cell
        const otChangesCell = document.createElement('td');
        otChangesCell.textContent = dept.OvertimeChanges;
        row.appendChild(otChangesCell);

        // Percentage cell
        const percentageCell = document.createElement('td');
        percentageCell.textContent = `${dept.OvertimePercentage.toFixed(1)}%`;
        row.appendChild(percentageCell);

        // Total Overtime Hours cell
        const totalOTHoursCell = document.createElement('td');
        totalOTHoursCell.textContent = dept.TotalOvertimeHours.toFixed(1);
        row.appendChild(totalOTHoursCell);

        // Average Overtime Hours cell
        const avgOTHoursCell = document.createElement('td');
        avgOTHoursCell.textContent = dept.AvgOvertimeHours.toFixed(1);
        row.appendChild(avgOTHoursCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add to container
    const title = document.createElement('h3');
    title.textContent = 'Department Overtime Summary';
    container.appendChild(title);
    container.appendChild(table);
}

// Complexity Analysis Functions
// Function to calculate complexity and efficiency for all changes
// Function to properly handle Excel date values
// Function to properly handle Excel date values
// Function to properly handle Excel date values
function parseExcelDate(dateValue) {
    // Handle empty values
    if (!dateValue) return null;

    try {
        // If already a Date object
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue;
        }

        // First check for time-only values (like "6:00:00 PM")
        if (typeof dateValue === 'string') {
            // Check if it's just a time without a date
            if (/^\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM)$/i.test(dateValue)) {
                // Create a date for today and set the time
                const today = new Date();
                const timeParts = dateValue.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);

                if (timeParts) {
                    let hours = parseInt(timeParts[1]);
                    const minutes = parseInt(timeParts[2]);
                    const seconds = parseInt(timeParts[3]);
                    const isPM = timeParts[4].toUpperCase() === 'PM';

                    // Adjust hours for PM
                    if (isPM && hours < 12) hours += 12;
                    if (!isPM && hours === 12) hours = 0;

                    today.setHours(hours, minutes, seconds, 0);
                    return today;
                }
            }

            // Try standard date parsing
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Return a default value if we can't parse it properly
        console.warn(`Could not parse date value: ${dateValue}, using default`);
        return null;

    } catch (e) {
        console.error(`Error parsing date: ${e.message}`);
        return null;
    }
}

// Function to calculate time durations when we know times are on the same day
function calculateHoursBetween(startTime, endTime) {
    // Handle special case where end time is 12:00:00 AM (midnight)
    if (endTime.getHours() === 0 && endTime.getMinutes() === 0 && endTime.getSeconds() === 0) {
        // Assume this means end of day (24:00)
        const adjustedEnd = new Date(endTime);
        adjustedEnd.setHours(24, 0, 0, 0);
        return (adjustedEnd - startTime) / (1000 * 60 * 60);
    }

    // Normal case
    return (endTime - startTime) / (1000 * 60 * 60);
}

// Function to calculate complexity and efficiency metrics
function calculateComplexityAndEfficiency(data) {
    try {
        console.log("Starting complexity and efficiency calculations for", data.length, "records");

        // Apply complexity scoring
        data.forEach(item => {
            // Component scores calculation stays the same

            // Handle time fields differently
            // Parse the time fields
            const schStart = parseExcelDate(item.SchStartDateTime);
            const schEnd = parseExcelDate(item.SchEndDateTime);
            const actStart = parseExcelDate(item.ActualStartDateTime);
            const actEnd = parseExcelDate(item.ActualEndDateTime);

            // Log the parsed dates for debugging
            console.log(`Change ${item.ChangeID}: SchStart=${schStart}, SchEnd=${schEnd}, ActStart=${actStart}, ActEnd=${actEnd}`);

            // Calculate efficiency only if we have valid dates
            if (schStart && schEnd && actStart && actEnd) {
                try {
                    // Calculate hours directly from the times
                    const scheduledHours = calculateHoursBetween(schStart, schEnd);
                    const actualHours = calculateHoursBetween(actStart, actEnd);

                    console.log(`Change ${item.ChangeID}: Scheduled=${scheduledHours}h, Actual=${actualHours}h`);

                    // Calculate efficiency ratio
                    if (actualHours > 0) {
                        item.EfficiencyRatio = scheduledHours / actualHours;

                        // Cap extreme values
                        if (item.EfficiencyRatio > 5) {
                            item.EfficiencyRatio = 5;
                        } else if (item.EfficiencyRatio <= 0) {
                            item.EfficiencyRatio = 0.1;
                        }

                        console.log(`Change ${item.ChangeID}: Efficiency=${item.EfficiencyRatio.toFixed(2)}`);
                    } else {
                        item.EfficiencyRatio = 1; // Default
                    }

                    // Set the efficiency flag
                    item.IsEfficient = item.EfficiencyRatio > 1;

                    // Calculate overtime
                    item.OverTime = (actEnd - schEnd) / (1000 * 60 * 60);
                    item.WentOvertime = item.OverTime > 0;

                    if (item.WentOvertime) {
                        console.log(`Change ${item.ChangeID}: Overtime=${item.OverTime.toFixed(2)}h`);
                    }
                } catch (e) {
                    console.error(`Error calculating time metrics for ${item.ChangeID}: ${e.message}`);
                    item.EfficiencyRatio = 1;
                    item.IsEfficient = false;
                }
            } else {
                // Default values if missing dates
                item.EfficiencyRatio = 1;
                item.IsEfficient = false;
                item.OverTime = 0;
                item.WentOvertime = false;
            }
        });

        // Rest of the function (department metrics calculation) stays the same
    } catch (error) {
        console.error('Error in complexity calculation:', error);
        showMessage(`Error in complexity calculation: ${error.message}`, true);
    }
}

// Function to calculate overtime metrics
function calculateOvertimeMetrics(data) {
    try {
        console.log("Starting overtime calculations with", data.length, "records");

        // Create a deep copy to avoid modifying original data
        const processedData = JSON.parse(JSON.stringify(data));

        // Ensure all date fields are properly converted
        processedData.forEach(item => {
            // Convert date fields
            const dateFields = ['SchStartDateTime', 'SchEndDateTime', 'ActualStartDateTime', 'ActualEndDateTime'];
            dateFields.forEach(field => {
                item[field] = parseExcelDate(item[field]);
            });
        });

        // Calculate overtime metrics
        let overtimeCount = 0;

        processedData.forEach(item => {
            try {
                // Check if we have required date fields
                if (item.ActualEndDateTime && item.SchEndDateTime) {
                    // Calculate overtime in hours
                    item.OverTime = (item.ActualEndDateTime - item.SchEndDateTime) / (1000 * 60 * 60);
                    item.WentOvertime = item.OverTime > 0;

                    if (item.WentOvertime) {
                        overtimeCount++;
                        console.log(`Overtime detected: ${item.ChangeID}, ${item.OverTime.toFixed(2)} hours`);
                    }
                } else {
                    // Default values if dates are missing
                    item.OverTime = 0;
                    item.WentOvertime = false;
                }
            } catch (e) {
                console.error(`Error calculating overtime for ${item.ChangeID}: ${e.message}`);
                item.OverTime = 0;
                item.WentOvertime = false;
            }
        });

        console.log(`Total changes with overtime: ${overtimeCount} of ${processedData.length}`);

        // Group by department
        const deptMetrics = {};
        const departments = [...new Set(processedData.map(item => item.CustomerDept))];

        // Calculate metrics for each department
        departments.forEach(dept => {
            const deptData = processedData.filter(item => item.CustomerDept === dept);
            const totalChanges = deptData.length;
            const overtimeChanges = deptData.filter(item => item.WentOvertime).length;

            // Calculate total overtime hours
            let totalOvertimeHours = 0;
            deptData.forEach(item => {
                if (item.OverTime > 0) {
                    totalOvertimeHours += item.OverTime;
                }
            });

            // Calculate percentage and average
            const overtimePercentage = totalChanges > 0 ? (overtimeChanges / totalChanges) * 100 : 0;
            const avgOvertimeHours = overtimeChanges > 0 ? totalOvertimeHours / overtimeChanges : 0;

            deptMetrics[dept] = {
                TotalChanges: totalChanges,
                OvertimeChanges: overtimeChanges,
                TotalOvertimeHours: totalOvertimeHours,
                OvertimePercentage: overtimePercentage,
                AvgOvertimeHours: avgOvertimeHours
            };

            console.log(`Department ${dept} overtime: ${overtimeChanges} of ${totalChanges} changes (${overtimePercentage.toFixed(1)}%), ${totalOvertimeHours.toFixed(1)} total hours`);
        });

        // Update global data
        globalData.deptMetrics = deptMetrics;

        // Update overtime charts
        updateOvertimeCharts();

    } catch (error) {
        console.error('Error in overtime calculation:', error);
        showMessage(`Error calculating overtime metrics: ${error.message}`, true);
    }
}

function updateComplexityCharts() {
    if (!complexityData || !departmentMetrics) {
        console.error("Missing data - complexityData or departmentMetrics not available");
        return;
    }

    console.log("Updating complexity charts...");

    const selectedAnalysis = document.getElementById('analysis-dropdown').value;
    const selectedDept = document.getElementById('comp-dept-dropdown').value;
    const numDepts = parseInt(document.getElementById('comp-n-depts-slider').value);

    const chartContainer = document.getElementById('complexity-chart-container');
    const tableContainer = document.getElementById('complexity-table-container');

    // Clear previous charts and table
    chartContainer.innerHTML = '';
    tableContainer.innerHTML = '';

    console.log(`Selected analysis: ${selectedAnalysis}, Department: ${selectedDept}, NumDepts: ${numDepts}`);

    // Create visualization based on selected analysis
    try {
        switch (selectedAnalysis) {
            case 'quadrant':
                console.log("Creating quadrant chart...");
                createQuadrantChart(chartContainer, departmentMetrics, numDepts);
                break;
            case 'cei':
                console.log("Creating CEI bar chart...");
                createCEIBarChart(chartContainer, departmentMetrics, numDepts);
                createComplexityMetricsTable(tableContainer, departmentMetrics, numDepts);
                break;
            case 'complex-dist':
                console.log("Creating complex distribution chart...");
                createComplexDistributionChart(chartContainer, departmentMetrics, numDepts);
                break;
            case 'components':
                console.log("Creating complexity components chart...");
                createComplexityComponentsChart(chartContainer, complexityData, selectedDept);
                break;
            default:
                chartContainer.innerHTML = '<p>Please select an analysis type.</p>';
                break;
        }
    } catch (error) {
        console.error("Error updating charts:", error);
        chartContainer.innerHTML = `<p>Error updating charts: ${error.message}</p>`;
    }
}

function createQuadrantChart(container, data, numDepts) {
    try {
        console.log("Creating quadrant chart with", data.length, "departments");

        // Clear container first
        container.innerHTML = '<h3>Quadrant Analysis</h3>';

        // Sort by number of changes
        const sortedData = _.orderBy(data, ['TotalChanges'], ['desc']).slice(0, numDepts);

        // Check if container has width
        const containerWidth = container.clientWidth;
        console.log("Container width:", containerWidth);

        if (!containerWidth) {
            console.warn("Container has no width - using default 800px");
        }

        // Set dimensions and margins
        const width = containerWidth || 800;
        const height = 500;
        const margin = { top: 60, right: 100, bottom: 60, left: 80 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Add fallback content in case D3 fails
        const fallbackContent = document.createElement('div');
        fallbackContent.innerHTML = `
      <p>Chart should appear here. If you don't see it, there might be an issue with D3.</p>
      <p>Data summary: ${sortedData.length} departments, complexity range: 
         ${d3.min(sortedData, d => d.AvgComplexity).toFixed(2)} - 
         ${d3.max(sortedData, d => d.AvgComplexity).toFixed(2)}, 
         efficiency range: 
         ${d3.min(sortedData, d => d.AvgEfficiency).toFixed(2)} - 
         ${d3.max(sortedData, d => d.AvgEfficiency).toFixed(2)}</p>
    `;
        container.appendChild(fallbackContent);

        // Create SVG container
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Create scales
        const x = d3.scaleLinear()
            .domain([1, 5])
            .range([0, chartWidth]);

        const y = d3.scaleLinear()
            .domain([0, 5])
            .range([chartHeight, 0]);

        // Bubble size scale
        const bubbleSize = d3.scaleLinear()
            .domain([
                d3.min(sortedData, d => d.TotalChanges) || 1,
                d3.max(sortedData, d => d.TotalChanges) || 100
            ])
            .range([5, 30]);

        // Draw quadrant lines
        svg.append('line')
            .attr('x1', x(3))
            .attr('y1', 0)
            .attr('x2', x(3))
            .attr('y2', chartHeight)
            .attr('stroke', '#ccc')
            .attr('stroke-dasharray', '4');

        svg.append('line')
            .attr('x1', 0)
            .attr('y1', y(1))
            .attr('x2', chartWidth)
            .attr('y2', y(1))
            .attr('stroke', '#ccc')
            .attr('stroke-dasharray', '4');

        // Draw bubbles
        svg.selectAll('.bubble')
            .data(sortedData)
            .enter()
            .append('circle')
            .attr('class', 'bubble')
            .attr('cx', d => x(d.AvgComplexity))
            .attr('cy', d => y(d.AvgEfficiency))
            .attr('r', d => bubbleSize(d.TotalChanges))
            .attr('fill', 'steelblue')
            .attr('opacity', 0.7)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        // Add department labels
        svg.selectAll('.bubble-label')
            .data(sortedData)
            .enter()
            .append('text')
            .attr('class', 'bubble-label')
            .attr('x', d => x(d.AvgComplexity))
            .attr('y', d => y(d.AvgEfficiency) - bubbleSize(d.TotalChanges) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => d.CustomerDept);

        // Add axes
        svg.append('g')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x));

        svg.append('g')
            .call(d3.axisLeft(y));

        // Add title
        svg.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text('Department Performance');

        console.log("Quadrant chart created successfully");
    } catch (error) {
        console.error("Error creating quadrant chart:", error);
        container.innerHTML += `
      <div style="color: red; padding: 20px; border: 1px solid #ddd; margin-top: 20px;">
        <h4>Error Creating Chart</h4>
        <p>${error.message}</p>
        <p>Stack: ${error.stack}</p>
      </div>
    `;
    }
}

function createCEIBarChart(container, data, numDepts) {
    // Sort by CEI and take top N
    const sortedData = _.orderBy(data, ['ComplexityEfficiencyIndex'], ['desc']).slice(0, numDepts);

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 30, bottom: 100, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(sortedData.map(d => d.CustomerDept))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.ComplexityEfficiencyIndex) * 1.1])
        .range([chartHeight, 0]);

    // Color scale
    const colorScale = d3.scaleSequential()
        .domain([0, sortedData.length])
        .interpolator(d3.interpolateViridis);

    // Draw bars
    svg.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.CustomerDept))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.ComplexityEfficiencyIndex))
        .attr('height', d => chartHeight - y(d.ComplexityEfficiencyIndex))
        .attr('fill', (d, i) => colorScale(i))
        .attr('opacity', 0.8);

    // Add value labels
    svg.selectAll('.value-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.CustomerDept) + x.bandwidth() / 2)
        .attr('y', d => y(d.ComplexityEfficiencyIndex) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(d => d.ComplexityEfficiencyIndex.toFixed(2));

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Complexity Efficiency Index');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Top ${sortedData.length} Departments by Complexity Efficiency Index`);

    // Add explanation
    const explanation = document.createElement('div');
    explanation.className = 'explanation';
    explanation.innerHTML = `
    <h4>Complexity Efficiency Index (CEI) Explanation:</h4>
    <p>CEI = (Avg. Efficiency * Avg. Complexity) / 5</p>
    <p>Higher values indicate departments that can handle complex tasks efficiently. This is a custom metric that rewards departments that maintain high efficiency while taking on complex work.</p>
  `;

    container.appendChild(explanation);
}

function createComplexDistributionChart(container, data, numDepts) {
    // Sort by percentage of complex tasks and take top N
    const sortedData = _.orderBy(data, ['ComplexPercentage'], ['desc']).slice(0, numDepts);

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 150, bottom: 100, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(sortedData.map(d => d.CustomerDept))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([chartHeight, 0]);

    // Secondary y-axis for total changes (right)
    const y2 = d3.scaleLinear()
        .domain([0, d3.max(sortedData, d => d.TotalChanges) * 1.2])
        .range([chartHeight, 0]);

    // Color scale
    const colorScale = d3.scaleSequential()
        .domain([0, 100])
        .interpolator(d3.interpolateRgb("#4575b4", "#d73027"));

    // Draw complex percentage bars
    svg.selectAll('.complex-bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'complex-bar')
        .attr('x', d => x(d.CustomerDept))
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => y(d.ComplexPercentage))
        .attr('height', d => chartHeight - y(d.ComplexPercentage))
        .attr('fill', d => colorScale(d.ComplexPercentage))
        .attr('opacity', 0.8);

    // Draw efficient percentage bars
    svg.selectAll('.efficient-bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'efficient-bar')
        .attr('x', d => x(d.CustomerDept) + x.bandwidth() / 2)
        .attr('width', x.bandwidth() / 2)
        .attr('y', d => y(d.EfficientPercentage))
        .attr('height', d => chartHeight - y(d.EfficientPercentage))
        .attr('fill', '#2ca02c')
        .attr('opacity', 0.8);

    // Draw line for total changes
    const line = d3.line()
        .x(d => x(d.CustomerDept) + x.bandwidth() / 2)
        .y(d => y2(d.TotalChanges));

    svg.append('path')
        .datum(sortedData)
        .attr('fill', 'none')
        .attr('stroke', '#ff7f0e')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add markers for each data point on the line
    svg.selectAll('.point')
        .data(sortedData)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => x(d.CustomerDept) + x.bandwidth() / 2)
        .attr('cy', d => y2(d.TotalChanges))
        .attr('r', 5)
        .attr('fill', '#ff7f0e');

    // Add percentage labels
    svg.selectAll('.complex-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'complex-label')
        .attr('x', d => x(d.CustomerDept) + x.bandwidth() / 4)
        .attr('y', d => y(d.ComplexPercentage) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .text(d => `${d.ComplexPercentage.toFixed(0)}%`);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add primary y-axis (left - percentage)
    svg.append('g')
        .call(d3.axisLeft(y).tickFormat(d => `${d}%`))
        .selectAll('text')
        .style('font-size', '12px');

    // Add secondary y-axis (right - count)
    svg.append('g')
        .attr('transform', `translate(${chartWidth}, 0)`)
        .call(d3.axisRight(y2))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Percentage');

    svg.append('text')
        .attr('transform', `rotate(-90) translate(${-chartHeight / 2}, ${chartWidth + 40})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Total Changes');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Distribution of Complex vs. Efficient Tasks by Department`);

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${chartWidth + 20}, 10)`);

    // Complex tasks legend
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', colorScale(80))
        .attr('opacity', 0.8);

    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text('Complex Tasks (%)');

    // Efficient tasks legend
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', '#2ca02c')
        .attr('opacity', 0.8);

    legend.append('text')
        .attr('x', 20)
        .attr('y', 32.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text('Efficient Tasks (%)');

    // Total changes legend
    legend.append('rect')
        .attr('x', 0)
        .attr('y', 50)
        .attr('width', 15)
        .attr('height', 2)
        .attr('fill', '#ff7f0e');

    legend.append('circle')
        .attr('cx', 7.5)
        .attr('cy', 51)
        .attr('r', 4)
        .attr('fill', '#ff7f0e');

    legend.append('text')
        .attr('x', 20)
        .attr('y', 51)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text('Total Changes');
}

function createComplexityComponentsChart(container, complexityData, selectedDept) {
    // Filter for specific department if provided
    let filteredData;
    let titleSuffix;

    if (selectedDept && selectedDept !== 'All Departments') {
        filteredData = complexityData.filter(d => d.CustomerDept === selectedDept);
        titleSuffix = ` for ${selectedDept}`;

        if (filteredData.length === 0) {
            container.innerHTML = `<p>No data available for department '${selectedDept}'</p>`;
            filteredData = complexityData;
            titleSuffix = ' (All Departments - requested department had no data)';
        }
    } else {
        filteredData = complexityData;
        titleSuffix = ' Across All Departments';
    }

    // Calculate average scores
    const avgScores = {
        'Impact': d3.mean(filteredData, d => d.ImpactScore) * 0.35,
        'Planning': d3.mean(filteredData, d => d.PlanningScore) * 0.20,
        'Operation': d3.mean(filteredData, d => d.OpCatScore) * 0.25,
        'Summary': d3.mean(filteredData, d => d.SummaryScore) * 0.20
    };

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 150, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(Object.keys(avgScores))
        .range([0, chartWidth])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(avgScores)) * 1.2])
        .range([chartHeight, 0]);

    // Color scale
    const color = d3.scaleOrdinal()
        .domain(Object.keys(avgScores))
        .range(d3.schemeCategory10);

    // Draw bars
    const bars = svg.selectAll('.bar')
        .data(Object.entries(avgScores))
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d[0]))
        .attr('y', d => y(d[1]))
        .attr('width', x.bandwidth())
        .attr('height', d => chartHeight - y(d[1]))
        .attr('fill', d => color(d[0]))
        .attr('opacity', 0.8);

    // Add value labels
    svg.selectAll('.value-label')
        .data(Object.entries(avgScores))
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d[0]) + x.bandwidth() / 2)
        .attr('y', d => y(d[1]) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d[1].toFixed(2));

    // Calculate total complexity
    const totalComplexity = Object.values(avgScores).reduce((a, b) => a + b, 0);

    // Add a horizontal line for the total complexity
    svg.append('line')
        .attr('x1', 0)
        .attr('y1', y(totalComplexity))
        .attr('x2', chartWidth)
        .attr('y2', y(totalComplexity))
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    svg.append('text')
        .attr('x', chartWidth)
        .attr('y', y(totalComplexity) - 5)
        .attr('text-anchor', 'end')
        .style('font-size', '12px')
        .style('fill', 'red')
        .text(`Total: ${totalComplexity.toFixed(2)}`);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Component');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -60)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Weighted Contribution to Complexity Score');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`Components of Task Complexity${titleSuffix}`);

    // Add explanation
    const explanation = document.createElement('div');
    explanation.className = 'explanation';
    explanation.innerHTML = `
    <h4>Explanation of Complexity Components:</h4>
    <ul>
      <li><strong>Impact:</strong> Score based on the potential impact of the change (None to Extensive)</li>
      <li><strong>Planning:</strong> Score based on the planning approach (Standard to Unplanned)</li>
      <li><strong>Operation:</strong> Score based on the operation category (Remove/Retire to Migrate)</li>
      <li><strong>Summary:</strong> Score based on the complexity indicated in the summary text</li>
    </ul>
    <p>Each component is weighted: Impact (35%), Operation (25%), Planning (20%), Summary (20%)</p>
  `;

    container.appendChild(explanation);
}

function createComplexityMetricsTable(container, deptMetrics, numDepts) {
    // Sort by CEI
    const sortedMetrics = _.orderBy(deptMetrics, ['ComplexityEfficiencyIndex'], ['desc']);

    // Take top N departments
    const topDepts = sortedMetrics.slice(0, numDepts);

    // Create table elements
    const table = document.createElement('table');
    table.className = 'summary-table';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = [
        'Department',
        'Avg Complexity',
        'Avg Efficiency',
        'CEI',
        'Complex Tasks (%)',
        'Efficient Tasks (%)',
        'Total Changes'
    ];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    topDepts.forEach(dept => {
        const row = document.createElement('tr');

        // Department cell
        const deptCell = document.createElement('td');
        deptCell.textContent = dept.CustomerDept;
        row.appendChild(deptCell);

        // Avg Complexity cell
        const complexityCell = document.createElement('td');
        complexityCell.textContent = dept.AvgComplexity.toFixed(2);
        row.appendChild(complexityCell);

        // Avg Efficiency cell
        const efficiencyCell = document.createElement('td');
        efficiencyCell.textContent = dept.AvgEfficiency.toFixed(2);
        row.appendChild(efficiencyCell);

        // CEI cell
        const ceiCell = document.createElement('td');
        ceiCell.textContent = dept.ComplexityEfficiencyIndex.toFixed(2);
        row.appendChild(ceiCell);

        // Complex Tasks cell
        const complexTasksCell = document.createElement('td');
        complexTasksCell.textContent = `${dept.ComplexPercentage.toFixed(1)}%`;
        row.appendChild(complexTasksCell);

        // Efficient Tasks cell
        const efficientTasksCell = document.createElement('td');
        efficientTasksCell.textContent = `${dept.EfficientPercentage.toFixed(1)}%`;
        row.appendChild(efficientTasksCell);

        // Total Changes cell
        const totalChangesCell = document.createElement('td');
        totalChangesCell.textContent = dept.TotalChanges;
        row.appendChild(totalChangesCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Department Performance Metrics';
    container.appendChild(title);

    // Add table to container
    container.appendChild(table);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

// Add these functions to the script - DO NOT EDIT ANY EXISTING CODE

// Function to create Total Count of Change ID by Month visualization
function createTotalChangeIDsChart(container, data) {
    // Group data by month
    const monthlyData = {};

    // Process dates and group by month
    data.forEach(item => {
        if (item.ActualStartDateTime) {
            // Format the date to get the month and year
            let date;
            if (item.ActualStartDateTime instanceof Date) {
                date = item.ActualStartDateTime;
            } else {
                date = new Date(item.ActualStartDateTime);
            }

            // Skip invalid dates
            if (isNaN(date.getTime())) {
                return;
            }

            // Format as 'Month YYYY'
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const monthYearKey = `${month} ${year}`;

            // Count changes for each month
            if (!monthlyData[monthYearKey]) {
                monthlyData[monthYearKey] = 0;
            }
            monthlyData[monthYearKey]++;
        }
    });

    // Convert to array and sort chronologically
    const sortedMonths = Object.keys(monthlyData).map(key => {
        const [month, year] = key.split(' ');
        return {
            key,
            count: monthlyData[key],
            date: new Date(`${month} 1, ${year}`),
            month,
            year
        };
    }).sort((a, b) => a.date - b.date);

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 100, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(sortedMonths.map(d => d.key))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedMonths, d => d.count) * 1.1])
        .range([chartHeight, 0]);

    // Draw bars
    svg.selectAll('.bar')
        .data(sortedMonths)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.key))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => chartHeight - y(d.count))
        .attr('fill', '#4169E1')
        .attr('opacity', 0.8);

    // Add value labels
    svg.selectAll('.value-label')
        .data(sortedMonths)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.key) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d.count);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Count of Change ID');

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + margin.bottom - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Month of Actual Start Date Time');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Total Count of Change ID by Month');

    // Add trend line
    if (sortedMonths.length > 1) {
        const lineGenerator = d3.line()
            .x(d => x(d.key) + x.bandwidth() / 2)
            .y(d => y(d.count))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(sortedMonths)
            .attr('fill', 'none')
            .attr('stroke', '#ff7f0e')
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);

        // Add markers for each data point on the line
        svg.selectAll('.point')
            .data(sortedMonths)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('cx', d => x(d.key) + x.bandwidth() / 2)
            .attr('cy', d => y(d.count))
            .attr('r', 4)
            .attr('fill', '#ff7f0e');
    }
}

// Function to create Customer Department Trends visualization 
function createDepartmentTrendsChart(container, data) {
    // Get unique departments
    const departments = [...new Set(data.map(item => item.CustomerDept))];

    // Group data by month and department
    const monthlyDeptData = {};

    // Process dates and group
    data.forEach(item => {
        if (item.ActualStartDateTime && item.CustomerDept) {
            // Format the date
            let date;
            if (item.ActualStartDateTime instanceof Date) {
                date = item.ActualStartDateTime;
            } else {
                date = new Date(item.ActualStartDateTime);
            }

            // Skip invalid dates
            if (isNaN(date.getTime())) {
                return;
            }

            // Format as 'Month YYYY'
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            const monthYearKey = `${month} ${year}`;

            // Initialize if needed
            if (!monthlyDeptData[monthYearKey]) {
                monthlyDeptData[monthYearKey] = {};
                departments.forEach(dept => {
                    monthlyDeptData[monthYearKey][dept] = 0;
                });
            }

            // Count changes
            monthlyDeptData[monthYearKey][item.CustomerDept]++;
        }
    });

    // Convert to array for d3 and sort chronologically
    const sortedMonths = Object.keys(monthlyDeptData).map(key => {
        const [month, year] = key.split(' ');
        return {
            key,
            deptCounts: monthlyDeptData[key],
            date: new Date(`${month} 1, ${year}`),
        };
    }).sort((a, b) => a.date - b.date);

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 500;
    const margin = { top: 50, right: 150, bottom: 100, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(sortedMonths.map(d => d.key))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(sortedMonths, d => {
            return d3.max(Object.values(d.deptCounts));
        }) * 1.1])
        .range([chartHeight, 0]);

    // Color scale for departments
    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(departments);

    // Create line generator
    const lineGenerator = d3.line()
        .x(d => x(d.month) + x.bandwidth() / 2)
        .y(d => y(d.count))
        .curve(d3.curveMonotoneX);

    // Draw a line for each department
    departments.forEach(dept => {
        // Filter and prepare data for this department
        const deptData = sortedMonths.map(month => ({
            month: month.key,
            count: month.deptCounts[dept] || 0
        }));

        // Draw the line
        svg.append('path')
            .datum(deptData)
            .attr('fill', 'none')
            .attr('stroke', color(dept))
            .attr('stroke-width', 2)
            .attr('d', lineGenerator);

        // Create a safe selector by replacing any problematic characters
        const safeSelector = `point-${dept.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Add points
        svg.selectAll(`.${safeSelector}`)
            .data(deptData)
            .enter()
            .append('circle')
            .attr('class', safeSelector)
            .attr('cx', d => x(d.month) + x.bandwidth() / 2)
            .attr('cy', d => y(d.count))
            .attr('r', 3)
            .attr('fill', color(dept));
    });

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Count of Change ID');

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + margin.bottom - 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Month of Actual Start Date Time');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Count of Change ID by Department and Month');

    // Add legend
    const legend = svg.selectAll('.legend')
        .data(departments)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${chartWidth + 20}, ${i * 20})`);

    legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => color(d));

    legend.append('text')
        .attr('x', 20)
        .attr('y', 7.5)
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .text(d => d);
}

// Function to create ChangeID Completion Time Distribution
function createCompletionTimeDistributionChart(container, data) {
    // Calculate completion time for each change
    const completionTimes = [];

    data.forEach(item => {
        if (item.ActualStartDateTime && item.ActualEndDateTime) {
            let startTime, endTime;

            // Parse dates if needed
            if (item.ActualStartDateTime instanceof Date) {
                startTime = item.ActualStartDateTime;
            } else {
                startTime = new Date(item.ActualStartDateTime);
            }

            if (item.ActualEndDateTime instanceof Date) {
                endTime = item.ActualEndDateTime;
            } else {
                endTime = new Date(item.ActualEndDateTime);
            }

            // Skip invalid dates
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                return;
            }

            // Calculate hours
            const hours = (endTime - startTime) / (1000 * 60 * 60);

            // Skip negative times and unreasonably large values (>168 hours = 1 week)
            if (hours > 0 && hours < 168) {
                completionTimes.push({
                    hours,
                    changeID: item.ChangeID,
                    dept: item.CustomerDept
                });
            }
        }
    });

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define histogram parameters
    const binCount = 20;
    const maxHours = d3.min([d3.max(completionTimes, d => d.hours), 72]); // Cap at 72 hours for better visualization

    // Create the bins (groups)
    const bins = d3.histogram()
        .domain([0, maxHours])
        .thresholds(binCount)
        .value(d => d.hours)(completionTimes);

    // Create scales
    const x = d3.scaleLinear()
        .domain([0, maxHours])
        .range([0, chartWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length) * 1.1])
        .range([chartHeight, 0]);

    // Draw bars
    svg.selectAll('.bar')
        .data(bins)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0))
        .attr('width', d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr('y', d => y(d.length))
        .attr('height', d => chartHeight - y(d.length))
        .attr('fill', '#4169E1')
        .attr('opacity', 0.7);

    // Calculate statistics with null checks
    const avgTime = d3.mean(completionTimes, d => d.hours) || 0;
    const medianTime = d3.median(completionTimes, d => d.hours) || 0;


    if (avgTime !== undefined && avgTime !== null) {
        svg.append('line')
            .attr('x1', x(avgTime))
            .attr('x2', x(avgTime))
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', 'red')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        svg.append('text')
            .attr('x', x(avgTime))
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'red')
            .text(`Mean: ${avgTime.toFixed(1)} hrs`);
    }

    // Add median line (only if there's a valid medianTime)
    if (medianTime !== undefined && medianTime !== null) {
        svg.append('line')
            .attr('x1', x(medianTime))
            .attr('x2', x(medianTime))
            .attr('y1', 0)
            .attr('y2', chartHeight)
            .attr('stroke', 'green')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        svg.append('text')
            .attr('x', x(medianTime))
            .attr('y', 40)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'green')
            .text(`Median: ${medianTime.toFixed(1)} hrs`);
    }

    // Add mean line
    svg.append('line')
        .attr('x1', x(avgTime))
        .attr('x2', x(avgTime))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    svg.append('text')
        .attr('x', x(avgTime))
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'red')
        .text(`Mean: ${avgTime.toFixed(1)} hrs`);

    // Add median line
    svg.append('line')
        .attr('x1', x(medianTime))
        .attr('x2', x(medianTime))
        .attr('y1', 0)
        .attr('y2', chartHeight)
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5');

    svg.append('text')
        .attr('x', x(medianTime))
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'green')
        .text(`Median: ${medianTime.toFixed(1)} hrs`);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).tickFormat(d => `${d} hrs`));

    svg.append('g')
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Number of Changes');

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Completion Time (hours)');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(`Distribution of Change Completion Times (${completionTimes.length} Changes)`);
}

// Function to create Work Type Distribution chart
function createWorkTypeDistributionChart(container, data) {
    // Get work type data (using OpCat1 field)
    const workTypes = {};

    data.forEach(item => {
        if (item.OpCat1) {
            const workType = item.OpCat1;
            workTypes[workType] = (workTypes[workType] || 0) + 1;
        }
    });

    // Convert to array and sort by count
    const workTypeData = Object.entries(workTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    // Set dimensions and margins
    const width = container.clientWidth;
    const height = 400;
    const margin = { top: 50, right: 50, bottom: 150, left: 70 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const x = d3.scaleBand()
        .domain(workTypeData.map(d => d.type))
        .range([0, chartWidth])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(workTypeData, d => d.count) * 1.1])
        .range([chartHeight, 0]);

    // Color scale based on work type
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(workTypeData.map(d => d.type));

    // Draw bars
    svg.selectAll('.bar')
        .data(workTypeData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.type))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => chartHeight - y(d.count))
        .attr('fill', d => colorScale(d.type))
        .attr('opacity', 0.8);

    // Add value labels
    svg.selectAll('.value-label')
        .data(workTypeData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => x(d.type) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .text(d => d.count);

    // Calculate percentages
    const total = workTypeData.reduce((sum, item) => sum + item.count, 0);

    // Add percentage labels
    svg.selectAll('.percent-label')
        .data(workTypeData)
        .enter()
        .append('text')
        .attr('class', 'percent-label')
        .attr('x', d => x(d.type) + x.bandwidth() / 2)
        .attr('y', d => y(d.count) + 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'white')
        .text(d => `${((d.count / total) * 100).toFixed(1)}%`);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('g')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .style('font-size', '12px');

    // Add axis labels
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -chartHeight / 2)
        .attr('y', -40)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Number of Changes');

    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', chartHeight + 60)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Work Type (OpCat1)');

    // Add title
    svg.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Distribution of Changes by Work Type');
}

// Modify the initializeAnalysis function to add the new visualizations
// Copy this function and add it to your code
function initializeExtendedAnalysis(data) {
    // Create a new tab section for additional visualizations
    const appContainer = document.getElementById('app-container');

    // Debug information
    console.log("Extended analysis started with", data ? data.length : 0, "records");

    // Check if required elements exist
    const totalChangeChart = document.getElementById('total-change-chart');
    const deptTrendsChart = document.getElementById('dept-trends-chart');
    console.log("Chart containers exist:", !!totalChangeChart, !!deptTrendsChart);

    // Check if extended analysis tab already exists
    if (!document.getElementById('extended-tab')) {
        // Add a new tab button
        const tabsButtons = document.querySelector('.tabs');
        const extendedTabButton = document.createElement('button');
        extendedTabButton.className = 'tab-button';
        extendedTabButton.dataset.tab = 'extended';
        extendedTabButton.id = 'extended-tab';
        extendedTabButton.textContent = 'Extended Analysis';
        tabsButtons.appendChild(extendedTabButton);

        // Add tab click event
        extendedTabButton.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            extendedTabButton.classList.add('active');
            document.getElementById('extended-content').classList.add('active');
        });

        // Add new content section
        const contentSection = document.querySelector('.content-section');
        const extendedContent = document.createElement('div');
        extendedContent.id = 'extended-content';
        extendedContent.className = 'tab-content';

        // Structure for the visualizations with explicit widths
        extendedContent.innerHTML = `
      <div class="chart-section">
        <h3>Total Change IDs Over Time</h3>
        <div id="total-change-chart" class="chart-container" style="width:100%; min-height:400px;"></div>
      </div>
      
      <div class="chart-section">
        <h3>Department Trends</h3>
        <div id="dept-trends-chart" class="chart-container" style="width:100%; min-height:400px;"></div>
      </div>
      
      <div class="chart-section">
        <h3>Completion Time Analysis</h3>
        <div id="completion-time-chart" class="chart-container" style="width:100%; min-height:400px;"></div>
      </div>
      
      <div class="chart-section">
        <h3>Work Type Distribution</h3>
        <div id="work-type-chart" class="chart-container" style="width:100%; min-height:400px;"></div>
      </div>
    `;

        contentSection.appendChild(extendedContent);
    }

    // Create the visualizations safely with a slight delay to ensure DOM is ready
    setTimeout(() => {
        try {
            const totalChangeContainer = document.getElementById('total-change-chart');
            const deptTrendsContainer = document.getElementById('dept-trends-chart');
            const completionTimeContainer = document.getElementById('completion-time-chart');
            const workTypeContainer = document.getElementById('work-type-chart');

            // Set default width if needed
            if (totalChangeContainer && !totalChangeContainer.clientWidth) totalChangeContainer.style.width = '800px';
            if (deptTrendsContainer && !deptTrendsContainer.clientWidth) deptTrendsContainer.style.width = '800px';
            if (completionTimeContainer && !completionTimeContainer.clientWidth) completionTimeContainer.style.width = '800px';
            if (workTypeContainer && !workTypeContainer.clientWidth) workTypeContainer.style.width = '800px';

            if (totalChangeContainer) createTotalChangeIDsChart(totalChangeContainer, data);
            if (deptTrendsContainer) createDepartmentTrendsChart(deptTrendsContainer, data);
            if (completionTimeContainer) createCompletionTimeDistributionChart(completionTimeContainer, data);
            if (workTypeContainer) createWorkTypeDistributionChart(workTypeContainer, data);

            console.log("All charts created successfully");
        } catch (error) {
            console.error("Error creating charts:", error);
        }
    }, 500); // Half-second delay to ensure DOM is ready
}


// Add this function to your code
function safeCreateChart(containerId, createFunction, data) {
    // Wait a short time to ensure DOM is fully created
    setTimeout(() => {
        const container = document.getElementById(containerId);

        if (!container) {
            console.error(`Chart container ${containerId} does not exist`);
            return;
        }

        // Ensure the container has a width
        if (!container.clientWidth) {
            container.style.width = '100%';
            container.style.minHeight = '400px';
        }

        try {
            createFunction(container, data);
            console.log(`Successfully created chart in ${containerId}`);
        } catch (error) {
            console.error(`Error creating chart in ${containerId}:`, error);
        }
    }, 100);
}

// Add this at the end of your app.js file
function debugExtendedAnalysis() {
    console.log("=== DEBUG: Extended Analysis ===");

    // Check if the function exists
    console.log("initializeExtendedAnalysis function exists:", typeof initializeExtendedAnalysis === 'function');

    // Check if the tab containers exist
    const tabsContainer = document.querySelector('.tabs');
    console.log("Tabs container exists:", !!tabsContainer);

    const contentSection = document.querySelector('.content-section');
    console.log("Content section exists:", !!contentSection);

    // Check if the extended tab exists
    const extendedTab = document.getElementById('extended-tab');
    console.log("Extended tab exists:", !!extendedTab);

    // Check if the extended content exists
    const extendedContent = document.getElementById('extended-content');
    console.log("Extended content exists:", !!extendedContent);

    // Try to manually create the extended tab if it doesn't exist
    if (!extendedTab && tabsContainer) {
        console.log("Creating extended tab manually");
        const extendedTabButton = document.createElement('button');
        extendedTabButton.className = 'tab-button';
        extendedTabButton.dataset.tab = 'extended';
        extendedTabButton.id = 'extended-tab';
        extendedTabButton.textContent = 'Extended Analysis';
        tabsContainer.appendChild(extendedTabButton);

        // Add click event
        extendedTabButton.addEventListener('click', () => {
            // Remove active class from all buttons and content
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            extendedTabButton.classList.add('active');

            // Create content if it doesn't exist
            if (!extendedContent && contentSection) {
                console.log("Creating extended content manually");
                const newContent = document.createElement('div');
                newContent.id = 'extended-content';
                newContent.className = 'tab-content';

                // Structure for visualizations
                newContent.innerHTML = `
          <div class="chart-section">
            <h3>Total Change IDs Over Time</h3>
            <div id="total-change-chart" class="chart-container"></div>
          </div>
          
          <div class="chart-section">
            <h3>Department Trends</h3>
            <div id="dept-trends-chart" class="chart-container"></div>
          </div>
          
          <div class="chart-section">
            <h3>Completion Time Analysis</h3>
            <div id="completion-time-chart" class="chart-container"></div>
          </div>
          
          <div class="chart-section">
            <h3>Work Type Distribution</h3>
            <div id="work-type-chart" class="chart-container"></div>
          </div>
        `;

                contentSection.appendChild(newContent);
                newContent.classList.add('active');

                // Try to populate with data if available
                if (globalData && globalData.length > 0) {
                    console.log("Attempting to create visualizations with global data");
                    try {
                        createTotalChangeIDsChart(document.getElementById('total-change-chart'), globalData);
                        createDepartmentTrendsChart(document.getElementById('dept-trends-chart'), globalData);
                        createCompletionTimeDistributionChart(document.getElementById('completion-time-chart'), globalData);
                        createWorkTypeDistributionChart(document.getElementById('work-type-chart'), globalData);
                        console.log("Visualizations created successfully");
                    } catch (error) {
                        console.error("Error creating visualizations:", error);
                    }
                } else {
                    console.log("No global data available for visualizations");
                }
            } else if (extendedContent) {
                extendedContent.classList.add('active');
            }
        });

        console.log("Extended tab created manually");
    }
}

// Call the debug function when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, calling debug function");
    setTimeout(debugExtendedAnalysis, 1000);
});

// Add manual trigger button
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    if (appContainer) {
        const debugButton = document.createElement('button');
        debugButton.textContent = 'Debug Extended Analysis';
        debugButton.style.position = 'fixed';
        debugButton.style.bottom = '10px';
        debugButton.style.right = '10px';
        debugButton.style.zIndex = '9999';
        debugButton.addEventListener('click', () => {
            debugExtendedAnalysis();
            if (globalData && globalData.length > 0) {
                initializeExtendedAnalysis(globalData);
            } else {
                console.log("No global data available");
            }
        });
        document.body.appendChild(debugButton);
    }
});
// Add this function to your app.js file (at the end)
function createStandaloneCharts() {
    // Create a container div for the charts
    const chartsContainer = document.createElement('div');
    chartsContainer.className = 'container';
    chartsContainer.innerHTML = `
        <h1>Southern Company UA Innovate 2025 Data Visualization</h1>
        
        <!-- Chart 1: Customer Department Count of Change ID -->
        <div class="chart-container">
            <div class="chart-title">Customer Department Count of Change ID by Month</div>
            <div class="chart-content">
                <canvas id="departmentChart"></canvas>
            </div>
            <div class="chart-legend" id="departmentLegend"></div>
        </div>

        <!-- Chart 3: Ticket Count by Month -->
        <div class="chart-container">
            <div class="chart-title">Number of Tickets by Month</div>
            <div class="chart-content">
                <canvas id="ticketsChart"></canvas>
            </div>
        </div>

        <!-- Chart 4: Change in % of Tickets by Work Type -->
        <div class="chart-container">
            <div class="chart-title">Change in % of Tickets by Work Type (2024 vs 2023)</div>
            <div class="chart-content">
                <canvas id="workTypeChart"></canvas>
            </div>
        </div>

        <!-- Chart 5: Department Performance Bubble Chart -->
        <div class="chart-container">
            <div class="chart-title">Department Performance: Complexity vs. Efficiency</div>
            <div class="chart-content">
                <canvas id="bubbleChart"></canvas>
            </div>
        </div>
    `;

    // Add the container to the page
    document.body.appendChild(chartsContainer);

    // Add CSS for these charts
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .container {
            display: flex;
            flex-direction: column;
            gap: 30px;
            max-width: 1200px;
            margin: 30px auto;
            padding: 20px;
        }
        .chart-container {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }
        .chart-content {
            position: relative;
            height: 400px;
            width: 100%;
        }
        .chart-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 15px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            font-size: 14px;
        }
        .legend-color {
            width: 15px;
            height: 15px;
            margin-right: 5px;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(styleElement);

    // Mock data definitions (same as in your provided code)
    // Months for x-axis
    const months = [
        'January 2023', 'February 2023', 'March 2023', 'April 2023', 'May 2023', 'June 2023',
        'July 2023', 'August 2023', 'September 2023', 'October 2023', 'November 2023', 'December 2023',
        'January 2024', 'February 2024', 'March 2024', 'April 2024', 'May 2024', 'June 2024',
        'July 2024', 'August 2024', 'September 2024', 'October 2024', 'November 2024', 'December 2024',
        'January 2025'
    ];

    // Chart 1: Department Change ID data
    const departmentData = {
        'NW RAN OPS': [1, 2, 2, 2, 1, 1, 2, 3, 3, 4, 2, 1, 1, 15, 10, 5, 3, 2, 3, 4, 5, 3, 2, 1, 2],
        'RAN OPERATIONS': [3, 2, 3, 10, 12, 7, 5, 4, 5, 6, 5, 3, 1, 9, 18, 17, 3, 2, 3, 11, 8, 5, 4, 3, 8],
        'SE RAN OPS': [2, 7, 10, 12, 10, 7, 7, 8, 9, 15, 12, 11, 10, 11, 12, 14, 13, 10, 9, 11, 10, 7, 5, 2, 10],
        'TELECOM AGGREGATION': [3, 10, 12, 10, 8, 7, 6, 9, 13, 12, 6, 5, 4, 7, 9, 12, 23, 18, 9, 5, 4, 5, 3, 2, 2],
        'TELECOM CORE SERVICES': [1, 4, 10, 24, 15, 12, 7, 6, 9, 13, 14, 6, 11, 11, 12, 11, 10, 8, 10, 19, 17, 12, 4, 2, 3],
        'TELECOM EDGE SERVICES': [1, 3, 7, 10, 20, 15, 5, 4, 5, 5, 4, 5, 6, 8, 10, 14, 12, 8, 1, 2, 5, 4, 3, 3, 3]
    };

    // Chart 3: Tickets data
    const ticketsData = [
        18, 39, 46, 69, 60, 58, 60, 36, 33, 45, 49, 90, 85, 49, 63, 65, 67, 57, 39, 38, 54, 55, 66, 68, 38
    ];

    // Chart 4: Work Type YoY Change data
    const workTypeData = {
        'Migrate': -4.5,
        'Repair': -3.8,
        'Install': -0.5,
        'Upgrade/Modify': 0.7,
        'Remove/Retire': 10
    };

    // Chart 5: Department Performance Bubble Chart data
    const bubbleData = [
        { x: 0.8, y: 1.0, r: 20, label: 'NW RAN OPS' },
        { x: 1.2, y: 1.1, label: 'RAN OPERATIONS', r: 35 },
        { x: 0.8, y: 1.2, label: 'SE RAN OPS', r: 30 },
        { x: 2.1, y: 1.0, label: 'ORDER OPERATIONS', r: 25 },
        { x: 1.7, y: 1.1, label: 'CORE NETWORK ENGINEERING', r: 45 },
        { x: 3.1, y: 1.8, label: 'FO SW PROJECTS', r: 15 },
        { x: 3.8, y: 1.4, label: 'FO AL FIBER DISTRIBUTION', r: 30 },
        { x: 1.7, y: 1.7, label: 'FO AL LONG HAUL FIBER', r: 25 },
        { x: 0.9, y: 2.1, label: 'FO NE OPERATIONS', r: 20 },
        { x: 1.8, y: 1.6, label: 'TECH INFRASTRUCTURE ENGR', r: 25 },
        { x: 2.2, y: 1.7, label: 'FO SE OPERATIONS', r: 35 },
        { x: 1.5, y: 1.9, label: 'FO SE PROJECTS', r: 18 },
        { x: 3.1, y: 2.0, label: 'TELECOM EDGE SERVICES', r: 30 },
        { x: 3.5, y: 2.0, label: 'TELECOM AGGREGATE SERVICES', r: 35 },
        { x: 3.9, y: 3.1, label: 'STARS', r: 50 }
    ];

    // Colors for the first chart
    const departmentColors = {
        'NW RAN OPS': '#8B4513',
        'RAN OPERATIONS': '#CD853F',
        'SE RAN OPS': '#32CD32',
        'TELECOM AGGREGATION': '#006400',
        'TELECOM CORE SERVICES': '#5F9EA0',
        'TELECOM EDGE SERVICES': '#D2691E'
    };

    // Create all charts from your code
    createDepartmentChart();
    createTicketsChart();
    createWorkTypeChart();
    createBubbleChart();

    // All the chart functions (copied from your code)
    function createDepartmentChart() {
        const ctx = document.getElementById('departmentChart').getContext('2d');

        const datasets = Object.keys(departmentData).map(dept => {
            return {
                label: dept,
                data: departmentData[dept],
                borderColor: departmentColors[dept],
                backgroundColor: departmentColors[dept],
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: false
            };
        });

        const departmentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count of Change ID'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month of Actual Start Date Time'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });

        // Create custom legend
        const legendDiv = document.getElementById('departmentLegend');
        Object.keys(departmentColors).forEach(dept => {
            const item = document.createElement('div');
            item.className = 'legend-item';

            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = departmentColors[dept];

            const label = document.createElement('span');
            label.textContent = dept;

            item.appendChild(colorBox);
            item.appendChild(label);
            legendDiv.appendChild(item);
        });
    }

    function createTicketsChart() {
        const ctx = document.getElementById('ticketsChart').getContext('2d');

        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(178, 34, 34, 1)');
        gradientFill.addColorStop(0.5, 'rgba(255, 69, 0, 1)');
        gradientFill.addColorStop(1, 'rgba(50, 205, 50, 1)');

        const ticketsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Number of Tickets',
                    data: ticketsData,
                    borderColor: gradientFill,
                    backgroundColor: 'rgba(255, 69, 0, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 2,
                    pointHoverRadius: 6,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Tickets'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month of Actual Start Date Time'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const month = context.label;
                                const value = context.raw;

                                if (month === 'October 2023') {
                                    return [
                                        `Number of Tickets: ${value}`,
                                        `% Increase in Tickets for poor TT: 400.0%`
                                    ];
                                }

                                return `Number of Tickets: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    function createWorkTypeChart() {
        const ctx = document.getElementById('workTypeChart').getContext('2d');

        // Sort by value
        const sortedTypes = Object.keys(workTypeData).sort((a, b) =>
            workTypeData[a] - workTypeData[b]
        );

        const values = sortedTypes.map(type => workTypeData[type]);

        // Create color scale based on values
        const colors = values.map(value => {
            if (value < 0) {
                // Red gradient for negative
                const intensity = Math.min(1, Math.abs(value) / 5);
                return `rgba(${205 + intensity * 50}, ${92 - intensity * 92}, ${92 - intensity * 92}, 0.7)`;
            } else {
                // Blue gradient for positive
                const intensity = Math.min(1, value / 10);
                return `rgba(${100 - intensity * 70}, ${149 - intensity * 100}, ${237}, 0.7)`;
            }
        });

        const workTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedTypes,
                datasets: [{
                    label: 'YoY Change (%)',
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        title: {
                            display: true,
                            text: 'YoY Change (%)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Work Type (OpCat1)'
                        }
                    }
                }
            }
        });
    }

    function createBubbleChart() {
        // Create container
        const container = document.createElement('div');
        container.style.width = '1000px';
        container.style.height = '800px';
        container.style.margin = '20px auto';
        container.style.backgroundColor = 'white';
        container.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        container.style.borderRadius = '8px';

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'bubbleChart';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        container.appendChild(canvas);

        // Add to document
        document.body.appendChild(container);

        // Exact bubble chart data matching reference image
        const bubbleData = [
            { x: 1.8, y: 1.0, r: 15, label: 'NW RAN OPS' },
            { x: 2.4, y: 1.1, r: 12, label: 'RAN OPERATIONS' },
            { x: 2.2, y: 1.2, r: 15, label: 'SE RAN OPS' },
            { x: 2.8, y: 1.02, r: 8, label: 'MSO-CPC OPERATIONS' },
            { x: 2.8, y: 1.1, r: 8, label: 'CORE NETWORK ENGINEERING' },
            { x: 2.0, y: 2.1, r: 8, label: 'FO NE OPERATIONS' },
            { x: 2.4, y: 1.35, r: 12, label: 'FO AL FIBER TO DISTRIBUTION' },
            { x: 2.2, y: 1.5, r: 18, label: 'FO AL LONG HAUL FIBER' },
            { x: 2.1, y: 2.15, r: 12, label: 'FO AL OPERATIONS' },
            { x: 2.2, y: 1.7, r: 15, label: 'TECH INFRASTRUCTURE ENGR' },
            { x: 2.25, y: 1.75, r: 12, label: 'FO SE OPERATIONS' },
            { x: 2.4, y: 1.6, r: 12, label: 'FO NE PROJECTS' },
            { x: 2.4, y: 2.0, r: 15, label: 'TELECOM EDGE SERVICES' },
            { x: 2.4, y: 1.9, r: 25, label: 'TELECOM AGGREGATE SERVICES' },
            { x: 2.2, y: 3.2, r: 12, label: 'STI' },
            { x: 2.0, y: 1.02, r: 6, label: 'FO SW PROJECTS' },
            { x: 2.4, y: 1.7, r: 15, label: 'TELECOM CORE SERVICES' },
            { x: 2.3, y: 1.7, r: 12, label: 'FO GA LONG HAUL FIBER' },
            { x: 2.2, y: 1.6, r: 8, label: 'FO GA OPERATIONS' }
        ];

        // Create the chart - using the exact styling from reference image
        const ctx = document.getElementById('bubbleChart').getContext('2d');

        // Advanced color function matching the gradient in the reference image
        const getColor = (x, y) => {
            // Calculate Complexity Efficiency Index (CEI)
            const cei = Math.min(7, Math.max(1, Math.round((x + y) * 1.5)));

            // Color scale from purple (low) to yellow (high) matching the color scale
            const colors = [
                [89, 13, 95],    // Deep Purple (1)
                [65, 39, 140],   // Purple (2)
                [45, 72, 155],   // Blue (3)
                [38, 115, 137],  // Teal (4)
                [57, 141, 105],  // Green (5)
                [129, 186, 90],  // Light Green (6)
                [231, 231, 91]   // Yellow (7)
            ];

            return `rgb(${colors[cei - 1].join(',')})`;
        };

        const bubbleChart = new Chart(ctx, {
            type: 'bubble',
            data: {
                datasets: [{
                    label: 'Department Performance',
                    data: bubbleData.map(item => ({
                        x: item.x,
                        y: item.y,
                        r: item.r / 2.5, // Scale bubble sizes appropriately
                        originalR: item.r,
                        label: item.label
                    })),
                    backgroundColor: bubbleData.map(item => getColor(item.x, item.y)),
                    borderColor: '#ffffff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 20,
                        right: 80, // Add extra padding for legend
                        top: 40,
                        bottom: 20
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Department Performance: Complexity vs. Efficiency',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'start',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 11
                            },
                            generateLabels: function () {
                                return [
                                    { text: '5 Changes', fillStyle: 'rgb(89, 13, 95)', hidden: false, pointStyle: 'circle' },
                                    { text: '25 Changes', fillStyle: 'rgb(45, 72, 155)', hidden: false, pointStyle: 'circle' },
                                    { text: '50 Changes', fillStyle: 'rgb(57, 141, 105)', hidden: false, pointStyle: 'circle' },
                                    { text: '100 Changes', fillStyle: 'rgb(231, 231, 91)', hidden: false, pointStyle: 'circle' }
                                ];
                            }
                        },
                        title: {
                            display: true,
                            text: 'Number of Changes',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const item = context.raw;
                                return [
                                    `Department: ${item.label}`,
                                    `Complexity: ${item.x.toFixed(1)}`,
                                    `Efficiency: ${item.y.toFixed(1)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 1.0,
                        max: 3.5,
                        ticks: {
                            stepSize: 0.5,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        },
                        title: {
                            display: true,
                            text: 'Average Task Complexity',
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10,
                                bottom: 10
                            }
                        },
                        border: {
                            display: true
                        }
                    },
                    y: {
                        type: 'linear',
                        min: 0.5,
                        max: 3.5,
                        ticks: {
                            stepSize: 0.5,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)',
                            lineWidth: 1
                        },
                        title: {
                            display: true,
                            text: 'Average Efficiency Ratio (>1 is good)',
                            font: {
                                size: 13,
                                weight: 'bold'
                            },
                            padding: {
                                top: 0,
                                bottom: 10
                            }
                        },
                        border: {
                            display: true
                        }
                    }
                }
            },
            plugins: [{
                id: 'customCanvasBackgroundColor',
                beforeDraw: (chart) => {
                    const ctx = chart.canvas.getContext('2d');
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-over';
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, chart.width, chart.height);
                    ctx.restore();
                }
            }]
        });

        // Add custom elements after chart rendering
        setTimeout(() => {
            try {
                if (bubbleChart.scales) {
                    const ctx = bubbleChart.ctx;

                    // 1. Add division lines (dashed) at x=2.2 and y=1.7
                    const xMiddle = bubbleChart.scales.x.getPixelForValue(2.2);
                    const yMiddle = bubbleChart.scales.y.getPixelForValue(1.7);
                    const xStart = bubbleChart.scales.x.getPixelForValue(bubbleChart.scales.x.min);
                    const xEnd = bubbleChart.scales.x.getPixelForValue(bubbleChart.scales.x.max);
                    const yStart = bubbleChart.scales.y.getPixelForValue(bubbleChart.scales.y.min);
                    const yEnd = bubbleChart.scales.y.getPixelForValue(bubbleChart.scales.y.max);

                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.setLineDash([6, 6]);

                    // Horizontal line
                    ctx.beginPath();
                    ctx.moveTo(xStart, yMiddle);
                    ctx.lineTo(xEnd, yMiddle);
                    ctx.stroke();

                    // Vertical line
                    ctx.beginPath();
                    ctx.moveTo(xMiddle, yStart);
                    ctx.lineTo(xMiddle, yEnd);
                    ctx.stroke();

                    ctx.setLineDash([]);

                    // 2. Add quadrant labels with boxes
                    const quadrants = [
                        {
                            x: 1.95,
                            y: 1.25,
                            text: ['Low Complexity', 'Low Efficiency', '(UNDERPERFORMING)'],
                            boxWidth: 140,
                            boxHeight: 60
                        },
                        {
                            x: 2.55,
                            y: 1.25,
                            text: ['High Complexity', 'Low Efficiency', '(CHALLENGED)'],
                            boxWidth: 140,
                            boxHeight: 60
                        },
                        {
                            x: 1.95,
                            y: 2.3,
                            text: ['Low Complexity', 'High Efficiency', '(EFFICIENT)'],
                            boxWidth: 140,
                            boxHeight: 60
                        },
                        {
                            x: 2.55,
                            y: 2.3,
                            text: ['High Complexity', 'High Efficiency', '(STARS)'],
                            boxWidth: 140,
                            boxHeight: 60
                        }
                    ];

                    quadrants.forEach(q => {
                        const canvasX = bubbleChart.scales.x.getPixelForValue(q.x);
                        const canvasY = bubbleChart.scales.y.getPixelForValue(q.y);

                        // Draw box with slight background
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.fillRect(
                            canvasX - q.boxWidth / 2,
                            canvasY - q.boxHeight / 2,
                            q.boxWidth,
                            q.boxHeight
                        );

                        ctx.strokeStyle = '#000';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(
                            canvasX - q.boxWidth / 2,
                            canvasY - q.boxHeight / 2,
                            q.boxWidth,
                            q.boxHeight
                        );

                        // Draw text
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#000';

                        q.text.forEach((line, i) => {
                            if (i === 2) {
                                // Parenthetical text in bold
                                ctx.font = 'bold 11px Arial';
                            } else {
                                ctx.font = '12px Arial';
                            }

                            ctx.fillText(
                                line,
                                canvasX,
                                canvasY - 15 + i * 15
                            );
                        });
                    });

                    // 3. Add department labels
                    bubbleChart.data.datasets[0].data.forEach((point, i) => {
                        const label = point.label;
                        const position = bubbleChart.getDatasetMeta(0).data[i].getCenterPoint();

                        // All departments have labels in reference image
                        ctx.font = '9px Arial';
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        // Position labels above bubbles with appropriate spacing
                        const labelOffsetY = point.r * 2 + 3;
                        ctx.fillText(label, position.x, position.y - labelOffsetY);
                    });

                    // 4. Add color gradient legend
                    const legendWidth = 20;
                    const legendHeight = 200;
                    const legendX = bubbleChart.width - 50;
                    const legendY = 100;

                    // Create gradient
                    const gradient = ctx.createLinearGradient(
                        legendX,
                        legendY + legendHeight,
                        legendX,
                        legendY
                    );

                    gradient.addColorStop(0.0, 'rgb(89, 13, 95)');  // Deep Purple (1)
                    gradient.addColorStop(0.17, 'rgb(65, 39, 140)'); // Purple (2)
                    gradient.addColorStop(0.33, 'rgb(45, 72, 155)');  // Blue (3) 
                    gradient.addColorStop(0.5, 'rgb(38, 115, 137)'); // Teal (4)
                    gradient.addColorStop(0.67, 'rgb(57, 141, 105)'); // Green (5)
                    gradient.addColorStop(0.83, 'rgb(129, 186, 90)'); // Light Green (6)
                    gradient.addColorStop(1.0, 'rgb(231, 231, 91)'); // Yellow (7)

                    // Draw gradient rectangle
                    ctx.fillStyle = gradient;
                    ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

                    // Draw border
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

                    // Add labels
                    ctx.fillStyle = '#000';
                    ctx.textAlign = 'left';
                    ctx.font = '10px Arial';

                    // Evenly spaced labels
                    const labelCount = 7;
                    const spacing = legendHeight / (labelCount - 1);

                    for (let i = 0; i < labelCount; i++) {
                        const value = 7 - i;
                        const y = legendY + i * spacing;
                        ctx.fillText(value.toString(), legendX + legendWidth + 5, y + 3);
                    }

                    // Draw title for legend
                    ctx.save();
                    ctx.translate(legendX - 15, legendY + legendHeight / 2);
                    ctx.rotate(-Math.PI / 2);
                    ctx.textAlign = 'center';
                    ctx.font = '11px Arial';
                    ctx.fillText('Complexity Efficiency Index (CEI)', 0, 0);
                    ctx.restore();
                }
            } catch (error) {
                console.error("Error adding custom elements to chart:", error);
            }
        }, 300);
    }
}

// Call this function when you want to display the standalone charts
// For example, at the end of your initApp or when a specific button is clicked
document.addEventListener('DOMContentLoaded', function () {
    // Wait for your app to initialize first
    setTimeout(createStandaloneCharts, 1000);
});


