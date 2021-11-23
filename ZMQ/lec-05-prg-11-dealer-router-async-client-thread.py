# Asynchronous Client/Server Pattern
# Reference: https://zguide.zeromq.org/docs/chapter3/#The-Asynchronous-Client-Server-Pattern
# author of original code: Felipe Cruz <felipecruz@loogica.net>
# license of original code: MIT/X11

import zmq
import sys
import threading
import time
from random import randint, random

class ClientTask(threading.Thread):
    """ClientTask"""
    def __init__(self, id):
        self.id = id
        threading.Thread.__init__ (self)

    def recvHandler(self):
        while True:
            sockets = dict(self.poll.poll(1000))
            if self.socket in sockets:
                msg = self.socket.recv()
                print('{0} received: {1}'.format(self.identity, msg))

    def run(self):
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.DEALER)
        self.identity = u'%s' % self.id
        self.socket.identity = self.identity.encode('ascii')
        self.socket.connect('tcp://localhost:5570')
        print('Client %s started' % (self.identity))
        self.poll = zmq.Poller()
        self.poll.register(self.socket, zmq.POLLIN)
        reqs = 0

        clientThread = threading.Thread(target=self.recvHandler)
        clientThread.daemon = True
        clientThread.start()
        
        while True:
            reqs = reqs + 1
            print('Req #%d sent..' % (reqs))
            self.socket.send_string(u'request #%d' % (reqs))
            time.sleep(1)

        self.socket.close() #useless
        self.context.term() #useless

def main(argv):
    """main function"""
    client = ClientTask(argv[1])
    client.start()

# usage: python 08-dealer-router-async-client.py client_id
if __name__ == "__main__":
    main(sys.argv)