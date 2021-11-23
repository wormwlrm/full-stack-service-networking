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

    def run(self):
        context = zmq.Context()
        socket = context.socket(zmq.DEALER)
        identity = u'%s' % self.id
        socket.identity = identity.encode('ascii')
        socket.connect('tcp://localhost:5570')
        print('Client %s started' % (identity))
        poll = zmq.Poller()
        poll.register(socket, zmq.POLLIN)
        reqs = 0
        while True:
            reqs = reqs + 1
            print('Req #%d sent..' % (reqs))
            socket.send_string(u'request #%d' % (reqs))

            time.sleep(1)
            sockets = dict(poll.poll(1000))
            if socket in sockets:
                msg = socket.recv()
                print('{0} received: {1}'.format(identity, msg))

        socket.close() #useless
        context.term() #useless

def main(argv):
    """main function"""
    client = ClientTask(argv[1])
    client.start()

# usage: python lec-04-prg-10-dealer-router-async-client.py client_id
if __name__ == "__main__":
    main(sys.argv)