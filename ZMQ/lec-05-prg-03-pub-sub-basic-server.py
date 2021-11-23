#
#   Weather update server
#   Binds PUB socket to tcp://*:5556
#   Publishes random weather updates
#
#   Reference: https://zguide.zeromq.org/docs/chapter1/#Getting-the-Message-Out

import zmq
from random import randrange

# Added from the original code
print("Publishing updates at weather server...") 

context = zmq.Context()
socket = context.socket(zmq.PUB)
socket.bind("tcp://*:5556")

while True:
    zipcode = randrange(1, 100000)
    temperature = randrange(-80, 135)
    relhumidity = randrange(10, 60)

    socket.send_string(f"{zipcode} {temperature} {relhumidity}")