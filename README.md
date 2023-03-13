

## Python PUSH/PULL with reconnect
```python
import zmq
import time

class ZmqPullSocket:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.PULL)
        self.socket.connect(self.endpoint)

    def receive_message(self):
        message = self.socket.recv_string()
        return message

    def close(self):
        self.socket.close()
        self.context.term()

class ZmqPushSocket:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.PUSH)
        self.socket.connect(self.endpoint)

    def send_message(self, message):
        self.socket.send_string(message)

    def close(self):
        self.socket.close()
        self.context.term()

    def run(self):
        while True:
            try:
                message = input("Enter a message to send: ")
                self.send_message(message)
            except zmq.error.ZMQError as e:
                print(f"Error: {e}")
                print("Attempting to reconnect...")
                time.sleep(1)
                self.socket.connect(self.endpoint)
```
### Ussage:
```python
# Create a PULL socket and start receiving messages
pull_socket = ZmqPullSocket("tcp://localhost:5555")
while True:
    try:
        message = pull_socket.receive_message()
        print(f"Received message: {message}")
    except zmq.error.ZMQError as e:
        print(f"Error: {e}")
        print("Attempting to reconnect...")
        time.sleep(1)
        pull_socket.socket.connect(pull_socket.endpoint)

# Create a PUSH socket and start sending messages
push_socket = ZmqPushSocket("tcp://localhost:5555")
push_socket.run()
```

## Zmq PUB/SUB with reconnect
```python
import zmq
import time

class ZmqSubSocket:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.SUB)
        self.socket.connect(self.endpoint)
        self.socket.setsockopt_string(zmq.SUBSCRIBE, "")

    def receive_message(self):
        message = self.socket.recv_string()
        return message

    def close(self):
        self.socket.close()
        self.context.term()

class ZmqPubSocket:
    def __init__(self, endpoint):
        self.endpoint = endpoint
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.PUB)
        self.socket.bind(self.endpoint)

    def send_message(self, topic, message):
        self.socket.send_string(f"{topic} {message}")

    def close(self):
        self.socket.close()
        self.context.term()

    def run(self):
        while True:
            try:
                topic = input("Enter a topic: ")
                message = input("Enter a message to send: ")
                self.send_message(topic, message)
            except zmq.error.ZMQError as e:
                print(f"Error: {e}")
                print("Attempting to reconnect...")
                time.sleep(1)
                self.socket.bind(self.endpoint)
```
## Usage
```python
# Create a SUB socket and start receiving messages
sub_socket = ZmqSubSocket("tcp://localhost:5555")
while True:
    try:
        message = sub_socket.receive_message()
        print(f"Received message: {message}")
    except zmq.error.ZMQError as e:
        print(f"Error: {e}")
        print("Attempting to reconnect...")
        time.sleep(1)
        sub_socket.socket.connect(sub_socket.endpoint)


# Create a PUB socket and start sending messages
pub_socket = ZmqPubSocket("tcp://localhost:5555")
pub_socket.run()
```


