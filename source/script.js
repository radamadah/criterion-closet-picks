function DOM(){var i=function(_,v){return v===typeof _},s=null,o=function(_){return!i(_,'undefined')&&s!==_},g='insertBefore',r=function(_,v){return o(_)&&i(o(v)?v:_[g],'function')},a=arguments,m=a[0],t=a.length,e=1<t&&r(a[1])?a[1]:s,n=2<t&&r(a[2])?a[2]:s,y=a[t-1];return 0<t&&5>t&&o(m)&&i(m,'string')?m=document.createElement(m):s,r(m)?((1<t&&r(y,y)?y(m):s),(o(e)?e[g](m,n):s),m):s;}
function DOMText(a){return document.createTextNode(a);}

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

function run(jason){
	var main = document.getElementsByTagName('main')[0];
	var jason = preprocessData(jason);

	ChartView(jason, main);
	LegendView(jason, main);
	OverView(jason, main);
	DirectorListView(jason, main);
	CountryListView(jason, main);
	VisitListView(jason, main);
	MovieListView(jason, main);
}
function ListView(main, items, title, isValidFunc, listItemNumFunc, listItemNameFunc, listItemPopupFunc, sortFuncMap){
	let sortButtonsContainer = null;
	DOM('h2', main, h2 => {
		DOM(DOMText(title + ' '), h2)
		DOM('small', h2, small => {
			small.innerHTML = 'sort by '
			sortButtonsContainer = DOM('span', small)
		})
	})
	let DOMList = DOM('ol', main)
	var DOMDetails = DOMList.getElementsByTagName('detail');
	var DOMButtons = DOMList.getElementsByTagName('button');
	let DOMSortButtons = sortButtonsContainer.getElementsByTagName('button');
	var sorts = [];
	Object.keys(sortFuncMap).forEach(function(key){
		DOM('button', sortButtonsContainer, sortButton => {
			sortButton.innerHTML = key;
			let sort = function(){
				DOMList.innerHTML = '';
				items.sort(sortFuncMap[key]);
				items.forEach(function(it){
					if(isValidFunc(it) == 0)
						return;
					DOM('li', DOMList, li => {
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
					})
				});
				for(let i = 0; i < DOMSortButtons.length; ++i)
					DOMSortButtons[i].classList = '';
				sortButton.classList = 'active';
			};
			sorts.push(sort);
			sortButton.addEventListener('click', sort);
		})
	});
	sorts[0]();
}
function preprocessData(jason){
	window.margin = {top: 30, right: 30, bottom: 30, left: 40};
	window.SPINE_COUNT = 1100;
	window.VISIT_COUNT = Math.ceil(Math.sqrt(Object.keys(jason.visits).length)) + 2;
	window.width = SPINE_COUNT*2 - margin.left - margin.right;
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
var barOnHover = null;
function LegendView(jason, main){
	barOnHover = function(spine) {
		let movie = jason.movies[spine]
		let barInfo = document.getElementsByClassName('bar-info')[0]
		barInfo.innerHTML = '#'+movie.spine_number+': <cite>'+movie.title+'</cite>. '+
			'Directed by '+prettyList(movie.directors.map(function(d){return d.name}))+'. '+movie.year+'. <a href="https://criterion.com/'+movie.url+'">Criterion link</a>.<br/>'+ prettyList(movie.visitors.map(function(v){ return '<cite class="'+(v.spines_bagged.indexOf(movie.spine_number)==-1?'data2':'data1')+'"><a href="https://youtu.be/'+v.url+'">'+v.visitor+'</a></cite>' }))+'.'
	}

	DOM('div', main, div => {
		div.setAttribute('class', 'chart-helper')
		DOM('detail', div, barInfo => {
			barInfo.setAttribute('class', 'bar-info')
		})
		DOM('div', div, (legend) => {
			legend.setAttribute('class', 'legend')
			DOM('strong', legend, strong => strong.innerHTML = 'Legend')
			DOM('div', legend, (div) => {
				DOM('box', div, box => box.classList = 'data1-background')
				DOM(DOMText('movies bagged'), div)
			});
			DOM('div', legend, (div) => {
				DOM('box', div, box => box.classList = 'data2-background')
				DOM(DOMText('movies mentioned'), div)
			})
			DOM('div', legend, text => text.innerHTML = 'Hover over bars for more info')
		})
	})
}
function ChartView(jason, parent){
	DOM('chart', parent, chart => {
		let yAxisTicks = '';
		for(let i = 0; i < VISIT_COUNT; ++i) {
			yAxisTicks += ''+
				'<g class="tick" opacity="1" transform="translate(0,'+(height*(1 - i/VISIT_COUNT))+')">'+
				'<line x2="-6"></line>'+
				'<text x="-9" y="5">'+i+'</text>'+
				'</g>';
		}

		let svg1 = ''+
		'<svg width="'+margin.left+'" height="'+(height+margin.top+margin.bottom)+'">'+
			'<g transform="translate(29,'+margin.top+')">'+
				'<g class="axis" fill="none" text-anchor="end">'+
					'<path class="domain" d="M0,'+height+'H0.5V'+(height/VISIT_COUNT)+'H0"></path>'+
					yAxisTicks+
				'</g>'+
			'</g>'+
		'</svg>';

		chart.innerHTML = svg1;

		let xAxisTicks = '';
		let xAxisMax = SPINE_COUNT/100;
		for(let i = 0; i < xAxisMax; i++) {
			xAxisTicks += ''+
			'<g class="tick" opacity="1" transform="translate('+(width*i/(xAxisMax-1))+',0)">'+
				'<line y2="6"></line>'+
				'<text y="9" dy="0.71em">'+(i*100)+'</text>'+
			'</g>';
		}

		let bars = '';

		jason.movie_list.forEach((movie) => {
			bars += ''+
			'<g id="bar-'+movie.spine_number+'" class="bar" transform="translate('+movie.x0+','+(height-movie.length*bin_height)+')" onmouseover="barOnHover('+movie.spine_number+',\''+movie.title+'\')">'+
			'<rect class="data2" transform="translate(0,0)" width="'+bin_width+'" height="'+(movie.mentioned*bin_height)+'"></rect>'+
			'<rect class="data1" transform="translate(0,'+(movie.mentioned*bin_height)+')" width="'+bin_width+'" height="'+(movie.bagged*bin_height)+'"></rect>'+
			
			'</g>';
		})


		DOM('div', chart, div => {
			div.innerHTML = ''+
			'<svg id="chart" width="'+(width + margin.right)+'" height="'+(height + margin.top + margin.bottom)+'">'+
				'<g transform="translate('+(margin.left/12)+','+margin.top+')">'+
					bars+
					'<g class="axis" transform="translate(0,'+height+')" fill="none" text-anchor="middle">'+
						'<path class="domain" d="M0.5,6V0.5H'+width+'V0"></path>'+
						xAxisTicks+
					'</g>'+
				'</g>'+
			'</svg>';
		})
	})
}
function OverView(jason, main){
	let movies = popularSet(jason.movie_list, function(m){ return m.length });
	let directors = popularSet(jason.directors, function(d){ return d.movies.length });
	let countries = popularSet(jason.countries, function(c){ return c.movies.length });
	let i18n = {
		movies_count: (movies.popular.length > 1) ? 'movies' : 'movie',
		movies_be: (movies.popular.length > 1) ? 'are' : 'is',
		movies_list: prettyList(movies.popular.map(function(m){ return '<cite class="active">'+m.title+'</cite>' })),
		apiece: (movies.popular.length > 1) ? ' apiece' : '',
		director: (directors.popular.length > 1) ? 'directors' : 'director',
		directors_be: (directors.popular.length > 1) ? 'are' : 'is',
		directors_list: prettyList(directors.popular.map(function(d){ return '<span class="active">'+d.name+'</span>' })),
		country: (countries.popular.length > 1) ? 'countries' : 'country',
		countries_be: (countries.popular.length > 1) ? 'are' : 'is',
		countries_list: prettyList(countries.popular.map(function(c){ return '<span class="active">'+c.name+'</span>' })),
		each: (countries.popular.length > 1) ? ' each' : ''
	};
	DOM('p', main, p => {
		p.innerHTML = 'The aim of this page is to easily visualize the movie tastes of the various visitors of the <a href="https://www.criterion.com/">Criterion Collection</a>\'s closet, as seen in <a href="https://www.youtube.com/playlist?list=PLFk8lnn1nEEID1NNh7vCZuU5Y4r2YrheR">this video series</a>. The chart above shows each movie picked, in Criterion spine # order, against the number of times they were picked, while the interactive lists below expose the dataset.';
	})
	DOM('p', main, p => {
		p.innerHTML = 'There have been <span class="active">'+jason.stats.visitsCount+'</span> visits to the Criterion closet, from which <span class="active">'+jason.stats.moviesCount+'</span> unique films by <span class="active">'+jason.stats.directorsCount+'</span> unique directors in <span class="active">'+jason.stats.countriesCount+'</span> unique countries have been picked up/discussed.';
	})
	DOM('p', main, p => {
		p.innerHTML = i18n.movies_list+' '+i18n.movies_be+' the most popular '+i18n.movies_count+' among closet visitors, with <span class="active">'+movies.value+'</span> baggings/mentions'+i18n.apiece+'.';
	})
	DOM('p', main, p => {
		p.innerHTML = i18n.directors_list+' '+i18n.directors_be+' the most popular '+i18n.director+', with <span class="active">'+directors.value+'</span> baggings/mentions.';
	})
	DOM('p', main, p => {
		p.innerHTML = 'The '+i18n.country+' from which the most movies are bagged/mentioned '+i18n.countries_be+' '+i18n.countries_list+' (<span class="active">'+countries.value+'</span> movies'+i18n.each+').';
	})
}
function DirectorListView(jason, main){
	return ListView(
		main,
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
function CountryListView(jason, main){
	return ListView(
		main,
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
function VisitListView(jason, main){
	return ListView(
		main,
		jason.visit_list,
		'Visit List',
		function(it){ return it.all_movies.length },
		function(it){ return it.date },
		function(it){ return it.visitor },
		function(it){ let movieList=prettyList(it.all_movies.map(function(m){ return '<cite class="'+(it.spines_bagged.indexOf(m.spine_number)==-1?'data2':'data1')+'">'+m.title+'</cite>'; }))+'.'; return '<a href="https://youtu.be/'+it.url+'">Video link</a>.<br/>'+movieList + (it.notes.length > 0? '<hr/>'+it.notes : ''); },
		{
			'date': function(a,b){ return comparAttr(a,b, 'date') },
			'alphabetically': function(a,b){ return comparAttr(a,b, 'visitor') },
			'greediness': function(a,b){ let v = comparArray(b,a,'all_movies'); if(v == 0) v = comparAttr(a,b,'name'); return v; }
		}
	)
}
function MovieListView(jason, main){
	return ListView(
		main,
		jason.movie_list,
		'Movie List',
		function(it){ return it.visitors.length },
		function(it){ return '<list-num>'+it.spine_number+'</list-num>' },
		function(it){ return '<cite>'+it.title+'</cite>' },
		function(it){ return 'Directed by '+prettyList(it.directors.map(function(d){return d.name}))+'. '+it.year+'. <a href="https://criterion.com/'+it.url+'">Criterion link</a>.<br/>'+ prettyList(it.visitors.map(function(v){ return '<cite class="'+(v.spines_bagged.indexOf(it.spine_number)==-1?'data2':'data1')+'">'+v.visitor+'</cite>' }))+'.' },
		{
			'spine #': function(a,b){ return comparAttr(a,b,'spine_number') },
			'popularity': function(a,b){ let v = comparArray(b,a,'visitors'); if(v==0)v=comparAttr(a,b,'spine_number'); return v; },
			'alphabetically': function(a,b){ return comparAttr(a,b,'title') }
		}
	)
}
