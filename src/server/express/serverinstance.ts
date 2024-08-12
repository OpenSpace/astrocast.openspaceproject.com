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

import {
  updateActiveSessionStatus,
  updateCurrentActiveUsers,
  updateCurrentHost,
  updateUsage,
} from "./adminApi";
import { CurrentProtocolVersion, MessageType, ConnectionStatus, Peer } from "./server";
import { LDEBUG } from "./utils";

class ServerInstance {
  /**
   * A unique name of the server instance that peers need to provide to connect. This name
   * is used to identify the server instance, the name has a maximum length of 255
   * characters and can consist only of ASCII characters
   */
  private name: string;

  /**
   * The clear-text password that peers need to provide to connect. This password has a
   * maximum length of 65535 characters and can consist only of ASCII characters
   */
  private password: string;

  /**
   * The clear-text password for assuming hostship. The host password can have a maximum
   * length of 65535 characters and can consist only of ASCII characters
   */
  private hostPassword: string;

  /**
   * A unique ID for this server instance. This ID is generated by the authentication provider
   */
  private id: string | null = null;

  /**
   * The list of all peers that are connected to this server. When new Peers connect,
   * they are added to the end of this list and are removed when they disconnect or
   * provide an error message
   */
  private peers: Peer[] = [];

  /**
   * The id of the current host. Note that this is **not** the location of this
   * peer in the `peers` list, but its `id`, which might be different under some
   * circumstances
   */
  private currentHostId: number | null = null;

  /**
   * Constructor for a unique server.
   *
   * @param name The name of the server instance.

   * @param password The password that needs to be provided by Peers to connect to this
   *        server. This password has a maximum length of 65535 characters and can consist
   *        only of ASCII characters
   * @param hostPassword The host password that needs to be provided by Peers to assume
   *        hostship. Either directly when connecting or by assuming hostship during a session.
   *        The host password has a maximum length of 65535 characters and can consist only
   *        of ASCII characters
   * @param id The unique ID of this server instance
   */
  constructor(
    name: string,
    password: string,
    hostPassword: string,
    id: string | null = null
  ) {
    this.name = name;
    this.password = password;
    this.hostPassword = hostPassword;
    if (id) {
      this.id = id;
    }
  }

  /**
   * @return The metadata of the server instance
   */
  public getServerMetadata() {
    return {
      serverName: this.name,
      password: this.password,
      hostPassword: this.hostPassword,
      id: this.id,
    };
  }

  /**
   * Sets the unique server id of this instance.
   *
   *
   * @param id The unique ID of the server instance
   */
  public setServerID(id: string): void {
    this.id = id;
  }