## c++17 classes
```c++
#pragma once

#include <zmq.hpp>
#include <string>

class ZMQPushSocket {
public:
    ZMQPushSocket() : m_context(1), m_socket(m_context, zmq::socket_type::push) {}

    bool Connect(const std::string& endpoint) {
        try {
            m_socket.connect(endpoint);
        }
        catch (const zmq::error_t& e) {
            return false;
        }
        return true;
    }

    void Send(const std::string& message) {
        zmq::message_t zmqMsg(message.size());
        memcpy(zmqMsg.data(), message.data(), message.size());
        m_socket.send(zmqMsg, zmq::send_flags::none);
    }

private:
    zmq::context_t m_context;
    zmq::socket_t m_socket;
};


#pragma once

#include <zmq.hpp>
#include <string>
#include <deque>

class ZMQPullSocket {
public:
    ZMQPullSocket() : m_context(1), m_socket(m_context, zmq::socket_type::pull) {}

    bool Bind(const std::string& endpoint) {
        try {
            m_socket.bind(endpoint);
        }
        catch (const zmq::error_t& e) {
            return false;
        }
        return true;
    }

    std::string Receive() {
        zmq::message_t zmqMsg;
        m_socket.recv(zmqMsg, zmq::recv_flags::none);
        std::string message(static_cast<char*>(zmqMsg.data()), zmqMsg.size());
        m_messages.push_back(message);
        if (m_messages.size() > 5) {
            m_messages.pop_front();
        }
        return message;
    }

private:
    zmq::context_t m_context;
    zmq::socket_t m_socket;
    std::deque<std::string> m_messages;
};


#pragma once

#include <zmq.hpp>
#include <string>

class ZMQPubSocket {
public:
    ZMQPubSocket() : m_context(1), m_socket(m_context, zmq::socket_type::pub) {}

    bool Bind(const std::string& endpoint) {
        try {
            m_socket.bind(endpoint);
        }
        catch (const zmq::error_t& e) {
            return false;
        }
        return true;
    }

    void Send(const std::string& topic, const std::string& message) {
        zmq::message_t zmqTopic(topic.size());
        memcpy(zmqTopic.data(), topic.data(), topic.size());
        m_socket.send(zmqTopic, zmq::send_flags::sndmore);

        zmq::message_t zmqMsg(message.size());
        memcpy(zmqMsg.data(), message.data(), message.size());
        m_socket.send(zmqMsg, zmq::send_flags::none);
    }

private:
    zmq::context_t m_context;
    zmq::socket_t m_socket;
};



#pragma once

#include <zmq.hpp>
#include <string>
#include <unordered_set>

class ZMQSubSocket {
public:
    ZMQSubSocket() : m_context(1), m_socket(m_context, zmq::socket_type::sub) {}

    bool Connect(const std::string& endpoint) {
        try {
            m_socket.connect(endpoint);
        }
        catch (const zmq::error_t& e) {
            return false;
        }
        return true;
    }

    void Subscribe(const std::string& topic) {
        m_socket.setsockopt(ZMQ_SUBSCRIBE, topic.data(), topic.size());

    }
};
```
























![Frontend unit tests](https://github.com/greg-ses/simpleui/actions/workflows/frontend_tests.yml/badge.svg?event=push&branch=improve-testing)

![Docker image](https://github.com/greg-ses/simpleui/actions/workflows/dockerimage.yml/badge.svg)


# Simple UI

Simple UI is a real-time display framework using `Angular 14` for the front end display
and `Node.js` 18 as a back end service provider.  The front-end part of simpleui (`base_app`)
sends http requests to the backend end part of simpleui (`simpleui-server`), which in turn
sends and receives `ZeroMQ XML` messages to a second backend server (typically C++).
`simpleui-server` translates the received `.xml` into `.json` responses and sends them
back to the front end.


## Basic setup

- Node 18+
- NPM
- Docker


## Development installation

- Clone the repo `git clone https://github.com/greg-ses/simpleui simpleui && cd simpleui`
- Build the development docker container `docker build -t sui-dev-image -f develop_docker/Dockerfile .`
- start the dev enviroment `bash run-dev-env.bash`
    - This might take a while since it will download the `node_modules` for `base_app` and `simpleui-server`


## Production installation

When running SimpleUI in production, the docker container requires some CLI arguments.
```bash
docker run simpleui-image YOUR_APP_NAME zmqHostname=YOUR_ZMQ_HOSTNAME
```
- `YOUR_APP_NAME`: The name of your SimpleUI instance
- `zmqHostname=`: The hostname of your ZMQ REPLY sockets

## Testing

- Start the dev enviroment and enter the docker container
- For frontend unit testing, run `ng test` in the `base_app` folder
- For backend unit testing, run `npm run test` in the `simpleui-server` folder
- E2E testing is coming soon


## Linting
- Start the dev enviroment and enter the docker container
- For frontend linting, run `ng lint` in the `base_app` folder
- For backend linting, run `npm run lint` in the `simpleui-server` folder


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.


## Credits

Project started by James Scarsdale and Greg Morehead. Karen Cummings created much of the initial
scaffolding when Angular 2 was in constant flux. Tom Alexander has made very significant
architectural contributions to the product. Docker environment by Nick Tosta. Maintained By Zack Beucler


## License

[MIT](https://choosealicense.com/licenses/mit/)

