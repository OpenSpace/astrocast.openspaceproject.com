import * as net from 'net';

const CurrentProtocolVersion = 6;

const Debug = true;
const ChattyDebug = false;

enum MessageType {
  Authentication = 0,
  Data = 1,
  ConnectionStatus = 2,
  HostshipRequest = 3,
  HostshipResignation = 4,
  NConnections = 5
};

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


export class Server {
  //
  // Incoming settings
  //
  // The port on which this server is listening
  port: number;
  // The cleartext password that peers need to provide to connect
  password: string;
  // The cleartext password for assuming hostship
  hostPassword: string;

  //
  // State
  //
  // The list of all connected peers
  peers: Peer[] = [];
  // The id of the current host
  currentHostId: number = null;
  // The server listening in to incoming connections
  server: net.Server;

  constructor(port: number, password: string, hostPassword: string) {
    this.port = port;
    this.password = password;
    this.hostPassword = hostPassword;

    this.server = net.createServer();
    this.server.listen(this.port, () => {
      console.log(`Server listening to connections on port ${this.port} with password ${this.password} and host password ${this.hostPassword}`);
    });

    this.server.on('connection', (socket: net.Socket) => {
      let peer: Peer = {
        id: this.peers.length,
        name: "",
        socket: socket,
        status: ConnectionStatus.Connecting
      };
      console.log(`Added new peer: ${peer.id}`);

      socket.on('data', (data) => { this.onData(data, peer); });
      socket.on('end', () => { this.onEnd(peer); });
      socket.on('error', (err) => { console.error(`Error: ${err} from peer ${peer.id}`)});
    });
  }

  // private handlers
  onData(data, peer: Peer) {
    if (ChattyDebug)  console.log("Incoming data", data);
    
    const HeaderSize = 2 + 1 + 1 + 4; // OS + Protocol + Type + MsgSize
    if (data.length < HeaderSize) {
      // The message we received cannot be valid since it doesn't even contain the header
      // information
      return;
    }

    // Get the hard-corded prefix
    const prefix = data.slice(0, 2).toString('utf-8');
    if (prefix !== 'OS') {
      // The message did not start with the OS prefix
      return;
    }

    // Convert Buffer to ArrayBuffer for use with the DataView
    let dv = new DataView(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));

    let offset = 2;
    const protocolVersion = dv.getUint8(offset);
    offset += 1;
    if (protocolVersion !== CurrentProtocolVersion) {
      // We received an invalid protocol version
      return;
    }

    const messageType = dv.getUint8(offset);
    offset += 1;
    if (!(messageType in MessageType)) {
      // We received an invalid message type
      return;
    }

    const messageSize = dv.getUint32(offset, true);
    offset += 4;
    if (data.byteLength !== offset + messageSize) {
      // The provided message size was not the same as the actual message length
      return;
    }
    data = data.slice(offset);

