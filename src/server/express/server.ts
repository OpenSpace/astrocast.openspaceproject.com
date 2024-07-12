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

import { ServerInstance } from "./serverinstance";
import { LDEBUG, LERROR, LINFO } from "./utils";
import * as net from "net";

export const CurrentProtocolVersion = 7;

export enum MessageType {
  Authentication = 0,
  Data,
  ConnectionStatus,
  HostshipRequest,
  HostshipResignation,
  NConnections,
}

export enum ConnectionStatus {
  Disconnected = 0,
  Connecting,
  ClientWithoutHost,
  ClientWithHost,
  Host,
}

export type Peer = {
  /**
   * A unique ID for this peer
   */
  id: number;

  /**
   * The user-provided name for this peer, or "Anonymous" if no name was specified. The
   * name can have a maximum length of 255 characters and can only consist of ASCII
   * characters
   */
  name: string;

  /**
   * The socket on which to contact the Peer and send messages to
   */
  socket: net.Socket;

  /**
   * The connection status of this peer
   */
  status: ConnectionStatus;

  /**
   * The server that this peer is connected to
   */
  serverName: string;
};

/**
 * An instance of a server that is listening on a specific port and equipped with a
 * password and host password. Each server is handling a unique group of peers, one of
 * which might be the *host* of the session that is controlling what everyone in the group
 * can see, which simulation time is used, and also who can execute Lua scripts on all
 * connected instances.
 */
class WormholeServer {
  /**
   * The port on which this TCP server is listening
   */
  private port: number;

  private peerIdCounter: number;

  /**
   * The list of all instances that are currently running on this server. Each instance
   * keeps track of its "own" connected peers.
   */
  private instances: { [name: string]: ServerInstance } = {};

  /**
   * The local server that is listening to incoming connections that will result in Peers
   */
  private server: net.Server;

  /**
   * Constructor for a unique server.
   *
   * @param port The port on which this TCP server should listen to new connections.
   * This port must not already be in use on this computer
   * @param password  The password that needs to be provided by Peers to connect to this
   * server. This password has a maximum length of 65535 characters and can consist only
   * of ASCII characters
   * @param hostPassword The host password that needs to be provided by Peers to assume
   * hostship. Either directly when connecting or by assuming hostship during a session.
   * The host password has a maximum length of 65535 characters and can consist only of
   * ASCII characters
   */
  constructor(port: number) {
    this.port = port;
    this.peerIdCounter = 0;
    // Setup the TCP server for handling incoming OpenSpace connections
    this.server = net.createServer();

    this.server.on("connection", (socket: net.Socket) => {
      LDEBUG("New connection", socket.remoteAddress);

      // The Peer is only added to the list if the authentication is succesful.
      // eslint-disable-next-line prefer-const
      let peer: Peer = {
        id: this.peerIdCounter, // TODO: assign a unique ID, see comment in ´onEnd´
        name: "",
        socket: socket,
        status: ConnectionStatus.Connecting,
        serverName: "",
      };

      socket.on("data", (data: Buffer) => {
        this.onData(data, peer);
      });
      socket.on("end", () => {
        this.onEnd(peer);
      });
      socket.on("error", (error) => {
        LERROR(`Error: ${error} from peer ${peer.id}`);
        this.onEnd(peer);
      });
    });
  }

