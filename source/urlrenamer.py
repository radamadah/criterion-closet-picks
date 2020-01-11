#!/usr/local/bin/python3

with open('data/new_movies.csv', 'w') as write_csv:
    with open('data/movies.csv', 'r') as read_csv:
        for line in read_csv:
            values = line.strip().rsplit(',', 1)
            values[1] = 'films/'+values[1]
            write_csv.write('%s,%s\n' % (values[0], values[1]))
