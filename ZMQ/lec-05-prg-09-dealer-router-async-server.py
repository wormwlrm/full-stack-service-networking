# Asynchronous Client/Server Pattern
# Reference: https://zguide.zeromq.org/docs/chapter3/#The-Asynchronous-Client-Server-Pattern
# author of original code: Felipe Cruz <felipecruz@loogica.net>
# license of original code: MIT/X11

import zmq
import sys
import threading
import time
from random import randint, random

class ServerTask(threading.Thread):
    """ServerTask"""
    def __init__(self, num_server):
        threading.Thread.__init__ (self)
        self.num_server = num_server

    def run(self):
        context = zmq.Context()
        frontend = context.socket(zmq.ROUTER)
        frontend.bind('tcp://*:5570')

        backend = context.socket(zmq.DEALER)
        backend.bind('inproc://backend')

        workers = []
        for i in range(self.num_server):
            worker = ServerWorker(context, i)
            worker.start()
            workers.append(worker)

        zmq.proxy(frontend, backend) 

        frontend.close()
        backend.close()
        context.term()

class ServerWorker(threading.Thread):
    """ServerWorker"""
    def __init__(self, context, id):
        threading.Thread.__init__ (self)
        self.context = context
        self.id = id

    def run(self):
        worker = self.context.socket(zmq.DEALER)
        worker.connect('inproc://backend')
        print('Worker#{0} started'.format(self.id))
        while True:
            ident, msg = worker.recv_multipart()
            print('Worker#{0} received {1} from {2}'.format(self.id, msg, ident))
            worker.send_multipart([ident, msg])

        worker.close() # useless

def main(argv):
    """main function"""
    server = ServerTask(int(argv[1]))
    server.start()
    server.join()

# usage: python 07-dealer-router-async-server.py n
if __name__ == "__main__":
    main(sys.argv)