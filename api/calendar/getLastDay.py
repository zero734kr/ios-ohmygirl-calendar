from http.server import BaseHTTPRequestHandler
from calendar import monthrange

"""
I changed the language because I wanted to test Python.
But when I tested the speed, python was faster!
Unfortunately, I couldn't find how to handle 405 Method 
Not Allowed to be the same as it was in TypeScript, but if you know how,
please open a problem by explaining.
"""


class handler(BaseHTTPRequestHandler):
    def do_GET(self):  
        # Just to instruct users who are connecting via browser
        self.send_response(405)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(
            """
            {
                \"status\": 405,
                \"error\": \"Method Not Allowed\",
                \"message\": \"Method Not allowed, only [POST] method is allowed.\"
            }
            """.encode())
        return

    def handle_missing_header(self):
        self.send_response(400)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        self.wfile.write(
            """
            {
                \"status\":400,
                \"error\":\"Bad Request\",
                \"message\":\"'year' and 'month' headers are required.\"
            }
            """.encode())
        return

    def do_POST(self):
        year = self.headers.get("year")
        month = self.headers.get("month")

        if not year or not month:
            return self.handle_missing_header()

        result = str(monthrange(int(year), int(month))[1])

        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(result.encode())
        return
