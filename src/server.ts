/*****************************************************************************************
 *                                                                                       *
 * Wormhole                                                                              *
 *                                                                                       *
 * Copyright (c) 2022-2024                                                               *
 *                                                                                       *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this  *
 * software and associated documentation files (the "Software"), to deal in the Software *
 * without restriction, including without limitation the rights to use, copy, modify,    *
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to    *
 * permit persons to whom the Software is furnished to do so, subject to the following   *
 * conditions:                                                                           *
 *                                                                                       *
 * The above copyright notice and this permission notice shall be included in all copies *
 * or substantial portions of the Software.                                              *
 *                                                                                       *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,   *
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A         *
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT    *
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  *
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE  *
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                         *
 ****************************************************************************************/

import * as net from "net";

const CurrentProtocolVersion = 6;

const Debug = false;
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


/**
 * Represents a peer to this server, which is an instance that is capable of receiving any
 * of these message types are responding according to the protocol.
 */
type Peer = {
  /**
   * A unique ID for this peer. IDs might be reused through the lifetime of the server if
   * peers connect and disconnect, but at any given time it is guaranteed that a specific
   * id will belong to either exactly 1 or no Peer.
   */
  id: number,

  /**
   * The user-provided name for this peer, or "Anonymous" if no name was specified. The
   * name can have a maximum length of 255 characters and can only consist of ASCII
   * characters.
   */
  name: string,

  /**
   * The socket on which to contact the Peer and send messages to.
   */
  socket: net.Socket,

  /**
   * The current status of this Peer as it has been communicated.
   */
  status: ConnectionStatus
};


/**
 * An instance of a server that is listening on a specific port and equipped with a
 * password and host password. Each server is handling a unique group of peers, one of
 * which might be the *host* of the session that is controlling what everyone in the group
 * can see, which simulation time is used, and also who can execute Lua scripts on all
 * connected instances.
 */
export class Server {
  /**
   * Constructor for a unique server.
   *
   * @param port The port on which this server should listen to new connections. This port
   *        must not already be in used on this computer
   * @param password The password that needs to be provided by Peers to connect to this
   *        server. This password has a maximum length of 65535 characters and can consist
   *        only of ASCII characters
   * @param hostPassword This host password that has to be provided by peers if they want
   *        to be either directly promoted to hostship when connecting to a server that
   *        does not have a host yet or that want to assume hostship in the middle of a
   *        session. The host password can have a maximum length of 65535 characters and
   *        can consist only of ASCII characters
   */
  constructor(port: number, password: string, hostPassword: string) {
    this.port = port;
    this.password = password;
    this.hostPassword = hostPassword;

    this.server = net.createServer();
    this.server.listen(
      this.port,
      () => { console.log(`Listening on port ${this.port} with password ${this.password} and host password ${this.hostPassword}`); }
    );

    this.server.on("connection", (socket: net.Socket) => {
      // We are creating a peer already now, but it will only get added to the peer list
      // when the successful authentication method is sent, which has to include the valid
      // password for this server
      let peer: Peer = {
        id: this.peers.length,
        name: "",
        socket: socket,
        status: ConnectionStatus.Connecting
      };
      console.log(`Created new peer: ${peer.id}`);

      socket.on("data", (data) => { this.onData(data, peer); });
      socket.on("end", () => { this.onEnd(peer); });
      socket.on("error", (err) => { console.error(`Error: ${err} from peer ${peer.id}`)});
    });
  }


  /**
   * This method handles incoming data packages on the socket. The method will try to
   * unpack the message and bail out early if it determines the message to be invalid. If
   * the message is accepted, it will be forwarded to the correct handler that will react
   * to the message accordingly.
   *
   * @param data The data package that was received on the socket
   * @param peer The peer from which this data package was received
   */
  private onData(data: Buffer, peer: Peer): void {
    if (ChattyDebug) {
      console.log("Incoming data", data);
    }

    const HeaderSize =
      "OS".length +
      Uint8Array.BYTES_PER_ELEMENT +  // protocol version number
      Uint8Array.BYTES_PER_ELEMENT +  // message type identifier
      Uint32Array.BYTES_PER_ELEMENT;  // payload size in bytes
    if (data.length < HeaderSize) {
      // The message we received cannot be valid since it doesn't even contain the header
      // information
      return;
    }

    // Get the hard-corded prefix
    const prefix = data.subarray(0, 2).toString("utf-8");
    if (prefix != "OS") {
      // The message did not start with the OS prefix
      return;
    }

    let dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );

