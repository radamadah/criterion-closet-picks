#!/usr/local/bin/python3

from http.server import BaseHTTPRequestHandler, HTTPServer

import source.compile as compile
import source.searcher as Searcher
import source.getter as Getter
import source.adder as Adder

class server(BaseHTTPRequestHandler):
	def do_GET(self):
		document = {}
		requested_path = self.path.split('/')
		if len(requested_path) > 1 and requested_path[1] not in ['index.html', '']:
			document = {'response_type': 404, 'body': 'File Not Found'}
		else:
			document = compile.generate_full()
		self.send_response(document['response_type'])
		self.send_header('Content-type', 'text/html')
		self.end_headers()
		self.wfile.write(bytes(document['body'], 'utf-8'))

if __name__ == '__main__':
	from sys import argv

	if argv[1] == 'build':
		with open('index.html', 'w') as f:
			f.write(compile.generate_stub())

	elif argv[1] == 'host':
		HTTPServer(('127.0.0.1', 1540), server).serve_forever()

	elif argv[1] == 'search':
		searcher = Searcher.searcher(argv[2])
		searcher.run(argv[3])
		searcher.write()

	elif argv[1] == 'get':
		getter = Getter.getter(argv[2])
		getter.run(argv[3])
		getter.write()

	elif argv[1] == 'add':
		adder = Adder.adder(argv[2])
		adder.run()
