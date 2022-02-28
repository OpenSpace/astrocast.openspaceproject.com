import * as net from 'net';

const ChattyDebug = false;
const Debug = true;


//
//  Extract commandline arguments
//
let settings = {
  port: 25001,
  password: Math.random().toString(16).slice(2, 10),
  hostPassword: Math.random().toString(16).slice(2, 10)
};

let argv = process.argv.slice(2);
if (argv.length === 1 && argv[0] === "--help") {
  console.log("Usage:");
  console.log("  --help:          This message");
  console.log("  --port:          The port this server should use instead");
  console.log("  --password:      The password this server should use instead");
  console.log("  --hostpassword:  The host password this server should use instead");
  process.exit(0);
}

for (let i = 0; i < argv.length; i += 2) {
  switch (argv[i]) {
    case "--port":
      settings.port = parseFloat(argv[i + 1]);
      break;
    case "--password":
      settings.password = argv[i + 1];
      break;
    case "--hostpassword":
      settings.hostPassword = argv[i + 1];
      break;
    default:
      console.error(`Unknown commandline argument ${argv[i]}`);
      process.exit(1);
  }
}

const CurrentProtocolVersion = 5;

enum MessageType {
  Authentication = 0,
  Data = 1,
  ConnectionStatus = 2,
  HostshipRequest = 3,
  HostshipResignation = 4,
  NConnections = 5,
  Disconnection = 6
};

//
//  Peers
//
enum ConnectionStatus {
  Disconnected = 0,
  Connecting = 1,
  ClientWithoutHost = 2,
  ClientWithHost = 3,
  Host = 4
};

interface Peer {
  id: number,
  name: string,
  socket: net.Socket,
  status: ConnectionStatus
}

//
//  state
//
let peers: Peer[] = [];
let currentHostId: number = null;

function sendMessage(peer: Peer, messageType: MessageType, data: ArrayBuffer) {
  let buffer = new ArrayBuffer(
    2 + // OS header
    Uint32Array.BYTES_PER_ELEMENT + // protocol version
    Uint32Array.BYTES_PER_ELEMENT + // message type
    Uint32Array.BYTES_PER_ELEMENT + // message size
    data.byteLength                 // message
  );

  let dv = new DataView(buffer);
  let offset = 0;

  // Set OS header
  dv.setUint8(offset, 'OS'.charCodeAt(0));
  offset += 1;
  dv.setUint8(offset, 'OS'.charCodeAt(1));
  offset += 1;

  // Protocol version
  dv.setUint32(offset, CurrentProtocolVersion, true);
  offset += 4;

  // Message type
  dv.setUint32(offset, messageType, true);
  offset += 4;

  // Message size
  dv.setUint32(offset, data.byteLength, true);
  offset += 4;

  // Copy the message
  let bufferView = new Uint8Array(buffer);
  bufferView.set(new Uint8Array(data), offset);
  
  if (Debug)  console.log("Sending", buffer);

  peer.socket.write(bufferView);
}

function sendConnectionStatus(peer: Peer) {
  const currentHostName = currentHostId === null ? "" : peers[currentHostId].name;

  let buffer = new ArrayBuffer(
    Uint32Array.BYTES_PER_ELEMENT + // Status
    Uint32Array.BYTES_PER_ELEMENT + // Length of new host
    currentHostName.length          // Host name
  );

  let dv = new DataView(buffer);
  let offset = 0;
  
  dv.setUint32(offset, peer.status, true);
  offset += 4;

  dv.setUint32(offset, currentHostName.length, true);
  offset += 4;

  for (let i = 0; i < currentHostName.length; i += 1) {
    dv.setUint8(offset + i, currentHostName.charCodeAt(i));
  }
  
  sendMessage(peer, MessageType.ConnectionStatus, buffer);
}

function sendNumberConnections() {
  let buffer = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
  let dv = new DataView(buffer);
  dv.setUint32(0, peers.length, true);
  peers.forEach((peer: Peer) => { sendMessage(peer, MessageType.NConnections, buffer); });
}

function assignHost(newHost: Peer) {
  if (currentHostId !== null) {
    let oldHost = peers[currentHostId];
    oldHost.status = ConnectionStatus.ClientWithHost;
  }

  currentHostId = newHost.id;
  newHost.status = ConnectionStatus.Host;

  // Update everyone about the new host
  peers.forEach((peer: Peer) => { sendConnectionStatus(peer); });
}

function setToClient(peer: Peer) {
  if (peer.status === ConnectionStatus.Host) {
    // If we were the host, we were just demoted, so we should remove information about
    // the current host
    currentHostId = null;

    // and then also everyone just lost their host and should know about it, the `peers`
    // list also includes the former host, so need to touch the `peer` again
    peers.forEach((peer: Peer) => {
      peer.status = ConnectionStatus.ClientWithoutHost;
      sendConnectionStatus(peer);
    });
  }
  else {
    // @TODO:  Not sure if this case is actually necessary.  When would it happen that we
    //         have to reaffirm the host-having of a client?  The demotion of the host
    //         should tell everyone

    // We only need to send a message if something has actually changed
    if (currentHostId === null && peer.status === ConnectionStatus.ClientWithHost) {
      // -> The client had a host before, but 
      peer.status = ConnectionStatus.ClientWithoutHost;
      sendConnectionStatus(peer);
    }
    else if (currentHostId !== null && peer.status === ConnectionStatus.ClientWithoutHost) {
      peer.status = ConnectionStatus.ClientWithHost;
      sendConnectionStatus(peer);
    }
  }
}