  /**
   * Attempts to start the server on the provided port.
   * @return A promise that resolves to true if the server was successfully started,
   * otherwise it is rejected with an error message
   */
  public startWormholeServer(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.server.on("listening", () => {
        LINFO(`Instance server listening on port ${this.port}`);
        resolve(true);
      });

      this.server.on("error", (error: Error) => {
        this.server.close();
        LERROR(`Error starting server: ${error.message}`);
        reject(error);
      });

      this.server.listen(this.port);
    });
  }

  /**
   * Create and add a new instance to the wormhole server. If an instance with the same
   * name exists it will be removed first and the new one added.
   * @return The newly created server instance
   */
  public async addServerInstance(
    name: string,
    password: string,
    hostPassword: string,
    id: string | null = null
  ): Promise<ServerInstance> {
    // If the instance already exists, remove it (this *should* not happen)
    if (name in this.instances) {
      const oldInstance = this.instances[name];
      await this.removeServerInstance(oldInstance.getServerMetadata().id!);
    }

    const instance = new ServerInstance(name, password, hostPassword, id);
    this.instances[name] = instance;
    return instance;
  }

  /**
   * @return The number of active servers that are currently running
   */
  public activeServers(): number {
    return Object.keys(this.instances).length;
  }

  /**
   * Removes the instance from the wormhole server, resolves the promise once the
   * instance is fully closed. TODO: check when this happens
   * This happens when all connections have disconnected or are
   * closed.
   * @return A promise that resolves to a string message if the server was successfully
   * stopped, otherwise it is rejected with an error message
   */
  public async removeServerInstance(instanceID: string): Promise<string> {
    const instance = Object.values<ServerInstance>(this.instances).find(
      (instance: ServerInstance) => {
        return instance.getServerMetadata().id === instanceID;
      }
    );

    if (!instance) {
      const errorMsg = `Server "${instanceID}" not found`;
      LDEBUG(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      // Notify all peers that the instance is closing
      await instance.stopInstance();

      // Remmove instance from internal array
      delete this.instances[instance.getServerMetadata().serverName];

      const successMsg = `Instance "${instanceID}" successfully removed`;
      LDEBUG(successMsg);
      return successMsg;
    } catch (error) {
      const errorMsg = `Error stopping server "${instanceID}": ${(error as Error).message}`;
      LERROR(errorMsg);
      throw error;
    }
  }

  /**
   * Handles incomming data packages on the socket. We unpack the message and bail early
   * if there are any errors in the provided message. A valid message is then forwarded
   * to the appropriate handlers.
   *
   * @param data The data package that was received on the socket
   * @param peer The Peer from which this message arrived
   */
  private onData(data: Buffer, peer: Peer): void {
    const HeaderSize =
      "OS".length + // OS prefix
      Uint8Array.BYTES_PER_ELEMENT + // protocol version number
      Uint8Array.BYTES_PER_ELEMENT + // message type identifier
      Uint32Array.BYTES_PER_ELEMENT; // payload size in bytes

    // Exit early if we don't have a valid header information
    if (data.length < HeaderSize) {
      LDEBUG("Invalid header information");
      return;
    }

    const prefix = data.subarray(0, 2).toString("utf-8");
    if (prefix !== "OS") {
      LDEBUG("The message did not start with OS prefix");
      return;
    }

    const dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );

    let offset = "OS".length;
    const protocolVersion = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    if (protocolVersion !== CurrentProtocolVersion) {
      LDEBUG("Invalid protocol version", protocolVersion);
      return;
    }

    const messageType = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    if (!(messageType in MessageType)) {
      LDEBUG("Invalid message type: ", messageType);
      return;
    }

    const messageSize = dv.getUint32(offset, true);
    offset += Uint32Array.BYTES_PER_ELEMENT;
    if (data.byteLength !== offset + messageSize) {
      LDEBUG("The provided message size was not the same as the actual message length");
      LDEBUG(`Received message type: ${messageType}`);
      LDEBUG(`Header size: ${HeaderSize}`);
      LDEBUG(`Data size: ${data.byteLength}`);
      LDEBUG(`Data byteoffset: ${data.byteOffset}`);
      LDEBUG(`Message size: ${messageSize}`);
      LDEBUG(`Offset: ${offset}`);
      return;
    }

    // Slice the header data from the message
    const messagePayload = data.subarray(offset);

    switch (messageType) {
      case MessageType.Authentication:
        this.handleAuthentication(messagePayload, peer);
        break;
      case MessageType.Data:
        this.handleData(messagePayload, peer);
        break;
      case MessageType.HostshipRequest:
        this.handleHostshipRequest(messagePayload, peer);
        break;
      case MessageType.HostshipResignation:
        this.handleHostshipResignation(messagePayload, peer);
        break;
    }
  }

  /**
   * Handles the disconnection of a peer. We remove the Peer from the list of connected
   * peers and free up the ID slot. If the Peer that disconnected was the host, we
   * inform all connected peers that they no longer have a host.
   *
   * TODO: Currently we assign the ID of a connected peer by the length of the array of
   * connected peers. If there are 2 peers connected and the first one disconnects and
   * then reconnects, both peers will end up with ID = 1.
   *
   * @param peer The Peer that just disconnected
   */
  private onEnd(peer: Peer): void {
    LDEBUG(`Peer ${peer.id} disconnected, closing connection`);
    // Get the instance that the peer is connected to
    const instance = this.instances[peer.serverName];

    if (!instance) {
      LDEBUG(`Peer instance "${peer.serverName}" not found`);
      return;
    }

    instance.onEnd(peer);
  }

  /**
   * Handles the incomming authentication method by the provided peer. If the
   * authentication is valid and contains the correct password, the peer is added to the
   * list in the group. If the host password is also correct and there is no currently
   * assigned host, the peer is automatically promoted to hostship too.
   *
   * @param data The payload of the authentication message
   * @param peer The Peer from which this message arrived
   */
  private handleAuthentication(data: Buffer, peer: Peer): void {
    LDEBUG(`Handling authentication for peer ${peer.id}`);

    const dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );

    let offset = 0;
    const passwordLength = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    if (passwordLength === 0) {
      // The password length cannot be zero
      LDEBUG("Invalid password length");
      return;
    }
    const password = data.subarray(offset, offset + passwordLength).toString("utf-8");
    offset += passwordLength;

    const hostPasswordLength = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    const hostPassword =
      hostPasswordLength === 0
        ? ""
        : data.subarray(offset, offset + hostPasswordLength).toString("utf-8");
    offset += hostPasswordLength;

    const serverNameLength = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    const serverName = data.subarray(offset, offset + serverNameLength).toString("utf-8");
    offset += serverNameLength;
    peer.serverName = serverName;

    const nameLength = dv.getUint8(offset);
    offset += Uint8Array.BYTES_PER_ELEMENT;
    peer.name =
      nameLength === 0
        ? "Anonymous"
        : data.subarray(offset, offset + nameLength).toString("utf-8");

    // Get the instance that this peer is trying to connect to
    const instance = this.instances[serverName];
    if (!instance) {
      LDEBUG(`No instance with name ${serverName} found`);
      return;
    }

    const authenticated = instance.handleAuthentication(peer, password, hostPassword);
    if (authenticated) {
      this.peerIdCounter++;
    }
  }

  /**
   * Handle incomming data from the provided peer, we only forward the data along to
   * other peers if it comes from the host.
   *
   * @param data The payload of the data message
   * @param peer The Peer from which this message is coming
   */
  private handleData(data: Buffer, peer: Peer): void {
    const instance = this.instances[peer.serverName];
    if (!instance) {
      LDEBUG(`No instance with name ${peer.serverName} found`);
      return;
    }
    instance.handleData(data, peer);
  }

  /**
   * Handles an incoming hostship request message by the peer. If the message contains
   * the correct host password, the peer is promoted to hostship and the previous host
   * is demoted (if there was one).
   *
   * @param data The payload of the hostship request message
   * @param peer The Peer from which this message arrived
   */
  private handleHostshipRequest(data: Buffer, peer: Peer): void {
    const instance = this.instances[peer.serverName];
    if (!instance) {
      LDEBUG(`No instance with name ${peer.serverName} found`);
      return;
    }

    instance.handleHostshipRequest(data, peer);
  }

  /**
   * Handles an incoming hostship resignation by the peer. If the peer is the current
   * host, we remove the hostship and inform all connected peers that they lost their
   * host.
   *
   * @param data
   * @param peer The Peer from which this message arrived
   */
  private handleHostshipResignation(_: Buffer, peer: Peer): void {
    const instance = this.instances[peer.serverName];
    if (!instance) {
      LDEBUG(`No instance with name ${peer.serverName} found`);
      return;
    }
    instance.handleHostshipResignation(peer);
  }
}

export { WormholeServer as Server };
