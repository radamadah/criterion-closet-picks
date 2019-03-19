#!/usr/local/bin/python3

from http.server import BaseHTTPRequestHandler, HTTPServer

import source.compile as compile
import source.searcher as Searcher
import source.getter as Getter


class server(BaseHTTPRequestHandler):
        def do_GET(self):
                document = compile.generate(self.path)
                self.send_response(document['response_type'])
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(bytes(document['body'], 'utf-8'))

if __name__ == '__main__':
        from sys import argv

        if argv[1] == 'build':
                with open('index.html', 'w') as f:
                        f.write(compile.generate('/index.html')['body'])

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
                getter = Getter.getter(argv[2])
                getter.run(argv[3])
                getter.write()

