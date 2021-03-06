from http.server import BaseHTTPRequestHandler, HTTPServer
from furl import furl
import json


class Server(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def do_GET(self):
        print('do get')
        f = furl(self.path)
        self._set_headers()
        if(self.path.find("train") != -1):
            currency = furl(self.path).args['train']
            import trainARIMA
            trainARIMA.train(currency)
            self.wfile.write(json.dumps(
                {'message': 'ARIMA parameters for {} were updated'.format(currency)}).encode(encoding='utf_8'))
        elif(self.path.find("forecast") != -1):
            currency = furl(self.path).args['forecast']
            period = furl(self.path).args['period']
            import forecastARIMA
            results = forecastARIMA.forecast(currency, int(period))
            self.wfile.write(results.to_json(
                orient='records').encode(encoding='utf_8'))
        else:
            self.wfile.write(json.dumps(
                {'message': 'Invalid request'}).encode(encoding='utf_8'))


server_address = ('', 8080)
httpd = HTTPServer(server_address, Server)

print('Listening at http://127.0.0.1:8080', flush=True)
httpd.serve_forever()
