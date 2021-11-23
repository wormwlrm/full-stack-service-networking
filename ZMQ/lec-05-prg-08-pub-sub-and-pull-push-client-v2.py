# Rerefence: https://stackoverflow.com/questions/49289072/zmq-dealer-router-communication

import random
import time
import zmq
import sys

def main(argv):
    # Prepare our context and subscriber
    ctx = zmq.Context()
    subscriber = ctx.socket(zmq.SUB)
    subscriber.setsockopt(zmq.SUBSCRIBE, b'')
    subscriber.connect("tcp://localhost:5557")
    publisher = ctx.socket(zmq.PUSH)
    publisher.connect("tcp://localhost:5558")

    clientID = argv[1]
    random.seed(time.time())
    while True:
        if subscriber.poll(100) & zmq.POLLIN:
            message = subscriber.recv()
            print("{0}: receive status => {1}".format(clientID, message))
        else:
            rand = random.randint(1, 100)
            if rand < 10:
                time.sleep(1)
                msg = "(" + clientID + ":ON)"
                publisher.send_string(msg)
                print("{0}: send status - activated".format(clientID))
            elif rand > 90:
                time.sleep(1)
                msg = "(" + clientID + ":OFF)"
                publisher.send_string(msg)
                print("{0}: send status - deactivated".format(clientID))

# usage: python lec-04-prg-08-pub-sub-and-pull-push-client-v2.py client_id
if __name__ == '__main__':
    main(sys.argv)