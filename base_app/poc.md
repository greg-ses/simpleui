
# Proof of concept notes


# -----------------------------------

```mermaid
sequenceDiagram


    Client->>SimpleUI Server: hello

    box Blue SimpleUI Server
    participant PULL/SUB Socket
    participant Request Socket
    end

    box Purple BMS
    participant PUSH/PUB Socket
    participant Reply Socket
    end
```






### Issues
- multiple clients
    - EX: two seperate clients on two seperate tabs
