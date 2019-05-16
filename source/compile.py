class DOMString:
	def __init__(self, strng):
		self.str = strng

	def write(self):
		return self.str

class DOMElement:
	def __init__(self, name, attrs={}):
		self.name = name
		self.attrs = attrs
		self.children = []

	def appendChild(self, child):
		self.children.append(child)
		return self

	def firstChild(self):
		return self.children[0]

	def lastChild(self):
		return self.children[-1]

	def write(self):
		element = f'<{self.name}'
		for key in self.attrs:
			element += ' '+key+'="'+self.attrs[key]+'"'
		if self.name == 'meta':
			element += '/>'
		else:
			element += '>'
			for child in self.children:
				element += child.write()
			element += f'</{self.name}>'
		return element

def generate(path):
	requested_path = path.split('/')
	if len(requested_path) > 1 and requested_path[1] not in ['index.html', '']:
		return {'response_type': 404, 'body': 'File Not Found'}
	# Header data
	index_file = DOMElement('html', { 'class': 'night-mode' })
	index_file.appendChild(DOMElement('meta', { 'charset': 'utf-8' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'theme-color', 'content': '#E9967A' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'twitter:card', 'content': 'summary' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'twitter:site', 'content': '@radamadah' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'twitter:title', 'content': 'Criterion Closet Picks Data Visualization' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'twitter:description', 'content': 'A quick graphic that shows the movie tastes of visitors to the Criterion Collection\'s DVD Closet.' }))
	index_file.appendChild(DOMElement('meta', { 'name': 'twitter:image', 'content': 'chart.png' }))
	index_file.appendChild(DOMElement('meta', { 'property': 'og:title', 'content': 'Criterion Closet Picks Data Visualization' }))
	index_file.appendChild(DOMElement('meta', { 'property': 'og:description', 'content': 'A quick graphic that shows the movie tastes of visitors to the Criterion Collection\'s DVD Closet.' }))
	index_file.appendChild(DOMElement('meta', { 'property': 'og:type', 'content': 'website' }))
	index_file.appendChild(DOMElement('meta', { 'property': 'og:url', 'content': 'http://adamhadar.me/things/criterion-closet-picks/' }))
	index_file.appendChild(DOMElement('meta', { 'property': 'og:image', 'content': 'http://adamhadar.me/things/criterion-closet-picks/chart.png' }))
	index_file.appendChild(DOMElement('title').appendChild(DOMString('Criterion Closet Picks Data Viz')))
	# Stylesheet
	with open('source/style.css') as f:
		index_file.appendChild(DOMElement('style').appendChild(f.read()))
	# Scripts
	index_file.appendChild( DOMElement('script', { 'src': 'https://d3js.org/d3.v4.min.js' }) )
	visitsObj = ''
	moviesObj = ''
	countriesObj = ''
	directorsObj = ''
	with open('data/visits.csv') as csv:
		visits = []
		for line in csv:
			values = line.split(',')
			str = '"'+values[0]+'":{'
			str += 'visitor:"'+values[1]+'",'
			str += 'url:"'+values[2]+'",'
			str += 'is_group:'+values[3]+','
			str += 'on_criterion:'+values[4]+','
			str += 'spines_bagged: ['+values[5].replace(' ',',')+'],'
			str += 'spines_mentioned:['+values[6].replace(' ',',')+'],'
			str += 'notes:"'+values[7].rstrip()+'"}'
			visits.append(str)
		visitsObj = '{'+','.join(visits)+'}';
	with open('data/movies.csv') as csv:
		movies = []
		for line in csv:
			values = line.split(',')
			str = '"'+values[0]+'":{'
			str += 'title:"'+values[1]+'",'
			str += 'director:['+values[2].replace(' ',',')+'],'
			str += 'country:['+values[3].replace(' ',',')+'],'
			str += 'year:'+values[4]+','
			str += 'url:"'+values[5].rstrip()+'"}'
			movies.append(str)
		moviesObj = '{'+','.join(movies)+'}'
	with open('data/countries.csv') as csv:
		countries = []
		for line in csv:
			countries.append('{name: "'+line.rstrip()+'"}')
		countriesObj = '['+','.join(countries)+']'
	with open('data/directors.csv') as csv:
		directors = []
		for line in csv:
			directors.append('{name: "'+line.rstrip()+'"}')
		directorsObj = '['+','.join(directors)+']'
	index_file.appendChild( DOMElement('script').appendChild('document.addEventListener("DOMContentLoaded", function(){ run({visits: '+visitsObj+', countries: '+countriesObj+', directors: '+directorsObj+', movies: '+moviesObj+'}); });') )
	with open('source/script.js') as f:
		index_file.appendChild( DOMElement('script').appendChild(f.read()) )
	# index_file += '</html>'
	return {'response_type': 200, 'body': '<!DOCTYPE html>'+index_file.write() }
