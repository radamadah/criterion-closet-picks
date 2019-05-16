class getter:
	def __init__(self, kind):
		self.kind = kind
		self.countries = []
		self.directors = []
		self.movies = []
		self.mentioned = []
		self.visits = []

	def run(self, query):
		switch = {
			'country': self.__country_get,
			'director': self.__director_get,
			'movie': self.__movie_get,
			'visit': self.__visit_get
		}
		switch[self.kind](query)

	def write(self):
		switch = {
			'country': self.__country_write,
			'director': self.__director_write,
			'movie': self.__movie_write,
			'visit': self.__visit_write
		}
		switch[self.kind]()

	def __country_get(self, query):
		query = int(query)
		with open('data/countries.csv') as csv:
			for i,line in enumerate(csv):
				if i == query:
					self.hit = { 'id': query, 'name': line.strip() }
					break

		with open('data/movies.csv') as csv:
			for line in csv:
				values = line.split(',')
				found = False
				for c in values[3].strip().split(' '):
					if int(c) == query:
						found = True
						break
				if found:
					self.movies.append({ 'spine': values[0], 'name': values[1] })

	def __country_write(self):
		print('id\t:: %s' % self.hit['id'])
		print('name\t:: %s' % self.hit['name'])
		print('movies\t:: [')
		for movie in self.movies:
			print('\t%s :: %s' % (movie['spine'], movie['name']))
		print(']')

	def __director_get(self, query):
		query = int(query)
		with open('data/directors.csv') as csv:
			for i,line in enumerate(csv):
				if i == query:
					self.hit = { 'id': query, 'name': line.strip() }
					break

		with open('data/movies.csv') as csv:
			for line in csv:
				values = line.split(',')
				found = False
				for c in values[2].strip().split(' '):
					if c != '' and int(c) == query:
						found = True
						break
				if found:
					self.movies.append({ 'spine': values[0], 'name': values[1] })

	def __director_write(self):
		print('id\t:: %s' % self.hit['id'])
		print('name\t:: %s' % self.hit['name'])
		print('movies\t:: [')
		for movie in self.movies:
			print('\t%s :: %s' % (movie['spine'], movie['name']))
		print(']')

	def __movie_get(self, query):
		query = int(query)
		directors = ''
		countries = ''
		with open('data/movies.csv') as csv:
			for line in csv:
				values = line.strip().split(',')
				if int(values[0]) == query:
					self.hit = {
						'spine': values[0],
						'name': values[1],
						'year': values[4],
						'url': 'https://criterion.com/films/'+values[5]
					}
					directors = values[2].strip().split(' ')
					countries = values[3].strip().split(' ')
					break

		with open('data/directors.csv') as csv:
			for i,line in enumerate(csv):
				for d in directors:
					if d != '' and int(d) == i:
						self.directors.append({ 'id': i, 'name': line.strip() })

		with open('data/countries.csv') as csv:
			for i,line in enumerate(csv):
				for c in countries:
					if c != '' and int(c) == i:
						self.countries.append({ 'id': i, 'name': line.strip() })

		with open('data/visits.csv') as csv:
			for line in csv:
				values = line.strip().split(',')
				movies = values[5].strip().split(' ') + values[6].strip().split(' ')
				found = False
				for m in movies:
					if m == self.hit['spine']:
						found = True
						break
				if found:
					self.visits.append({ 'id': values[0], 'name': values[1] })

	def __movie_write(self):
		print('spine\t:: %s' % self.hit['spine'])
		print('name\t:: %s' % self.hit['name'])
		print('year\t:: %s' % self.hit['year'])
		print('url\t:: %s' % self.hit['url'])
		print('dir.\t:: [')
		for director in self.directors:
			print('\t%s :: %s' % (director['id'], director['name']))
		print(']')
		print('ctry.\t:: [')
		for country in self.countries:
			print('\t%s :: %s' % (country['id'], country['name']))
		print(']')
		print('visits\t:: [')
		for visit in self.visits:
			print('\t%s :: %s' % (visit['id'], visit['name']))
		print(']')

	def __visit_get(self, query):
		bagged = ''
		mentioned = ''
		with open('data/visits.csv') as csv:
			for line in csv:
				values = line.strip().split(',')
				if values[0] == query:
					self.hit = {
						'date': values[0],
						'visitors': values[1],
						'url': 'https://youtu.be/'+values[2],
						'is-group': values[3],
						'on-criterion': values[4],
						'notes': values[7]
					}
					bagged = values[5].strip().split(' ')
					mentioned = values[6].strip().split(' ')
					break

		if self.hit['on-criterion'] != 'null':
			with open('data/directors.csv') as csv:
				for i,line in enumerate(csv):
					if int(self.hit['on-criterion']) == i:
						self.directors.append({ 'id': i, 'name': line.strip() })

		with open('data/movies.csv') as csv:
			for i,line in enumerate(csv):
				values = line.strip().split(',')
				for m in bagged:
					if m != '' and m == values[0]:
						self.movies.append({ 'id': values[0], 'name': values[1] })
				for m in mentioned:
					if m != '' and m == values[0]:
						self.mentioned.append({ 'id': values[0], 'name': values[1] })

	def __visit_write(self):
		print('date\t:: %s' % self.hit['date'])
		print('name\t:: %s' % self.hit['visitors'])
		print('url\t:: %s' % self.hit['url'])
		print('group\t:: %s' % self.hit['is-group'])
		print('notes\t:: %s' % self.hit['notes'])
		if self.hit['on-criterion'] != 'null':
			print('on-c\t:: [')
			for director in self.directors:
				print('\t%s :: %s' % (director['id'], director['name']))
			print(']')
		print('bagged\t:: [')
		for movie in self.movies:
			print('\t%s :: %s' % (movie['id'], movie['name']))
		print(']')
		print('mntns.\t:: [')
		for movie in self.mentioned:
			print('\t%s :: %s' % (movie['id'], movie['name']))
		print(']')
