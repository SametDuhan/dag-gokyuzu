# Yerel deneme sunucusu: önbelleği kapatır (tarayıcı eski JS modüllerini tutmasın).
# Çalıştır: python3 deneme/sunucu.py 8771   (depo kökünden)
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class Onbelleksiz(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8771
ThreadingHTTPServer(("", port), Onbelleksiz).serve_forever()
