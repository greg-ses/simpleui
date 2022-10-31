"""
A ZMQ backend to interact with simpleui-server
Zack Beucler 10/28/22
"""

import time
import zmq


with open('./data/table_data.sample.xml', 'rb') as data:
    table_data = data.read()



def main():
    context = zmq.Context()
    data_socket = context.socket(zmq.REP)
    data_socket.bind('tcp://*:1234')

    cmd_socket = context.socket(zmq.REP)
    cmd_socket.bind('tcp://*:5482')
    print('starting server...')

    while True:
        try:
            msg = data_socket.recv()
        except zmq.ZMQError as e:
            if e.errno == zmq.ETERM:
                print(e)
            else:
                raise
        print(msg)
 

        data_socket.send(table_data)

main()