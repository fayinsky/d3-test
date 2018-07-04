/* cat section */

var cat_image = document.getElementById('cat_img');
var feed_button = document.getElementById('feed_cat_button')
cat_image.addEventListener('click', meow);
feed_button.addEventListener('click', feed);

function meow() {
	console.log('meow!');
}

function feed() {
	cat_image.style.height = cat_image.offsetHeight + 'px';
	cat_image.style.width = (cat_image.offsetWidth + 30) + 'px';
}

/* d3 section */
var nation_json_url = "https://raw.githubusercontent.com/MQ-software-carpentry/D3-visualising-data/gh-pages/code/nations.json"
d3.json(nation_json_url)
	.then( function (nations) {
		console.table(nations);
		nations.map( function (nation) {
			last_one = nation.income.length - 1
			console.log(nation.name, nation.income[last_one], nation.years[last_one]);
		} );
		
		// set up svg charting area
		var chart = d3.select('#svg_div');
		var svg = chart.append('svg');
		
		var g = svg.append('g'); // a group tag so that elements within can be adjusted together
		var margin = {top: 20, left: 80, bottom: 80, right: 20};
		var width = 960;
		var height = 350;
		var g_width = width - margin.left - margin.right;
		var g_height = height - margin.top - margin.bottom;
		
		svg.attr('width', width);
		svg.attr('height', height);
		
		g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		
		// get data range
		var incomes = []; // to save flattened incomes
		var life_expectencies = []
		var populations = []
		var regions = [
			"Sub-Saharan Africa",
			"South Asia",
			"Middle East & North Africa",
			"America",
			"Europe & Central Asia",
			"East Asia & Pacific"
		]; // should be part of the loop but locate unique values
		nations.map( function (nation) {
			incomes = incomes.concat(nation.income);
			life_expectencies = life_expectencies.concat(nation.lifeExpectancy);
			populations = populations.concat(nation.population);
		} );
		
		// data control
		var controls = d3.select('#controls');
		regions.map ( function (r) {
			var div = controls.append('div');
			div.append('input')
			   .attr('type', 'checkbox')
			   .attr('value', r)
			   .attr('checked', true);
			div.append('label')
			   .text(r);
		} );
		var filtered_nations = nations.map( function (n) { return n; } );
		d3.selectAll('input').on('change', function () {
			var region = this.value;
			if (this.checked) {
				var new_nations = nations.filter( function (nation) {
					return nation.region == region;
				} );
				filtered_nations = filtered_nations.concat(new_nations)
			} else {
				filtered_nations = filtered_nations.filter( function (nation) {
					return nation.region != region;
				} );
				// console.log(this.value);
				console.table(filtered_nations);
			}	
			update();
		} );
		// x axis
		var xScale = d3.scaleLog().domain(d3.extent(incomes)).range([0, g_width]);
		var xAxis = d3.axisBottom(xScale)
					  .ticks(10, ',.0f');
		g.append('g')
		 .attr('class', 'x axis')
		 .attr('transform', 'translate(0, ' + g_height + ')')
		 .call(xAxis);
		g.append('text')
		 .text('Income per capita (dollars)')
		 .attr('class', 'axis')
		 .attr('x', g_width / 2)
		 .attr('y', g_height + 40)
		// y axis
		var yScale = d3.scaleLinear().domain(d3.extent(life_expectencies)).range([g_height, 0]);
		var yAxis = d3.axisLeft(yScale);
		g.append('g')
		 .attr('class', 'y axis')
		 .call(yAxis);
		g.append('text')
		 .text('Life Expentancy (years)')
		 .attr('class', 'axis')
		 .attr('transform', 'translate(-40,' + (g_height / 2 + 80) + ') rotate(-90)')
		 .attr('x', 0)
		 .attr('y', 0)
		// radius scale (to transform circle radius)
		var rScale = d3.scaleSqrt().domain(d3.extent(populations)).range([0, 40]);
		// colour scale for regions
		var regionScale = d3.scaleOrdinal(d3.schemeCategory10);
		 
		function update() { 
			// circles
			var circles = g.selectAll('.circle')
						   .data(filtered_nations, function (d) { return d.name; } );
			circles.enter() // expecting an array, iterate throw each row
				.append('circle')
				.attr('class', 'circle')
				.attr('cx', function (d) { return xScale(d.income[d.income.length - 1]) })
				.attr('cy', function (d) { return yScale(d.lifeExpectancy[d.lifeExpectancy.length - 1]) })
				.attr('r', function (d) { return rScale(d.population[d.population.length - 1]) })
				.attr('fill', function (d) {return regionScale(d.region)} )
				.attr('stroke', 'black')
				.attr('stroke-width', '1');
			
			circles.exit().remove();
		};
		update();
	} )
	.catch( function (err) {
		console.log(err);
	} );