    switch (messageType) {
      case MessageType.Authentication:
        this.handleAuthentication(data, peer);
        break;
      case MessageType.Data:
        this.handleData(data, peer);
        break;
      case MessageType.HostshipRequest:
        this.handleHostshipRequest(data, peer);
        break;
      case MessageType.HostshipResignation:
        this.handleHostshipResignation(data, peer);
        break;
    }
  }

  onEnd(peer: Peer) {
    console.log(`Closing connection with peer ${peer.id}`);

    if (this.currentHostId === peer.id) {
      this.removeHostship();
    }

    let idx = this.peers.findIndex((p) => { return peer.id === p.id; });
    console.assert(idx !== -1);
    this.peers.splice(idx, 1);

    this.sendNumberConnections();
  }

  //
  // private message handlers
  //
  handleAuthentication(data, peer: Peer) {
    if (Debug)  console.log(`Received Authentication from ${peer.id}`);

    let dv = new DataView(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    let offset = 0;
    const passwordSize = dv.getUint16(offset, true);
    offset += 2;
    console.log(passwordSize);
    if (passwordSize === 0) {
      // We didn't get any password at all, so we should bail out
      return;
    }
    const password = data.slice(offset, offset + passwordSize).toString('utf-8');
    offset += passwordSize;
    console.log(password);
    if (password !== this.password) {
      // We received the wrong password
      return;
    }

    const hostPasswordSize = dv.getUint16(offset, true);
    offset += 2;
    const hostPassword =
      hostPasswordSize === 0 ?
      "" :
      data.slice(offset, offset + hostPasswordSize).toString('utf-8');
    offset += hostPasswordSize;

    const nameSize = dv.getUint8(offset);
    offset += 1;
    const name =
      nameSize === 0 ?
      "Anonymous" :
      data.slice(offset, offset + nameSize).toString('utf-8');
    offset += nameSize;
    peer.name = name;
    this.peers.push(peer);


    if (this.currentHostId === null && hostPassword === this.hostPassword) {
      // We don't have a current host and this peer provided the correct password,
      // so we can instantly promote them
      console.log(`Connection ${peer.id} [${peer.name}] directly promoted to host`);
      this.assignHost(peer);
    }
    else {
      console.log(`Connection ${peer.id} [${peer.name}] is client`);
      peer.status = this.currentHostId === null ?
        ConnectionStatus.ClientWithoutHost :
        ConnectionStatus.ClientWithHost;
      this.sendConnectionStatus(peer);
    }
    this.sendNumberConnections();
  }

  handleData(data, peer: Peer) {
    if (ChattyDebug)  console.log(`Received Data from ${peer.id}: ${peer.name}`);
        
    if (peer.id !== this.currentHostId) {
      console.log(`Ignoring connection ${peer.id} [${peer.name}] trying to send data`);
      return;
    }

    this.peers.forEach((peer: Peer) => { 
      if (peer.status === ConnectionStatus.ClientWithHost) {
        this.sendMessage(peer, MessageType.Data, data);
      }
    });
  }

  handleHostshipRequest(data, peer: Peer) {
    if (Debug)  console.log(`Received HostshipRequest from ${peer.id} [${peer.name}]`);
        
    console.log(`Connection ${peer.id} [${peer.name}] requested hostship`);

    let dv = new DataView(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength));
    let offset = 0;

    const passwordSize = dv.getUint16(offset, true);
    offset += 2;
    if (passwordSize === 0) {
      // We didn't get any password at all, so we should bail out
      return;
    }
    const password = data.slice(offset, offset + passwordSize).toString('utf-8');
    offset += passwordSize;
    if (password !== this.hostPassword) {
      console.log(`Connection ${peer.id} [${peer.name}] provided incorrect host password`);
      if (Debug)  console.log(`Provided: ${password}.  Is ${this.hostPassword}`);
      // We received the wrong password
      return;
    }

    if (this.currentHostId === peer.id) {
      console.log(`Connection ${peer.id} [${peer.name}] is already the host`);
      return;
    }

    this.assignHost(peer);
  }

  handleHostshipResignation(data, peer: Peer) {
    if (Debug)  console.log(`Received HostshipResignation from ${peer.id} [${peer.name}]`);
        
    if (peer.status === ConnectionStatus.Host) {
      this.removeHostship();
    }
  }

  //
  // private methods
  //
  currentHost(): Peer {
    if (this.currentHostId === null) {
      return null;
    }
    else {
      console.log(this.peers);
      let idx = this.peers.findIndex((p) => { return p.id === this.currentHostId; });
      console.log(idx);
      console.assert(idx !== -1, `Could not find current host with id ${this.currentHostId}`);
      return this.peers[idx];
    }
  }

  sendMessage(peer: Peer, messageType: MessageType, data: ArrayBuffer) {
    let buffer = new ArrayBuffer(
      2 + // OS header
      Uint8Array.BYTES_PER_ELEMENT +  // protocol version
      Uint8Array.BYTES_PER_ELEMENT +  // message type
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
    dv.setUint8(offset, CurrentProtocolVersion);
    offset += 1;
  
    // Message type
    dv.setUint8(offset, messageType);
    offset += 1;
  
    // Message size
    dv.setUint32(offset, data.byteLength, true);
    offset += 4;
  
    // Copy the message
    let bufferView = new Uint8Array(buffer);
    bufferView.set(new Uint8Array(data), offset);
    
    if (Debug && messageType !== MessageType.Data) {
      console.log(`Sending to ${peer.id} [${peer.name}]`, buffer);
    }
    if (ChattyDebug && messageType === MessageType.Data) {
      console.log(`Sending to ${peer.id} [${peer.name}]`, buffer);
    }
  
    peer.socket.write(bufferView);
  }

  sendConnectionStatus(peer: Peer) {
    let currentHost = this.currentHost();
    console.log(currentHost);
    const currentHostName = currentHost === null ? "" : currentHost.name;
  
    let buffer = new ArrayBuffer(
      Uint8Array.BYTES_PER_ELEMENT + // Status
      Uint8Array.BYTES_PER_ELEMENT + // Length of new host
      currentHostName.length          // Host name
    );
  
    let dv = new DataView(buffer);
    let offset = 0;
    
    dv.setUint8(offset, peer.status);
    offset += 1;
  
    dv.setUint8(offset, currentHostName.length);
    offset += 1;
  
    let bufferView = new Uint8Array(buffer);
    for (let i = 0; i < currentHostName.length; i += 1) {
      bufferView[offset + i ] = currentHostName.charCodeAt(i);
    }
    
    this.sendMessage(peer, MessageType.ConnectionStatus, buffer);
  }

  sendNumberConnections() {
    let buffer = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    let dv = new DataView(buffer);
    dv.setUint32(0, this.peers.length, true);
    this.peers.forEach((peer: Peer) => {
      this.sendMessage(peer, MessageType.NConnections, buffer);
    });
  }

  assignHost(newHost: Peer) {
    if (this.currentHostId !== null) {
      let oldHost = this.currentHost();
      oldHost.status = ConnectionStatus.ClientWithHost;
    }
  
    this.currentHostId = newHost.id;
    newHost.status = ConnectionStatus.Host;
  
    // Update everyone about the new host
    this.peers.forEach((peer: Peer) => {
      // If there was no host before, we need to let people know about the new host
      if (peer.status === ConnectionStatus.ClientWithoutHost) {
        peer.status = ConnectionStatus.ClientWithHost;
      }
      this.sendConnectionStatus(peer);
    });
  }

  removeHostship() {
    // If we were the host, we were just demoted, so we should remove information
    // about the current host
    this.currentHostId = null;
  
    // and then also everyone just lost their host and should know about it, the
    // `peers` list also includes the former host, so need to touch the `peer` again
    this.peers.forEach((peer: Peer) => {
      peer.status = ConnectionStatus.ClientWithoutHost;
      this.sendConnectionStatus(peer);
    });
  }
}

// export Server;
// 
// module.exports = {
//   server: Server
// };
