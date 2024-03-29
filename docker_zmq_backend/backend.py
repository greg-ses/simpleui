"""
A ZMQ backend to interact with simpleui-server
Zack Beucler 10/28/22
"""

import zmq

with open('./data/table_data.sample.xml', 'rb') as data:
    table_data = data.read()



def main():
    context = zmq.Context()
    data_socket = context.socket(zmq.REP)
    data_socket.bind('tcp://*:1234')
    data_msg = "no data recieved..."

    print('starting server...')
    while True:
        try:
            data_msg = data_socket.recv()
            print('Native apps received: ', data_msg)
            data_socket.send(table_data)
        except zmq.ZMQError as e:
            if e.errno == zmq.ETERM:
                print(e)
            else:
                raise

main()
