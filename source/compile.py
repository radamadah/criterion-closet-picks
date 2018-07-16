def generate(path):
        requested_path = path.split('/')
        if len(requested_path) > 1 and requested_path[1] not in ['index.html', '']:
                return {'response_type': 404, 'body': 'File Not Found'}
        # Header data
        index_file = '<!DOCTYPE html>' + \
                     '<html class="night-mode">'+\
                     '<meta charset="utf-8"/>'+\
                     '<meta name="theme-color" content="#E9967A"/>'+\
                     '<meta name="twitter:card" content="summary"/>'+\
                     '<meta name="twitter:site" content="@radamadah"/>'+\
                     '<meta name="twitter:creator" content="@radamadah"/>'+\
                     '<meta name="twitter:title" content="Criterion Closet Picks Data Visualization"/>'+\
                     '<meta name="twitter:description" content="A quick graphic that shows the movie tastes of visitors to the Criterion Collection\'s DVD Closet."/>'+\
                     '<meta name="twitter:image" content="chart.png"/>'+\
                     '<meta property="og:title" content="Criterion Closet Picks Data Visualization" />'+\
                     '<meta property="og:description" content="A quick graphic that shows the movie tastes of visitors to the Criterion Collection\'s DVD Closet." />'+\
                     '<meta property="og:type" content="website" />'+\
                     '<meta property="og:url" content="http://adamhadar.me/things/criterion-closet-picks/" />'+\
                     '<meta property="og:image" content="http://adamhadar.me/things/criterion-closet-picks/chart.png" />'+\
                     '<title>Criterion Closet Picks Data Viz</title>'
        # Stylesheet
        with open('source/style.css') as f:
                index_file += '<style>'+f.read()+'</style>'
        # Scripts
        index_file += '<script src="https://d3js.org/d3.v4.min.js"></script>'
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
        with open('source/script.js') as f:
                index_file += '<script>'
                index_file += 'document.addEventListener("DOMContentLoaded", function(){ run({visits: '+visitsObj+', countries: '+countriesObj+', directors: '+directorsObj+', movies: '+moviesObj+'}); });'
                index_file += f.read()
                index_file += '</script>'
        index_file += '</html>'
        return {'response_type': 200, 'body': index_file}