  /**
   * Forcibly closes the server instance, disconnecting all connected peers.
   */
  public stopInstance(): Promise<void> {
    return new Promise((resolve, reject) => {
      let disconnectCount = 0;

      if (this.peers.length === 0) {
        resolve();
      }

      const checkAllDisconnected = () => {
        disconnectCount += 1;
        if (disconnectCount === this.peers.length) {
          resolve();
        }
      };

      for (const peer of this.peers) {
        // Handle if socket does not end properly
        peer.socket.on("error", (err) => {
          checkAllDisconnected();
        });

        peer.socket.end(() => {
          checkAllDisconnected();
        });
      }
    });
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
  public onEnd(peer: Peer): void {
    // Find the index in the peer list of the peer that disconnected
    const idx = this.peers.findIndex((p: Peer) => p.id === peer.id);
    console.assert(
      idx !== -1,
      `Server ${this.name}: Could not find peer with id ${peer.id} trying to ` +
        "disconnect"
    );
    this.peers.splice(idx, 1);

    // Remove hostship if the host disconnected
    if (peer.id === this.currentHostId) {
      this.removeHostship();
    }

    // Update the number of connections
    this.sendNumberOfConnections();

    LDEBUG(`Server ${this.name}: Number of connections remaining: ${this.peers.length}`);
  }

  /**
   * Handles the incoming authentication method by the provided peer. If the
   * authentication is valid and contains the correct password, the peer is added to the
   * list in the group. If the host password is also correct and there is no currently
   * assigned host, the peer is automatically promoted to hostship too.
   *
   * @param data The payload of the authentication message
   * @param peer The Peer from which this message arrived
   * @return True if the authentication was successful, false otherwise
   */
  public handleAuthentication(
    peer: Peer,
    password: string,
    hostPassword: string | null
  ): boolean {
    if (password !== this.password) {
      LDEBUG(`Server ${this.name}: Invalid password`);
      return false;
    }

    // We can add this peer to the list of all peers in the group
    this.peers.push(peer);

    // If there is currently no host and this peer provided the host password
    // we promote them to hostship
    if (this.currentHostId === null && hostPassword === this.hostPassword) {
      LDEBUG(`Server ${this.name}: Connection ${peer.id} ${peer.name} promoted to host`);
      this.assignHost(peer);
    } else {
      LDEBUG(`Server ${this.name}: Connection ${peer.id} ${peer.name} is client`);
      peer.status =
        this.currentHostId === null
          ? ConnectionStatus.ClientWithoutHost
          : ConnectionStatus.ClientWithHost;

      this.sendConnectionStatus(peer);
    }

    this.sendNumberOfConnections();
    updateUsage(this.id!);
    return true;
  }

  /**
   * Handle incoming data from the provided peer, we only forward the data along to
   * other peers if it comes from the host.
   *
   * @param data The payload of the data message
   * @param peer The Peer from which this message is coming
   */
  public handleData(data: Buffer, peer: Peer): void {
    // Check if this peer is the current host
    if (peer.id === this.currentHostId) {
      console.assert(
        peer.status === ConnectionStatus.Host,
        `Server ${this.name}: Peer ${peer.id} is host but status is not set to host`
      );

      this.peers.forEach((peer: Peer) => {
        if (peer.status === ConnectionStatus.ClientWithHost) {
          this.sendMessage(peer, MessageType.Data, data);
        }
      });
    }
  }

  /**
   * Handles an incoming hostship request message by the peer. If the message contains
   * the correct host password, the peer is promoted to hostship and the previous host
   * is demoted (if there was one).
   *
   * @param data The payload of the hostship request message
   * @param peer The Peer from which this message arrived
   */
  public handleHostshipRequest(data: Buffer, peer: Peer): void {
    LDEBUG(`Server ${this.name}: Peer ${peer.id} ${peer.name} requested hostship`);

    const dv = new DataView(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
    );
    let offset = 0;

    const passwordLength = dv.getUint16(offset, true);
    offset += Uint16Array.BYTES_PER_ELEMENT;
    if (passwordLength === 0) {
      // No password was given so we don't do anything
      LDEBUG(`Server ${this.name}: Invalid password length`);
      return;
    }

    const password = data.subarray(offset, offset + passwordLength).toString("utf-8");
    if (password !== this.hostPassword) {
      // Wrong password so we don't do anything
      LDEBUG(
        `Server ${this.name}: Peer ${peer.id} ${peer.name} provided incorrect host password`
      );
      return;
    }

    if (peer.id === this.currentHostId) {
      LDEBUG(`Server ${this.name}: Peer ${peer.id} ${peer.name} is already host`);
      return;
    }

    this.assignHost(peer);
  }

  /**
   * Handles an incoming hostship resignation by the peer. If the peer is the current
   * host, we remove the hostship and inform all connected peers that they lost their
   * host.
   *
   * @param peer The Peer from which this message arrived
   */
  public handleHostshipResignation(peer: Peer): void {
    LDEBUG(`Server ${this.name}: Peer ${peer.id} ${peer.name} resigned hostship`);

    // Only remove the host if it was the host peer that requested the resignation
    if (peer.status === ConnectionStatus.Host) {
      this.removeHostship();
    }
  }

  /**
   * Send a message to the provided peer of the provided messageType with the specified
   * payload data.
   *
   * @param peer The Peer that will recieve the message
   * @param messageType The type of message that will be sent
   * @param payload The payload of the data that is sent
   */
  private sendMessage(peer: Peer, messageType: MessageType, payload: ArrayBuffer): void {
    const buffer = new ArrayBuffer(
      "OS".length + // OS prefix
        Uint8Array.BYTES_PER_ELEMENT + // protocol version number
        Uint8Array.BYTES_PER_ELEMENT + // message type identifier
        Uint32Array.BYTES_PER_ELEMENT + // payload size in bytes
        payload.byteLength // payload
    );

    const dv = new DataView(buffer);
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
    dv.setUint32(offset, payload.byteLength, true);
    offset += Uint32Array.BYTES_PER_ELEMENT;

    // Copy the payload into the message
    const bufferView = new Uint8Array(buffer);
    bufferView.set(new Uint8Array(payload), offset);

    LDEBUG(`Server ${this.name}: Sending to peer ${peer.id} ${peer.name}`, buffer);
    peer.socket.write(bufferView);
  }

  /**
   * Send a connection status message to the provided peer.
   *
   * @param peer The Peer that will recieve the connection status message
   */
  private sendConnectionStatus(peer: Peer): void {
    LDEBUG(
      `Server ${this.name}: ending connection status to peer ${peer.id} ${peer.name}`
    );

    const host = this.currentHost();
    const currentHostName = host === null ? "" : host.name;

    const buffer = new ArrayBuffer(
      Uint8Array.BYTES_PER_ELEMENT + // Status
        Uint8Array.BYTES_PER_ELEMENT + // Length of host
        currentHostName.length // Host name
    );

    const dv = new DataView(buffer);
    let offset = 0;

    // Set the connection status of the peer as known by the server
    dv.setUint8(offset, peer.status);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // The length of the host name
    dv.setUint8(offset, currentHostName.length);
    offset += Uint8Array.BYTES_PER_ELEMENT;

    // Insert the name of the current host
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < currentHostName.length; i += 1) {
      bufferView[offset + i] = currentHostName.charCodeAt(i);
    }

    this.sendMessage(peer, MessageType.ConnectionStatus, buffer);
  }

