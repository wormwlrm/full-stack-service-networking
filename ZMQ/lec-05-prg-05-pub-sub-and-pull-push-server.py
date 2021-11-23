# Rerefence: https://stackoverflow.com/questions/49289072/zmq-dealer-router-communication

import zmq

def main():
    # context and sockets
    ctx = zmq.Context()
    publisher = ctx.socket(zmq.PUB)
    publisher.bind("tcp://*:5557")
    collector = ctx.socket(zmq.PULL)
    collector.bind("tcp://*:5558")

    while True:
        message = collector.recv()
        print("I: publishing update ", message)
        publisher.send(message)

if __name__ == '__main__':
    main()