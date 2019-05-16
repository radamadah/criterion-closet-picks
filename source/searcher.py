class searcher:
	def __init__(self, kind):
		self.kind = kind
		self.hits = []

	def run(self, query):
		switch = {
			'country': self.__country_search,
			'director': self.__director_search,
			'movie': self.__movie_search,
			'visit': self.__visit_search
		}
		switch[self.kind](query)

	def write(self):
		for hit in self.hits:
			print('%s\t:: %s' % (hit['id'], hit['name']))

	def __country_search(self, query):
		with open('data/countries.csv') as csv:
			for i,line in enumerate(csv):
				cName = line.strip()
				if cName.lower().find(query) >= 0:
					self.hits.append({ 'id': i, 'name': cName })

	def __director_search(self, query):
		with open('data/directors.csv') as csv:
			for i,line in enumerate(csv):
				dName = line.strip()
				if dName.lower().find(query) >= 0:
					self.hits.append({ 'id': i, 'name': dName })

	def __movie_search(self, query):
		with open('data/movies.csv') as csv:
			for i,line in enumerate(csv):
				values = line.strip().split(',')
				if values[1].lower().find(query) >= 0:
					self.hits.append({ 'id': values[0], 'name': values[1] })

	def __visit_search(self, query):
		with open('data/visits.csv') as csv:
			for i,line in enumerate(csv):
				values = line.strip().split(',')
				if values[1].lower().find(query) >= 0:
					self.hits.append({ 'id': values[0], 'name': values[1] })
