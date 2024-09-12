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
  authorizeUser,
  getServerInstancesFromDB,
  getUserByID,
  postServerInstance,
  removeServerInstanceFromDb,
  setAdminRights,
  subscribeToDatabase
} from './adminApi';
import { Server } from './server';
import { LERROR, LINFO } from './utils';
import cors from 'cors';
import 'dotenv/config';
import express, { Response, Request } from 'express';
import { DataSnapshot } from 'firebase-admin/database';

class ServerManager {
  /**
   * The port on which the HTTP server is listening
   */
  private httpPort: number;

  /**
   * Reference to the wormhole handling all server instances that are currently running
   */
  private wormhole: Server;

  /**
   * The path to the API endpoint for the server
   */
  private API_PATH = process.env.VITE_SERVER_API_PATH;

  /**
   * The express server that is listening to incoming HTTP requests
   */
  private app;

  constructor(httpPort: number, wormholePort: number) {
    this.httpPort = httpPort;
    this.wormhole = new Server(wormholePort);

    // Setup express server for handling HTTP requests
    this.app = express();
    this.app.use(cors());
    this.app.use(express.json());

    this.app.post(
      `${this.API_PATH}/request-server-instance`,
      this.handleRequestServerInstance.bind(this)
    );
    this.app.post(
      `${this.API_PATH}/request-admin-rights`,
      this.handleRequestSetAdminRights.bind(this)
    );
    this.app.get(
      `${this.API_PATH}/remove-server-instance/:id`,
      this.handleRemoveServerInstance.bind(this)
    );
    this.app.get(
      `${this.API_PATH}/fetch-user-name/:token`,
      this.handleRequestgetUserNameByID.bind(this)
    );
    this.app.listen(this.httpPort, () => {
      LINFO(`Server listening on port ${this.httpPort}`);
    });
  }

  /**
   * Start the wormhole server that will handle all the server instances.
   */
  public startWormhole(): void {
    this.wormhole.startWormholeServer();
  }

  /**
   * Fetch the display name of a user given their uid.
   *
   * @param req Request object containing the user token
   * @param res Response object containing user name
   */
  private async handleRequestgetUserNameByID(req: Request, res: Response): Promise<void> {
    const token = req.params.token;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Invalid token' });
      return;
    }

