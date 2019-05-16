import source.getter as Getter
import os

class adder:
	def __init__(self, kind):
		self.kind = kind

	def run(self):
		switch = {
			'country': self.__country_adder,
			'director': self.__director_adder,
			'movie': self.__movie_adder,
			'visit': self.__visit_adder
		}
		switch[self.kind]()

	def __country_adder(self):
		with open('data/countries.csv', 'a') as csv:
			csv.write('%s\n' % param)

	def __director_adder(self):
		with open('data/directors.csv', 'a') as csv:
			csv.write('%s\n' % param)

	def __movie_adder(self):
		VALID = True
		errors = []
		# GET SPINE
		spine = int(input('Spine: '))
		# GET NAME
		name = input('Name: ')
		# GET DIRECTOR
		directors = input('Directors: ')
		for director in directors.split(' '):
			getter = Getter.getter('director')
			getter.run(int(director))
			if not hasattr(getter, 'hit'):
				errors.append('FAILURE, WRONG director')
				VALID = False
		# GET COUNTRIES
		countries = input('Countries: ')
		for country in countries.split(' '):
			getter = Getter.getter('country')
			getter.run(int(country))
			if not hasattr(getter, 'hit'):
				errors.append('FAILURE, WRONG country')
				VALID = False
		# GET YEAR
		year = input('Year: ')
		# GET URL
		url = input('URL: ')

		if VALID:
			wrote_movie = False
			with open('data/tmp.csv', 'w') as write_csv:
				with open('data/movies.csv', 'r') as read_csv:
					for i,line in enumerate(read_csv):
						read_spine = int(line.strip().split(',')[0])
						if read_spine > spine and not wrote_movie:
							write_csv.write('%s,%s,%s,%s,%s,%s\n' % (spine,name,directors,countries,year,url))
							wrote_movie = True
						write_csv.write(line)
			os.remove('data/movies.csv')
			os.rename('data/tmp.csv', 'data/movies.csv')
			print('---SUCCESS---')
			getter = Getter.getter('movie')
			getter.run(int(spine))
			getter.write()
		else:
			print('---FAILURE---')
			for error in errors:
				print(error)

	def __visit_adder(self):
		VALID = True
		errors = []
		# GET DATE
		date = input("Enter date: ")
		# GET VISITOR NAME
		visitors = input("Enter visitors: ")
		# GET URL
		url = input("Enter url: ")
		# GET IS GROUP
		is_group = input("Is group?(Y/n) ")
		is_group = 'true' if is_group == 'Y' else 'false'
		# GET ON CRITERION
		on_criterion = input("On Criterion? ")
		if on_criterion != 'null':
			for director in on_criterion.split(' '):
				getter = Getter.getter('director')
				getter.run(int(director))
				if not hasattr(getter, 'hit'):
					errors.append('FAILURE, WRONG ON_CRITERION')
					VALID = False
		# GET BAGGED
		bagged = input("bagged: ")
		for movie in bagged.split(' '):
			getter = Getter.getter('movie')
			getter.run(int(movie))
			if not hasattr(getter, 'hit'):
				errors.append('FAILURE, WRONG movie')
				VALID = False
		# GET MENTIONED
		mentioned = input("mentioned: ")
		for movie in mentioned.split(' '):
			getter = Getter.getter('movie')
			getter.run(int(movie))
			if not hasattr(getter, 'hit'):
				errors.append('FAILURE, WRONG movie')
				VALID = False
		# GET NOTES
		notes = input("notes: ")

		if VALID:
			with open('data/visits.csv', 'a') as csv:
				csv.write('%s,%s,%s,%s,%s,%s,%s,%s\n' % (date,visitors,url,is_group,on_criterion,bagged,mentioned,notes))
			print('---SUCCESS---')
			getter = Getter.getter('visit')
			getter.run(date)
			getter.write()
		else:
			print('---FAILURE---')
			for error in errors:
				print(error)
