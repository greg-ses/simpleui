

# CURRENTLY BROKEN



## Leak
- Should be zeromq, no other place in server creates a socket (except express)
  - CONFIRM THIS

## Zeromq
- can have multiple connections to the same socket (SHOULD ONLY HAVE A SINGLE SOCKET)
- should make a zmq backend for server so I can develop in dev env and not on the sim
- sui_data.ts `suiDataRequest()` and `suiCommandRequest()`  and `sendResponse()`
  - deadass have to re-write all these and maybe all `sui_data.ts`
- [zmqjs docs](https://github.com/zeromq/zeromq.js/tree/5.x)
- [zmqjs events](https://github.com/zeromq/zeromq.js/blob/5.x/lib/index.js#L155)
- [zmqjs options](https://github.com/zeromq/zeromq.js/blob/5.x/lib/index.js#L118)
- Currently broken


# issues
- [ ] mulitple clients doesn't work
- [ ] getting `<response>Fail</response>` from the sim
  - this could be due to my requests causing sometype of error
    - [BMSServer_api/BMSData/XmlReply.cpp#L345](https://gitlab.com/largo-clean-energy/vcharge_platform/-/blob/develop/BMSServer_api/BMSData/XmlReply.cpp#L345)
  - base_app also shit's itself whenever it gets this as a response lol



# New ZMQ setup steps


1. simpleui-server is transpiled
   1a. `on message` event listener is created
   1b. `httpQueue` is created
2. Base_app sends props request
3. simpleui-server responds 
4. Base_app sends data request
------------------------------ `simpleui-server.ts` ------------------------------
5. simpleui-server recieves `DATA_REQ`
6. simpleui-server creates `DATA_RES`
7. `DATA_REQ`, `DATA_RES` and `uiProps` are passed to `zmqDataRequest()`
------------------------------ `sui_data.ts zmqDataRequest()` ------------------------------
8. `uiProps` is made a global prop of `Sui_data` class
9. `zmq_port` is extracted
10. `zmq_timeout` is extracted
11. `zmq_cmd` is extracted
12. connection to socket via `zmq_port` is created
13. `zmq_msg_packet` is crafted using `zmq_cmd`
14. `zmq_msg_packet` is sent to c++ backend
------------------------------ `zmq on message listener` ------------------------------
15. `msg` is recieved
16. `DATA_REQ` and `DATA_RES` are dequeued from the queue
17. `SendResponse()` is called with `msg`, `DATA_REQ`, and `DATA_RES`
------------------------------ `sui_data.ts sendResponse()` ------------------------------
18. adds headers to `DATA_RES`
19. sends `DATA_RES`