    try {
      const user = await getUserByID(token);
      res.json({ name: user.displayName });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * Load existing server instances from the database and start them again.
   */
  public async loadServerInstancesFromDB(): Promise<void> {
    const instances = await getServerInstancesFromDB();

    if (!instances || !instances.length) {
      LINFO('No existing instances found in database');
      return;
    }
    // Add instances to internal array for bookkeeping
    for (const instance of instances) {
      await this.wormhole.addServerInstance(
        instance.roomName,
        instance.password,
        instance.hostPassword,
        instance.id
      );
    }

    LINFO(`Loaded ${this.wormhole.activeServers()} existing instances from database`);
  }

  /**
   * Handle the request to set admin rights for a user.
   *
   * @param req Request object must contain the user id token and secret in the body
   */
  private async handleRequestSetAdminRights(req: Request, res: Response): Promise<void> {
    const uid = req.body.uid;
    const secret = req.body.secret;

    if (!uid || !secret || typeof uid !== 'string' || typeof secret !== 'string') {
      res.status(400).json({ error: 'Missing uid or secret' });
      return;
    }

    try {
      await setAdminRights(uid, secret);
      res.status(200).json({ message: `Successfully set admin rights for user: ${uid}` });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * Handle the request to remove a server instance from the database.
   *
   * @param req Request object must contain the instance id as a params `/:id`
   */
  private async handleRemoveServerInstance(req: Request, res: Response): Promise<void> {
    const instanceID = req.params.id;

    if (!instanceID || typeof instanceID !== 'string') {
      res.status(400).json({ error: 'Instance ID is required' });
      return;
    }

    try {
      const msg = await this.removeServerInstance(instanceID);
      res.status(200).json({ message: msg });
    } catch (e) {
      res.status(500).json({ error: (e as Error).message });
    }
  }

  /**
   * Shut down and remove a server instance from the internal list and the database. This
   * will first try to remove the server form the database and if successful it will also
   * stop the server locally.
   *
   *
   * @param instanceID The id of the server instance to shut down
   * @return A promise that resolves with a successful message or rejects with
   *         an error message
   */
  private async removeServerInstance(instanceID: string): Promise<string> {
    try {
      const msg = await this.wormhole.removeServerInstance(instanceID);
      await removeServerInstanceFromDb(instanceID);
      return msg;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle the request to create a new server instance.
   *
   * @param req Request object must contain the password and hostpassword in the body
   * @return A promise that resolves with the server metadata or rejects with an
   *         error
   */
  private async handleRequestServerInstance(req: Request, res: Response): Promise<void> {
    const password = req.body.password;
    const hostPassword = req.body.hostpassword;
    const roomName = req.body.roomname;
    const profile = req.body.profile;
    const isPrivateRoom = req.body.roomaccess ? true : false;
    const tokenID: string | null = req.body.token ?? null;

    if (!tokenID) {
      res.status(401).json({ error: 'Unauthorized: Could not verify user' });
      return;
    }
    // A server without passwords are not allowed
    if (
      !password ||
      !hostPassword ||
      typeof password !== 'string' ||
      typeof hostPassword !== 'string'
    ) {
      res.status(400).json({ error: 'Missing password or host password' });
      return;
    }
    if (!roomName || typeof roomName !== 'string') {
      res.status(400).json({ error: 'Missing room name' });
      return;
    }
    if (!profile || typeof profile !== 'string') {
      res.status(400).json({ error: 'Missing room name' });
      return;
    }

    // Check if the provided room name is unique
    const instances = await getServerInstancesFromDB();
    const isRoomNameUnique = instances.every((instance: ServerInstanceData) => {
      return instance.roomName !== roomName;
    });

    if (!isRoomNameUnique) {
      res
        .status(400)
        .json({ error: 'A room with that name already exists, must be unique' });
      return;
    }

    // Attempt to create a new server instance
    try {
      // Authorize potential user
      const uid = await authorizeUser(tokenID);

      const instance = await this.wormhole.addServerInstance(
        roomName,
        password,
        hostPassword
      );

      // TODO: handle error messages if we fail to push the server info to database
      const serverInstance = await postServerInstance(
        instance,
        profile,
        isPrivateRoom,
        uid
      );

      instance.setServerID(serverInstance.id);
      // Server was successfully created, send back information to the client so they
      // can connect to it through OpenSpace
      res.json(serverInstance);
    } catch (e) {
      LERROR('Error creating server instance:', e);
      // Report an internal server error to the client
      res.status(500).json({ error: e });
      return;
    }
  }

  /**
   * Automatically kill inactive servers that have been running for too long.
   */
  public autoKillInactiveServers(): void {
    let instances: ServerInstanceData[] = [];

    function handleData(snapshot: DataSnapshot, b?: string | null | undefined): any {
      if (snapshot.exists()) {
        const data = snapshot.val();
        instances = Object.values<ServerInstanceData>(data);
      } else {
        instances = [];
      }
    }

    function handleError(error: Error) {
      LERROR('Error fetching instance data: ', error);
    }

    subscribeToDatabase('InstanceData', 'value', handleData, handleError);

    setInterval(
      async () => {
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        // We use an extra array to store the instance we want to remove.
        // Because the removeServerInstanceFromDb will alter the firebase and we are
        // subscribed to the database, as such the `instances` array will update while
        // we would be looping over it, unsure of the behaviour of that.
        const instancesToRemove: ServerInstanceData[] = [];
        for (const instance of instances) {
          // If the server has been running for more than 30 inactive minutes we kill it
          const inactiveUptime = now - instance.inactiveTimeStamp;
          if (!instance.active && inactiveUptime > thirtyMinutes) {
            instancesToRemove.push(instance);
          }
        }

        // Remove the instances that have been inactive for too long
        for (const instance of instancesToRemove) {
          try {
            await this.wormhole.removeServerInstance(instance.id);
            await removeServerInstanceFromDb(instance.id);
          } catch (error) {
            LERROR('Error removing inactive server:', error);
          }
        }
      },
      5 * 60 * 1000 // Run every 5 minutes
    );
  }
}

async function main() {
  const HTTP_PORT = parseInt(<string>process.env.HTTP_PORT) || 25000;
  const WORMHOLE_PORT = parseInt(<string>process.env.VITE_WORMHOLE_PORT) || 25001;
  const serverManager = new ServerManager(HTTP_PORT, WORMHOLE_PORT);
  await serverManager.loadServerInstancesFromDB();
  serverManager.autoKillInactiveServers();
  serverManager.startWormhole();
}

main();
