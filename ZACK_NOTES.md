

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