  /**
   * Send the number of connections to all connected peers.
   */
  private sendNumberOfConnections(): void {
    LDEBUG(`Server ${this.name}: Sending number of connections to all peers`);

    const buffer = new ArrayBuffer(Uint32Array.BYTES_PER_ELEMENT); // Number of connections
    const dv = new DataView(buffer);
    dv.setUint32(0, this.peers.length, true);
    this.peers.forEach((peer: Peer) => {
      this.sendMessage(peer, MessageType.NConnections, buffer);
    });
    // Update the server status depending on if there still are any users connected
    const isServerActive = this.peers.length > 0;
    updateActiveSessionStatus(this.id!, isServerActive);
    updateCurrentActiveUsers(this.id!, this.peers.length);
  }

  /**
   * @return The current host of the group or null if there is no host assigned
   */
  private currentHost(): Peer | null {
    if (this.currentHostId === null) {
      return null;
    }

    const idx = this.peers.findIndex((peer: Peer) => peer.id === this.currentHostId);
    if (idx === -1) {
      LDEBUG(`Could not find host with id ${this.currentHostId}`);
      return null;
    }

    return this.peers[idx];
  }

  /**
   * Mark the provided newHost Peer as the new host of the group and remove the hostship
   * of the previous host. Inform all connected peers about the change in hostship.
   *
   * @param newHost The Peer to be promoted to the new host
   */
  private assignHost(newHost: Peer): void {
    // If we currently have a host, we need to demote them
    if (this.currentHostId !== null) {
      let oldHost = this.currentHost()!; // Host id cannot be null here
      oldHost.status = ConnectionStatus.ClientWithHost;
    }

    // Promote the provided peer to host
    this.currentHostId = newHost.id;
    newHost.status = ConnectionStatus.Host;

    // Update others about the new host
    this.peers.forEach((peer: Peer) => {
      // If there was no host before, let them know about the new host
      if (peer.status === ConnectionStatus.ClientWithoutHost) {
        peer.status = ConnectionStatus.ClientWithHost;
      }
      this.sendConnectionStatus(peer);
    });

    updateCurrentHost(this.id!, newHost.name);
  }

  /**
   * If the group has a host, we remove the hostship and inform all connected peers that
   * there is no host anymore.
   */
  private removeHostship(): void {
    // If we don't have a host, we don't need to do anything
    if (this.currentHostId === null) {
      return;
    }

    // Remove host information on server side
    this.currentHostId = null;

    // Inform all peers that we no longer have a host, this includes the recently
    // removed host aswell
    this.peers.forEach((p: Peer) => {
      p.status = ConnectionStatus.ClientWithoutHost;
      this.sendConnectionStatus(p);
    });

    updateCurrentHost(this.id!, "null");
  }
}

export { ServerInstance };