    let offset = "OS".length;
    const protocolVersion = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    if (protocolVersion != CurrentProtocolVersion) {
      // We received an invalid protocol version
      // @TODO:  We should send back an error message to the Peer informing them of the
      //         fact that we rejected them due to an invalid protocol version
      return;
    }

    const messageType = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    if (!(messageType in MessageType)) {
      // We received an invalid message type
      // @TODO:  We should send back an error message to the Peer informing them of the
      //         fact that we rejected them due to a wrong message type
      return;
    }

    const messageSize = dv.getUint32(offset, true);
    offset += Uint32Array.BYTES_PER_ELEMENT;
    if (data.byteLength != offset + messageSize) {
      // The provided message size was not the same as the actual message length
      return;
    }

    // Now that we have extracted all of the header data, we can chop off the front
    data = data.subarray(offset);
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


  /**
   * Handles the termination of a Peer connection. This usually would happen if the Peer
   * voluntarily disconnects from the server. When that happens, we want to forget about
   * the peer, free up that ID slot and no longer send messages to that instance. If the
   * Peer that just disconnected was the host, every peer gets a message informing them of
   * the fact that they are now host-less.
   *
   * @param peer The peer that just disconnected
   */
  private onEnd(peer: Peer) {
    console.log(`Closing connection with peer ${peer.id}`);

    // The Peer that just disconnected might have been the host
    if (this.currentHostId == peer.id) {
      this.removeHostship();
    }

    // Find the index in the peers list that corresponds to the Peer that disconnected
    // and then remove it from the list. This will also kill the accompanying socket
    let idx = this.peers.findIndex((p) => { return peer.id == p.id; });
    console.assert(idx != -1, `Could not find peer ${peer.id} that just disconnected`);
    this.peers.splice(idx, 1);

    // Inform everyone about the fact that there is now one less Peer in the group
    this.sendNumberConnections();
  }


  /**
   * Handles an incoming authentication method by the provided @param peer. If the
   * authentication method is invalid in any form, the function will bail out. If the
   * message is valid and contains the correct password, the @param peer is added to the
   * list of all peers in the group. If the provided host password is also correct **and**
   * there is no currently assigned host, the @param peer is automatically promoted to
   * hostship, too.
   *
   * @param data The payload of the authentication message
   * @param peer The peer from which this message came
   */
  private handleAuthentication(data: Buffer, peer: Peer) {
    if (Debug) {
      console.log(`Received Authentication from ${peer.id}`);
    }

    let dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );

    let offset = 0;
    const passwordSize = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    if (passwordSize == 0) {
      // We didn't get any password at all, so we should bail out
      // @TODO:  We should probably allow people to not set a password, if they want to
      //         make a group as open as possible
      return;
    }
    const password = data.subarray(offset, offset + passwordSize).toString("utf-8");
    offset += passwordSize;
    if (password != this.password) {
      // We received the wrong password, so we gotta bail out
      return;
    }

    const hostPasswordSize = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    const hostPassword =
      hostPasswordSize == 0 ?
      "" :
      data.subarray(offset, offset + hostPasswordSize).toString("utf-8");
    offset += hostPasswordSize;

    const nameSize = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    peer.name =
      nameSize == 0 ?
      "Anonymous" :
      data.subarray(offset, offset + nameSize).toString("utf-8");

    // If we got this far, we have a valid peer and it is time to add it to the list of
    // all peers in the group
    this.peers.push(peer);

    // Iff there is currently no host and the peer that just connected has provided the
    // correct host password, we can promote them directly to hostship
    if (this.currentHostId == null && hostPassword == this.hostPassword) {
      console.log(`Connection ${peer.id} [${peer.name}] directly promoted to host`);
      this.assignHost(peer);
    }
    else {
      console.log(`Connection ${peer.id} [${peer.name}] is client`);
      peer.status = this.currentHostId == null ?
        ConnectionStatus.ClientWithoutHost :
        ConnectionStatus.ClientWithHost;
      this.sendConnectionStatus(peer);
    }

