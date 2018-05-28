from http.server import BaseHTTPRequestHandler, HTTPServer

import source.compile as compile

class server(BaseHTTPRequestHandler):
        def do_GET(self):
                document = compile.generate(self.path)
                self.send_response(document['response_type'])
                self.send_header('Content-type', 'text/html')
                self.end_headers()
                self.wfile.write(bytes(document['body'], 'utf-8'))

if __name__ == "__main__":
        from sys import argv
        if len(argv) == 2 and argv[1] == 'build':
                with open('index.html', 'w') as f:
                        f.write(compile.generate('/index.html')['body'])
        elif len(argv) == 2 and argv[1] == 'host':
                HTTPServer(('127.0.0.1', 3000), server).serve_forever()