//
//  main
//
const server = net.createServer() as net.Server;
server.listen(settings.port, () => {
  console.log(`Server listening to connections on port ${settings.port} with password ${settings.password} and host password ${settings.hostPassword}`);
});

let nextConnectionId = 0;
server.on('connection', function(socket) {
  let peer: Peer = {
    id: nextConnectionId,
    name: "",
    socket: socket,
    status: ConnectionStatus.Connecting
  };
  nextConnectionId += 1;
  console.log(`Added new peer: ${peer.id}`);

  socket.on('data', function(data) {
    if (ChattyDebug)  console.log("Incoming data", data);
    
    const HeaderSize = 'OS'.length + 3 * Uint32Array.BYTES_PER_ELEMENT;
    if (data.length < HeaderSize) {
      // The message we received cannot be valid since it doesn't even contain the header
      // information
      return;
    }

    // Get the hard-corded prefix
    const prefix = data.slice(0, 2).toString('utf-8');
    data = data.slice(2);
    if (prefix !== 'OS') {
      // The message did not start with the OS prefix
      return;
    }

    // Convert Buffer to ArrayBuffer for use with the DataView
    let dv = new DataView(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

    const protocolVersion = dv.getUint32(0, true);
    if (protocolVersion !== CurrentProtocolVersion) {
      // We received an invalid protocol version
      return;
    }

    const messageType = dv.getUint32(4, true);
    if (!(messageType in MessageType)) {
      // We received an invalid message type
      return;
    }

    const messageSize = dv.getUint32(8, true);
    if (data.byteLength !== 12 + messageSize) {
      // The provided message size was not the same as the actual message length
      return;
    }

    let offset = 12;
    switch (messageType) {
      case MessageType.Authentication: {
        if (Debug)  console.log(`Received Authentication from ${peer.id}: ${peer.name}`);

        const passwordSize = dv.getUint32(offset, true);
        offset += 4;
        if (passwordSize === 0) {
          // We didn't get any password at all, so we should bail out
          return;
        }
        const password = data.slice(offset, offset + passwordSize).toString('utf-8');
        offset += passwordSize;
        if (password !== settings.password) {
          // We received the wrong password
          return;
        }

        const hostPasswordSize = dv.getUint32(offset, true);
        offset += 4;
        const hostPassword =
          hostPasswordSize === 0 ?
          "" :
          data.slice(offset, offset + hostPasswordSize).toString('utf-8');
        offset += hostPasswordSize;

        const nameSize = dv.getUint32(offset, true);
        offset += 4;
        const name =
          nameSize === 0 ?
          "Anonymous" :
          data.slice(offset, offset + nameSize).toString('utf-8');
        offset += nameSize;
        peer.name = name;
        peers.push(peer);


        if (currentHostId === null && hostPassword === settings.hostPassword) {
          // We don't have a current host and this peer provided the correct password,
          // so we can instantly promote them
          console.log(`Connection ${peer.id}: ${peer.name} directly promoted to host`);
          assignHost(peer);
        }
        else {
          peer.status = currentHostId === null ?
            ConnectionStatus.ClientWithoutHost :
            ConnectionStatus.ClientWithHost;
          sendConnectionStatus(peer);
        }
        sendNumberConnections();
        break;
      }
      case MessageType.Data: {
        if (ChattyDebug)  console.log(`Received Data from ${peer.id}: ${peer.name}`);
        
        if (peer.id !== currentHostId) {
          console.log(`Ignoring connection ${peer.id}: ${peer.name} trying to send data`);
          return;
        }

        let payload = data.slice(offset);
        peers.forEach((peer: Peer) => { 
          if (peer.status === ConnectionStatus.ClientWithHost) {
            sendMessage(peer, MessageType.Data, payload);
          }
        });
        break;
      }
      case MessageType.HostshipRequest: {
        if (Debug)  console.log(`Received HostshipRequest from ${peer.id}: ${peer.name}`);
        
        console.log(`Connection ${peer.id}: ${peer.name} requested hostship`);

        const passwordSize = dv.getUint32(offset, true);
        offset += 4;
        if (passwordSize === 0) {
          // We didn't get any password at all, so we should bail out
          return;
        }
        const password = data.slice(offset, offset + passwordSize).toString('utf-8');
        offset += passwordSize;
        if (password !== settings.hostPassword) {
          console.log(`Connection ${peer.id}: ${peer.name} provided incorrect host password`);
          if (Debug)  console.log(`Provided: ${password}.  Is ${settings.hostPassword}`);
          // We received the wrong password
          return;
        }

        if (currentHostId === peer.id) {
          console.log(`Connection ${peer.id}: ${peer.name} is already the host`);
          return;
        }

        assignHost(peer);
        break;
      }
      case MessageType.HostshipResignation: {
        if (Debug)  console.log(`Received HostshipResignation from ${peer.id}: ${peer.name}`);
        
        if (peer.status === ConnectionStatus.Host) {
          setToClient(peer);
        }
        break;
      }
      case MessageType.Disconnection: {
        break;
      }
    }
  });

  socket.on('end', function() {
    console.log(`Closing connection with peer ${peer.id}`);
  });

  socket.on('error', function(err) {
    console.log(`Error: ${err} from peer ${peer.id}`);
  });
});

//
// app.get('/', (req, res) => {
//   res.setHeader('Content-Type', 'text/plain');
//   console.log('hello');
//   res.status(200).end();
// });
// 
// app.listen(8080)

// console.loog(settings, argv);
