import zmq
import sys
import socket
import time
import random

from threading import Thread, local

# dependency, not in stdlib
from netifaces import interfaces, ifaddresses, AF_INET

def search_nameserver(ip_mask, local_ip_addr, port_nameserver):
    """Search for P2P name server in the local network."""
    context = zmq.Context()
    req = context.socket(zmq.SUB)
    for last in range(1, 255):
        target_ip_addr = "tcp://{0}.{1}:{2}".format(ip_mask, last, port_nameserver)
        if target_ip_addr != local_ip_addr or target_ip_addr == local_ip_addr:
            req.connect(target_ip_addr)
        req.setsockopt(zmq.RCVTIMEO, 2000) # receive timeout for 2 seconds
        req.setsockopt_string(zmq.SUBSCRIBE, 'NAMESERVER')
    try:
        res = req.recv_string()
        res_list = res.split(':')
        if res_list[0] == 'NAMESERVER':
            #print("name server resolved at {0}".format(res_list[1]))
            return res_list[1]
        else:
            #print("name server not found")
            return None
    except:
        #print("name server not found")
        return None

def beacon_nameserver(local_ip_addr, port_nameserver):
    """Generate periodic (1 second) beacon message."""
    context = zmq.Context()
    socket = context.socket(zmq.PUB)
    socket.bind("tcp://{0}:{1}".format(local_ip_addr, port_nameserver))
    print("local p2p name server bind to tcp://{0}:{1}.".format(local_ip_addr, port_nameserver))
    while True:
        try:
            time.sleep(1)
            msg = "NAMESERVER:{0}".format(local_ip_addr)
            socket.send_string(msg)
        except (KeyboardInterrupt, zmq.ContextTerminated):
            break
    #print("local p2p name server shutdown")
    #socket.close(linger=0)
    #context.term()

def user_manager_nameserver(local_ip_addr, port_subscribe):
    """User subscription manager {ip address and user id}."""
    user_db = []
    context = zmq.Context()
    socket = context.socket(zmq.REP)
    socket.bind("tcp://{0}:{1}".format(local_ip_addr, port_subscribe))
    print("local p2p db server activated at tcp://{0}:{1}.".format(local_ip_addr, port_subscribe))
    while True:
        try:
            user_req = socket.recv_string().split(":")
            user_db.append(user_req)
            print("user registration '{0}' from '{1}'.".format(user_req[1], user_req[0]))
            socket.send_string("ok")
        except (KeyboardInterrupt, zmq.ContextTerminated):
            break
    #print("local p2p db server shutdown")
    #socket.close(linger=0)
    #context.term()

def relay_server_nameserver(local_ip_addr, port_chat_publisher, port_chat_collector):
    """Relay message between p2p users."""
    context = zmq.Context()
    publisher = context.socket(zmq.PUB)
    publisher.bind("tcp://{0}:{1}".format(local_ip_addr, port_chat_publisher))
    collector = context.socket(zmq.PULL)
    collector.bind("tcp://{0}:{1}".format(local_ip_addr, port_chat_collector))
    print("local p2p relay server activated at tcp://{0}:{1} & {2}.".format(local_ip_addr, port_chat_publisher, port_chat_collector))
    while True:
        try:
            message = collector.recv_string()
            print("p2p-relay:<==>", message)
            publisher.send_string("RELAY:{0}".format(message))
        except (KeyboardInterrupt, zmq.ContextTerminated):
            break
    #print("local p2p relay server shutdown")
    #publisher.close(linger=0)
    #collector.close(linger=0)
    #context.term()

def get_local_ip():
    """Try to determine the local IP address of the machine."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Use Google Public DNS server to determine own IP
        sock.connect(('8.8.8.8', 80))
        return sock.getsockname()[0]
    except socket.error:
        try:
            return socket.gethostbyname(socket.gethostname())
        except socket.gaierror:
            return '127.0.0.1'
    finally:
        sock.close() 

def main(argv):
    """Main function."""
    ip_addr_p2p_server = ''
    port_nameserver = 9001
    port_chat_publisher = 9002
    port_chat_collector = 9003
    port_subscribe = 9004

    user_name = argv[1]
    ip_addr = get_local_ip()
    ip_mask = ip_addr.rsplit('.', 1)[0]

    print("searching for p2p server.")

    name_server_ip_addr = search_nameserver(ip_mask, ip_addr, port_nameserver)
    if  name_server_ip_addr == None:
        ip_addr_p2p_server = ip_addr
        print("p2p server is not found, and p2p server mode is activated.")
        beacon_thread = Thread(target=beacon_nameserver, args=(ip_addr, port_nameserver,))
        beacon_thread.start()
        print("p2p beacon server is activated.")
        db_thread = Thread(target=user_manager_nameserver, args=(ip_addr, port_subscribe, ))
        db_thread.start()
        print("p2p subsciber database server is activated.")
        relay_thread = Thread(target=relay_server_nameserver, args=(ip_addr, port_chat_publisher, port_chat_collector, ))
        relay_thread.start()
        print("p2p message relay server is activated.")
    else:
        ip_addr_p2p_server = name_server_ip_addr
        print("p2p server found at {0}, and p2p client mode is activated.".format(ip_addr_p2p_server))

    print("starting user registration procedure.")

    db_client_context = zmq.Context()
    db_client_socket = db_client_context.socket(zmq.REQ)
    db_client_socket.connect("tcp://{0}:{1}".format(ip_addr_p2p_server, port_subscribe))
    db_client_socket.send_string("{0}:{1}".format(ip_addr, user_name))
    if db_client_socket.recv_string() == "ok":
        print("user registration to p2p server completed.")
    else:
        print("user registration to p2p server failed.")

    print("starting message transfer procedure.")

    relay_client = zmq.Context()
    p2p_rx = relay_client.socket(zmq.SUB)
    p2p_rx.setsockopt(zmq.SUBSCRIBE, b'RELAY')
    p2p_rx.connect("tcp://{0}:{1}".format(ip_addr_p2p_server, port_chat_publisher))
    p2p_tx = relay_client.socket(zmq.PUSH)
    p2p_tx.connect("tcp://{0}:{1}".format(ip_addr_p2p_server, port_chat_collector))

    print("starting autonomous message transmit and receive scenario.")

    while True:
        try:
            if p2p_rx.poll(100) & zmq.POLLIN:
                message = p2p_rx.recv_string()
                print("p2p-recv::<<== {0}:{1}".format(message.split(":")[1], message.split(":")[2]))    
            else:
                rand = random.randint(1, 100)
                if rand < 10:
                    time.sleep(3)
                    msg = "(" + user_name + "," + ip_addr + ":ON)"
                    p2p_tx.send_string(msg)
                    print("p2p-send::==>>", msg)
                elif rand > 90:
                    time.sleep(3)
                    msg = "(" + user_name + "," + ip_addr + ":OFF)"
                    p2p_tx.send_string(msg)
                    print("p2p-send::==>>", msg)   
        except KeyboardInterrupt:
            break

    print("closing p2p chatting program.")

    global global_flag_shutdown
    global_flag_shutdown = True
    db_client_socket.close(linger=0)
    p2p_rx.close(linger=0)
    p2p_tx.close(linger=0)
    db_client_context.term()
    relay_client.term()

if __name__ == '__main__':
    if len(sys.argv) == 1:
        print("usage is 'python dechat.py _user-name_'.")
    else:
        print('starting p2p chatting program.')
        main(sys.argv)
