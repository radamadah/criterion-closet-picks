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

def get_stylesheet():
	stylesheet = ''
	with open('source/style.css') as f:
		stylesheet = f.read()
	return stylesheet

def generate_stylesheet():
	return DOMElement('style').appendChild(DOMString(get_stylesheet()))

def generate_json():
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
	return DOMElement('script').appendChild(DOMString('document.addEventListener("DOMContentLoaded", function(){ run({visits: '+visitsObj+', countries: '+countriesObj+', directors: '+directorsObj+', movies: '+moviesObj+'}); });'))

def get_javascript():
	js = ''
	with open('source/script.js') as f:
		js = f.read()
	return js

def generate_javascript():
	return DOMElement('script').appendChild(DOMString(get_javascript()))

def generate_stub():
	return generate_stylesheet().write()+generate_json().write()+generate_javascript().write()

def generate_index():
	index_file = DOMElement('html')

	head = index_file.appendChild(DOMElement('head'))
	head.appendChild(DOMElement('meta', { 'charset': 'utf-8' }))
	head.appendChild(DOMElement('link', { 'rel': 'stylesheet', 'type': 'text/css', 'href': 'http://adamhadar.me/static/style.css' }))
	head.appendChild(DOMElement('link', { 'rel': 'stylesheet', 'type': 'text/css', 'href': 'style.css' }))
	head.appendChild(DOMElement('script', { 'type': 'text/javascript', 'src': 'script.js' }))
	head.appendChild(generate_json())

	body = index_file.appendChild(DOMElement('body'))

	header = DOMElement('header')
	body.appendChild(header)
	header.appendChild(DOMElement('h1').appendChild(DOMString('Criterion Closet Picks Visualization')))
	header.appendChild(DOMElement('address').appendChild(DOMString('By <a href="./">Adam Nogueira Hadar</a>')))
	header.appendChild(DOMElement('published-at').appendChild(DOMString('Published on EXAMPLE DATE')))

	main = body.appendChild(DOMElement('main'))

	return '<!DOCTYPE html>'+index_file.write()
