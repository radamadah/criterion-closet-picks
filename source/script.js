function run(jason){
	var jason = preprocessData(jason);
	[
		Title(),
		ChartView(jason),
		OverView(jason),
		DirectorListView(jason), CountryListView(jason),
		VisitListView(jason), MovieListView(jason),
		FooterView()
	].forEach(function(o){ document.body.appendChild(o) });
}
function ListView(items, title, isValidFunc, listItemNumFunc, listItemNameFunc, listItemPopupFunc, sortFuncMap){
	var element = document.createElement('data');
	element.appendChild(document.createElement('h2')).innerHTML = title + ' <small>sort by </small>';
	let DOMList = element.appendChild(document.createElement('ol'));
	var DOMDetails = DOMList.getElementsByTagName('detail');
	var DOMButtons = DOMList.getElementsByTagName('button');
	let sortButtonsContainer = element.getElementsByTagName('small')[0];
	let sortButtons = sortButtonsContainer.getElementsByTagName('button');
	var sorts = [];
	Object.keys(sortFuncMap).forEach(function(key){
		let sortButton = document.createElement('button');
		sortButton.innerHTML = key;
		sortButtonsContainer.appendChild(sortButton);
		let sort = function(){
			DOMList.innerHTML = '';
			items.sort( sortFuncMap[key] );
			items.forEach(function(it){
				if(isValidFunc(it) == 0)
					return;
				let li = document.createElement('li');
				let innerHTML = '<button>'+listItemNumFunc(it)+' <arrow></arrow></button> ';
				innerHTML += '<info><inline-bar style="width: '+isValidFunc(it)*3+'px">'+listItemNameFunc(it)+'</inline-bar></info><detail>'+listItemPopupFunc(it)+'</detail>';
				li.innerHTML = innerHTML;
				// Only one item expanded at a time.
				let button = li.getElementsByTagName('button')[0];
				let detail = li.getElementsByTagName('detail')[0];
				detail.style.display = 'none';
				button.addEventListener('click', function(){
					if(detail.style.display == 'none'){
						for(var i = 0; i < DOMDetails.length; ++i){
							DOMDetails[i].style.display = 'none';
							DOMButtons[i].classList = '';
						}
						detail.style.display = 'block';
						button.classList = 'active';
					}
					else {
						detail.style.display = 'none';
						button.classList = '';
					}
				});
				DOMList.appendChild(li);
			});
			for(let i = 0; i < sortButtons.length; ++i)
				sortButtons[i].classList = '';
			sortButton.classList = 'active';
		};
		sorts.push(sort);
		sortButton.addEventListener('click', sort);
	});
	sorts[0]();
	return element;
}
function popularSet(list, comparator){
	let popular = [];
	let count = 0;
	list.forEach(function(el){
		if(comparator(el) > count){
			popular = [el];
			count = comparator(el);
		}
		else if(comparator(el) == count)
			popular.push(el);
	});
	return { popular: popular, value: count };
}
function prettyList(list){
	if(list.length == 0)
		return '';
	else if(list.length == 1)
		return list[0];
	else
		return list.slice(0,-1).join(', ')+' and '+list[list.length-1];
}
function comparAttr(a,b,c){ return a[c] > b[c]? 1 : b[c] > a[c]? -1 : 0; }
function comparArray(a,b,c){ return a[c].length > b[c].length? 1 : b[c].length > a[c].length? -1 : 0; }
function preprocessData(jason){
	window.margin = {top: 30, right: 14, bottom: 20, left: 30};
	window.SPINE_COUNT = 1100;
	window.VISIT_COUNT = Math.ceil(Math.sqrt(Object.keys(jason.visits).length)) + 2;
	window.width = SPINE_COUNT*1.3 - margin.left - margin.right;
	window.height = 600 - margin.top - margin.bottom;
	window.bin_width = width/SPINE_COUNT;
	window.bin_height = height/VISIT_COUNT;
	jason.stats = { directorsCount: 0, visitsCount: 0, moviesCount: 0, countriesCount: 0 };
	for(var i = 0; i < jason.directors.length; ++i) jason.directors[i].movies = [];
	for(var i = 0; i < jason.countries.length; ++i) jason.countries[i].movies = [];
	jason.movie_list = [];
	Object.keys(jason.movies).forEach(function(key){
		let movie = jason.movies[key];
		movie.directors = jason.movies[key].director.map(function(d){ return jason.directors[d] });
		movie.directors.forEach(function(d){ d.movies.push(movie) });
		movie.countries = jason.movies[key].country.map(function(c){ return jason.countries[c] });
		movie.countries.forEach(function(c){ c.movies.push(movie) });
		movie.bagged = 0;
		movie.mentioned = 0;
		movie.visitors = [];
		movie.length = 0;
		movie.spine_number = parseInt(key);
		movie.x0 = movie.spine_number*bin_width;
		jason.movie_list.push(movie);
	});
	jason.visit_list = [];
	Object.keys(jason.visits).forEach(function(key){
		let visit = jason.visits[key];
		let movieMap = {};
		visit.spines_bagged.forEach(function(sn){
			jason.movies[sn].bagged++;
			jason.movies[sn].visitors.push(visit);
			jason.movies[sn].length++;
			movieMap[sn] = jason.movies[sn];
		});
		visit.spines_mentioned.forEach(function(sn){
			jason.movies[sn].mentioned++;
			jason.movies[sn].visitors.push(visit);
			jason.movies[sn].length++;
			movieMap[sn] = jason.movies[sn];
		});
		visit.all_movies = [];
		Object.keys(movieMap).forEach(function(sn){ visit.all_movies.push(movieMap[sn]) });
		visit.date = key;
		visit.bagged = visit.spines_bagged.map(function(sn){ jason.movies[sn] });
		visit.mentioned = visit.spines_mentioned.map(function(sn){ jason.movies[sn] });
		jason.visit_list.push(visit);
		if(visit.all_movies.length > 0)
			jason.stats.visitsCount++;
	});
	jason.directors.forEach(function(director){
		if (director.movies.length > 0)
			jason.stats.directorsCount++;
		director.movies.sort(function(a,b){ return (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0); });
	});
	jason.countries.forEach(function(country){
		if (country.movies.length > 0)
			jason.stats.countriesCount++;
		country.movies.sort(function(a,b){ return (a.year > b.year) ? 1 : ((b.year > a.year) ? -1 : 0); });
	});
	jason.movie_list.forEach(function(m){
		if(m.length > 0) jason.stats.moviesCount++;
	});
	return jason;
}
function Title(){
	var element = document.createElement('h1');
	element.innerHTML = 'Criterion Closet Picks Data Visualization';
	return element;
}
function ChartView(jason){
	var element = document.createElement('chart');
	element.innerHTML = '<svg/><div><svg id="chart"/></div><legend><strong>Legend</strong><div><box class="bagged"></box>movies bagged</div><div><box class="mentioned"></box>movies mentioned</div></legend>';
	var y_axis = d3.select(element.getElementsByTagName('svg')[0])
		.attr("width", margin.left)
		.attr("height", height+margin.top+margin.bottom)
		.append("g").attr("transform", "translate("+29+","+margin.top+")");
	var y_axis_domain = Array.apply(null, Array(VISIT_COUNT)).map(function(_,i){ return i });
	var y_axis_range = Array.apply(null, Array(VISIT_COUNT)).map(function(_,i){ return height*(1 - i/VISIT_COUNT) });
	var y_scale = d3.scaleOrdinal().domain(y_axis_domain).range(y_axis_range);
	y_axis.append("g").attr("class", "axis").call(d3.axisLeft(y_scale));
	var chart = d3.select(element.getElementsByTagName('svg')[1])
		.attr("width", width + margin.right).attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate("+margin.left/12+","+margin.top+")");
	var axis_max = SPINE_COUNT/100;
	var domain_axis = Array.apply(null, Array(axis_max)).map(function(_,i){ return i*100 });
	var range_axis = Array.apply(null, Array(axis_max)).map(function(_,i){ return width*i/(axis_max-1) });
	var x_scale = d3.scaleOrdinal().domain(domain_axis).range(range_axis);
	var all = chart.selectAll(".bar").data(jason.movie_list).enter()
		.append("g")
		.attr("class", "bar")
		.attr("transform", function(d){ return "translate("+d.x0+","+(height-d.length*bin_height)+")"});
	all.append("rect").attr("class", "bagged")
		.attr("transform", function(d){ return "translate(0," + d.mentioned*bin_height + ")" })
		.attr("width", bin_width).attr("height", function(d){ return d.bagged*bin_height });
	all.append("rect").attr("class", "mentioned")
		.attr("width", bin_width).attr("height", function(d){ return d.mentioned*bin_height });
	chart.append("g").attr("class", "axis")
		.attr("transform", "translate(0,"+height+")").call(d3.axisBottom(x_scale));
	return element;
}
function OverView(jason){
	var element = document.createElement('analysis');
	let movies = popularSet(jason.movie_list, function(m){ return m.length });
	let directors = popularSet(jason.directors, function(d){ return d.movies.length });
	let countries = popularSet(jason.countries, function(c){ return c.movies.length });
	let i18n = {
		movies_count: (movies.popular.length > 1) ? 'movies' : 'movie',
		movies_be: (movies.popular.length > 1) ? 'are' : 'is',
		movies_list: prettyList(movies.popular.map(function(m){ return '<cite class="interactive">'+m.title+'</cite>' })),
		apiece: (movies.popular.length > 1) ? ' apiece' : '',
		director: (directors.popular.length > 1) ? 'directors' : 'director',
		directors_be: (directors.popular.length > 1) ? 'are' : 'is',
		directors_list: prettyList(directors.popular.map(function(d){ return '<span class="interactive">'+d.name+'</span>' })),
		country: (countries.popular.length > 1) ? 'countries' : 'country',
		countries_be: (countries.popular.length > 1) ? 'are' : 'is',
		countries_list: prettyList(countries.popular.map(function(c){ return '<span class="interactive">'+c.name+'</span>' })),
		each: (countries.popular.length > 1) ? ' each' : ''
	};
	element.appendChild(document.createElement('p')).innerHTML = 'The aim of this page is to easily visualize the movie tastes of the various visitors of the <a href="https://www.criterion.com/">Criterion Collection</a>\'s closet, as seen in <a href="https://www.youtube.com/playlist?list=PLFk8lnn1nEEID1NNh7vCZuU5Y4r2YrheR">this video series</a>. The chart above shows each movie picked, in Criterion spine # order, against the number of times they were picked, while the interactive lists below expose the dataset.';
	element.appendChild(document.createElement('p')).innerHTML = 'There have been <span class="interactive">'+jason.stats.visitsCount+'</span> visits to the Criterion closet, from which <span class="interactive">'+jason.stats.moviesCount+'</span> unique films by <span class="interactive">'+jason.stats.directorsCount+'</span> unique directors in <span class="interactive">'+jason.stats.countriesCount+'</span> unique countries have been picked up/discussed.';
	element.appendChild(document.createElement('p')).innerHTML = i18n.movies_list+' '+i18n.movies_be+' the most popular '+i18n.movies_count+' among closet visitors, with <span class="interactive">'+movies.value+'</span> baggings/mentions'+i18n.apiece+'.';
	element.appendChild(document.createElement('p')).innerHTML = i18n.directors_list+' '+i18n.directors_be+' the most popular '+i18n.director+', with <span class="interactive">'+directors.value+'</span> baggings/mentions.';
	element.appendChild(document.createElement('p')).innerHTML = 'The '+i18n.country+' from which the most movies are bagged/mentioned '+i18n.countries_be+' '+i18n.countries_list+' (<span class="interactive">'+countries.value+'</span> movies'+i18n.each+').';
	return element;
}
function DirectorListView(jason){
	return ListView(
		jason.directors,
		'Director List',
		function(it){ return it.movies.length },
		function(it){ return it.movies.length },
		function(it){ return it.name },
		function(it){ return prettyList(it.movies.map(function(m){ return '<cite>'+m.title+'</cite> ('+m.year+')' }))+'.' },
		{
			'variety':function(a,b){ let v=comparArray(b,a,'movies'); if(v==0)v=comparAttr(a,b,'name'); return v; },
			'alphabetically':function(a,b){return comparAttr(a,b,'name')}
		}
	);
}
function CountryListView(jason){
	return ListView(
		jason.countries,
		'Country List',
		function(it){ return it.movies.length },
		function(it){ return it.movies.length },
		function(it){ return it.name },
		function(it){ return prettyList(it.movies.map(function(m){ return '<cite>'+m.title+'</cite> ('+m.year+')' }))+'.' },
		{
			'popularity': function(a,b){ let v = comparArray(b,a,'movies'); if(v == 0) v = comparAttr(a,b,'name'); return v; },
			'alphabetically': function(a,b){ return comparAttr(a,b, 'name') }
		}
	)
}
function VisitListView(jason){
	return ListView(
		jason.visit_list,
		'Visit List',
		function(it){ return it.all_movies.length },
		function(it){ return it.date },
		function(it){ return it.visitor },
		function(it){ let movieList=prettyList(it.all_movies.map(function(m){ return '<cite class="'+(it.spines_bagged.indexOf(m.spine_number)==-1?'mentioned':'bagged')+'">'+m.title+'</cite>'; }))+'.'; return '<a href="https://youtu.be/'+it.url+'">Video link</a>.<br/>'+movieList + (it.notes.length > 0? '<hr/>'+it.notes : ''); },
		{
			'date': function(a,b){ return comparAttr(a,b, 'date') },
			'alphabetically': function(a,b){ return comparAttr(a,b, 'visitor') },
			'greediness': function(a,b){ let v = comparArray(b,a,'all_movies'); if(v == 0) v = comparAttr(a,b,'name'); return v; }
		}
	)
};
function MovieListView(jason){
	return ListView(
		jason.movie_list,
		'Movie List',
		function(it){ return it.visitors.length },
		function(it){ return '<list-num>'+it.spine_number+'</list-num>' },
		function(it){ return '<cite>'+it.title+'</cite>' },
		function(it){ return 'Directed by '+prettyList(it.directors.map(function(d){return d.name}))+'. '+it.year+'. <a href="https://criterion.com/films/'+it.url+'">Criterion link</a>.<br/>'+ prettyList(it.visitors.map(function(v){ return '<cite class="'+(v.spines_bagged.indexOf(it.spine_number)==-1?'mentioned':'bagged')+'">'+v.visitor+'</cite>' }))+'.' },
		{
			'spine #': function(a,b){ return comparAttr(a,b,'spine_number') },
			'popularity': function(a,b){ let v = comparArray(b,a,'visitors'); if(v==0)v=comparAttr(a,b,'spine_number'); return v; },
			'alphabetically': function(a,b){ return comparAttr(a,b,'title') }
		}
	)
};
function FooterView(){
	var element = document.createElement('footer');
	element.appendChild(document.createElement('small')).innerHTML = 'The data for this chart was gathered by hand -- if there are any omissions or errors, let me know: <a href="https://twitter.com/radamadah">@radamadah</a>.</br>Coded with d3.js. If you want to contribute to this thing, it\'s a public repo on Github (<a href="https://github.com/radamadah/criterion-closet-picks">https://github.com/radamadah/criterion-closet-picks</a>), and I\'ll take any good PRs! Last updated 2019-11-05.';
	return element;
}
