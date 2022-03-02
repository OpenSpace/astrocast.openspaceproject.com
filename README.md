# Wormhole
To start the Wormhole server, you will need [Node.JS and NPM](https://nodejs.org) installed on your system. With that taken care of
1. Clone this repository and enter the folder
1. Install the TypeScript package by executing `npm install -g typescript`
1. Install all potentially required packages by calling `npm install`
1. Execute the TypeScript transpiler by calling `tsc` in the repository. This will set up a running process that will transpile the necessary files every time there is a change
1. In a second terminal, start the Wormhole server by calling `node index.js`. Please note that the script can take optional commandline arguments which are described by calling `node index.js --help`

# Message Structures (version 6)
This section describes the different message types that are being sent between OpenSpace and the Wormhole application.  A message consists of a header and a type-appropriate payload

```cpp
struct {
  byte[2] header; // fixed header, must be equal to "OS"
  uint8_t version; // The version of the protocol. Must be 6
  uint8_t messageType; // The type of the message that is contained in the payload
  uint32_t messageSize; // The total size of the payload data
  byte[messageSize] payload; // The payload of the message according to the messageType
}
```


## Authentication (Type = 0)
This message is sent from OpenSpace to the Wormhole server to authenticate a new peer to a running session. It consists of a password which has to be provided, and an optional host password, and the optional name. An optional parameter is represented by a length of 0.

```cpp
struct {
  uint16_t passwordLength; // The length of the password field
  byte[passwordLength] password; // The provided password without a terminating \0

  uint16_t hostPasswordLength; // The length of the host password field or 0 if the host password is omitted
  byte[hostPasswordLength] hostPassword; // The host password

  uint8_t nameLength; // The length of the user's name or 0 if the name is omitted
  byte[nameLength] name; // The users's name
}
```

## Data (Type = 1)
This type of message is sent from the host Peer to the Wormhole server which then distributes this message to all other connected peers. This message is the primary way method for the host to send OpenSpace related data to the connected peers.  Only the host of the session should send these messages to the Wormhole server

```cpp
struct {
  enum : uint8_t {
    Camera = 0,
    Time = 1,
    Script = 2
  } dataType; // The type of data message that is being sent

  double timestamp; // A monotonously increasing timestamp used to uniquely order the data messages on the receiving end

  byte[*] payload; // The content of the data message. The length of this payload is fixed for each of the `dataTypes` and described below
}
```

### Camera
This data message contains information about the current camera
```cpp
struct {
  double[3] position; // The position of the camera
  double[4] rotation; // The orientation of the camera expressed as a quaternion
  uint8_t followNodeRotation; // A boolean expressing whether the camera is following the rotation of the current focus node. Only values 0 and 1 are allowed
  uint32_t nodeNameLength; // The length of the name of the current focus node
  byte[nodeNameLength] focusNode; // The name of the current focus node
  float scale; // The current camera scale applied to the entire scene
  double timestamp; // The timestamp of the message
}
```

### Time
This data message contains information about the current in-game time
```cpp
struct {
  double time; // The current in-game time
  double dt; // The current simulation increment
  uint8_t isPaused; // Determines whether the current simulation time is paused. Only values 0 and 1 are allowed
  uint8_t requiresTimeJump; // This value is 1 if the current `time` is far different from the `dt` + the `time` of the previous message. Otherwise it is 0
  double timestamp; // The timestamp of the message
}
```

### Script
This data message contains a Lua script that the host wants a peer to be executed
```cpp
struct {
  uint32_t scriptLength; // The length of the script message
  byte[scriptLength] script; // The contents of the script
}
```

## ConnectionStatus (Type = 2)
This message is sent from the Wormhole server to OpenSpace to inform the Peer about a change in status, be it the Peer's status or if the host of the session has changed.

```cpp
struct {
  enum : uint8_t {
    Disconnected = 0,
    Connecting = 1,
    ClientWithoutHost = 2,
    ClientWithHost = 3,
    Host = 4
  } status;  // The identifier of the status 

  uint8_t hostNameLength; // The number of characters of the new host or 0 if there is no host
  byte[hostNameLength] hostName; // The name of the current host of the session
}
```

## HostshipRequest (Type = 3)
This message is sent from OpenSpace to the Wormhole server when the Peer signals that it wants to become the active host.

```cpp
struct {
  uint16_t passwordLength; // The length of the password field
  byte[passwordLength] password; // The password
}
```

## HostshipResignation (Type = 4)
This message is sent from OpenSpace to the Wormhole server when the Peer signals that it wants to resign a potentially current hostship.

```cpp
struct {
  // No fields sent in the payload of the message
}
```

## NConnections (Type = 5)
This message is sent from the Wormhole server to OpenSpace to inform the peer about a changed number of total connected peers to the server.

```cpp
struct {
  uint32_t nConnection; // The number of total peers connected to the server
}
```