    // Inform everyone that the number Peers in the group has just increased by one
    this.sendNumberConnections();
  }


  /**
   * Handles an incoming data message by the provided @param peer. The only thing this
   * function has to do is verify that this type of message is coming from the host Peer
   * and, if that is the case, forward the message to all peers that are regular clients.
   *
   * @param data The payload of the data message
   * @param peer The peer from which this package is coming
   */
  private handleData(data: Buffer, peer: Peer) {
    if (ChattyDebug) {
      console.log(`Received Data from ${peer.id}: ${peer.name}`);
    }

    // Check if the peer is the current host or not and only send messages if it is so
    if (peer.id == this.currentHostId) {
      console.assert(peer.status == ConnectionStatus.Host);

      this.peers.forEach((peer: Peer) => {
        if (peer.status == ConnectionStatus.ClientWithHost) {
          this.sendMessage(peer, MessageType.Data, data);
        }
      });
    }
  }


  /**
   * Handles an incoming hostship request message. If the message contains the correct
   * hostship password, the @param peer is automatically promoted to host and if there
   * already was a host, that Peer is demoted at the same time.
   *
   * @param data The payload of the hostship request message
   * @param peer The peer from which this message arrived
   */
  private handleHostshipRequest(data: Buffer, peer: Peer) {
    if (Debug) {
      console.log(`Received HostshipRequest from ${peer.id} [${peer.name}]`);
    }

    console.log(`Connection ${peer.id} [${peer.name}] requested hostship`);

    let dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );

    let offset = 0;
    const passwordSize = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    if (passwordSize == 0) {
      // We didn't get any password at all, so we should bail out immediately
      return;
    }

    const password = data.subarray(offset, offset + passwordSize).toString("utf-8");
    if (password != this.hostPassword) {
      console.log(`Connection ${peer.id} [${peer.name}] provided incorrect host password`);
      // We received the wrong password; another good reason to bail out
      return;
    }

    if (this.currentHostId == peer.id) {
      console.log(`Connection ${peer.id} [${peer.name}] is already the host`);
      return;
    }

    this.assignHost(peer);
  }


  /**
   * Handles an incoming hostship resignation method by the @param peer. If the
   * @param peer is the corrent host, that hostship will be removed and all connected
   * Peers will be informed that they have just lost their host.
   *
   * @param data The payload of the hostship resignation method, which is empty for the
   *             current protocol version
   * @param peer The peer from which this message arrived
   */
  private handleHostshipResignation(data: Buffer, peer: Peer) {
    if (Debug) {
      console.log(`Received HostshipResignation from ${peer.id} [${peer.name}]`);
    }

    // Only remove the current host if it was the host that requesting the resignation
    if (peer.status == ConnectionStatus.Host) {
      this.removeHostship();
    }
  }


  /**
   * @return Returns the current host Peer or null if there currently is not a host
   */
  private currentHost(): Peer | null {
    if (this.currentHostId == null) {
      return null;
    }
    else {
      let idx = this.peers.findIndex((p) => { return p.id == this.currentHostId; });
      console.assert(idx != -1, `Could not find host with id ${this.currentHostId}`);
      return this.peers[idx];
    }
  }


  /**
   * Sends a message of the provided @param messageType to the @param peer with the
   * specified @param data.
   *
   * @param peer The Peer that will receive the message generated by this function
   * @param messageType The type of message that will be sent
   * @param data The payload of data that is sent
   */
  private sendMessage(peer: Peer, messageType: MessageType, data: ArrayBuffer) {
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
    dv.setUint8(offset, "OS".charCodeAt(0));
    offset += Uint8Array.BYTES_PER_ELEMENT;
    dv.setUint8(offset, "OS".charCodeAt(1));
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // Protocol version
    dv.setUint8(offset, CurrentProtocolVersion);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // Message type
    dv.setUint8(offset, messageType);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // Message size
    dv.setUint32(offset, data.byteLength, true);
    offset += Uint32Array.BYTES_PER_ELEMENT;

    // Copy the payload into the message
    let bufferView = new Uint8Array(buffer);
    bufferView.set(new Uint8Array(data), offset);

    if (Debug && messageType != MessageType.Data) {
      console.log(`Sending to ${peer.id} [${peer.name}]`, buffer);
    }
    if (ChattyDebug && messageType == MessageType.Data) {
      console.log(`Sending to ${peer.id} [${peer.name}]`, buffer);
    }

    // And then finally send it
    peer.socket.write(bufferView);
  }


  /**
   * Sends a connection status message to the provided @param peer.
   *
   * @param peer The Peer that will receive the connection status message
   */
  private sendConnectionStatus(peer: Peer) {
    let currentHost = this.currentHost();
    const currentHostName = currentHost == null ? "" : currentHost.name;

    let buffer = new ArrayBuffer(
      Uint8Array.BYTES_PER_ELEMENT + // Status
      Uint8Array.BYTES_PER_ELEMENT + // Length of new host
      currentHostName.length         // Host name
    );

    let dv = new DataView(buffer);
    let offset = 0;

    // Attach the connection status of the peer as known by the server
    dv.setUint8(offset, peer.status);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // The length of the current host
    dv.setUint8(offset, currentHostName.length);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // Insert the name of the current host
    let bufferView = new Uint8Array(buffer);
    for (let i = 0; i < currentHostName.length; i += 1) {
      bufferView[offset + i] = currentHostName.charCodeAt(i);
    }

    // Send the actual message to the peer
    this.sendMessage(peer, MessageType.ConnectionStatus, buffer);
  }


  /**
   * Sends the number of connected peers to all connected peers.
   */
  private sendNumberConnections() {
    let buffer = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT);
    let dv = new DataView(buffer);
    dv.setUint32(0, this.peers.length, true);
    this.peers.forEach((peer: Peer) => {
      this.sendMessage(peer, MessageType.NConnections, buffer);
    });
  }


  /**
   * Marks the provided @param newHost Peer as the new host for this server, removes the
   * hostship of the previous host, and informs all connected peers about the change in
   * leadership. This function assumes that it was already checked that @param newHost is
   * actually a valid host.
   *
   * @param newHost The Peer that is going to become the new host
   */
  private assignHost(newHost: Peer) {
    // If we currently have a host, we need to demote that Peer
    if (this.currentHostId != null) {
      let oldHost = this.currentHost();
      oldHost!.status = ConnectionStatus.ClientWithHost;
    }

    // Promote the provided newHost Peer to hostship
    this.currentHostId = newHost.id;
    newHost.status = ConnectionStatus.Host;

    // Update everyone about the new host
    this.peers.forEach((peer: Peer) => {
      // If there was no host before, we need to let people know about the new host
      if (peer.status == ConnectionStatus.ClientWithoutHost) {
        peer.status = ConnectionStatus.ClientWithHost;
      }
      this.sendConnectionStatus(peer);
    });
  }


  /**
   * If the group currently has a host, that host is demoted and all connected peers are
   * informed about the fact that there is no host anymore.
   */
  private removeHostship() {
    // If there is no host right now, there is nothing to be done
    if (this.currentHostId == null) {
      return;
    }

    // If we were the host, we were just demoted, so we should remove information
    // about the current host
    this.currentHostId = null;

    // and then also everyone just lost their host and should know about it, the
    // `peers` list also includes the former host, so need to handle the peer that just
    // lost hostship separately
    this.peers.forEach((peer: Peer) => {
      peer.status = ConnectionStatus.ClientWithoutHost;
      this.sendConnectionStatus(peer);
    });
  }


  /**
   * The port on which this server is listening.
   */
  private port: number;

  /**
   * The clear-text password that peers need to provide to connect. This password has a
   * maximum length of 65535 characters and can consist only of ASCII characters.
   */
  private password: string;

  /**
   * The clear-text password for assuming hostship. The host password can have a maximum
   * length of 65535 characters and can consist only of ASCII characters.
   */
  private hostPassword: string;


  /**
   * The list of all peers that are connected to this server. When new Peers connect, they
   * are added to the end of this list and are moved when they disconnect or provide an
   * error message.
   */
  private peers: Peer[] = [];

  /**
   * The id of the current host. Please note that this is **not** the location of this
   * peer in the `peers` list, but its `id`, which might be different under some
   * circumstances.
   */
  private currentHostId: number | null = null;

  /**
   * The local server that is listening to incoming connections that will result in Peers.
   */
  private server: net.Server;
}
