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

declare module "openspace-api-js" {
  export class OpenSpaceApi {
    constructor(socket: Socket);
    onConnect(callback: () => void): void;
    onDisconnect(callback: () => void): void;
    connect(): void;
    disconnect(): void;

    startTopic(type: string, payload: any): Topic;
    authenticate(secret: string): Promise<any>;
    setProperty(property: string, value: any): void;
    getProperty(property: string): Promise<any>;
    getDocumentation(type: string): Promise<any>;
    subscribeToProperty(property: string): Topic;
    executeLuaScript(
      script: string,
      getReturnValue: Bolean = true,
      shouldBeSynchronized: Boolean = true
    ): Promise<any>;
    executeLuaFunction(fun: string, getReturnValue: Boolean = true): Promise<any>;
    library(multireturn?: boolean | undefined): Promise<any>;

    singleReturnLibrary(): Promise<any>;
    multiReturnLibrary(): Promise<any>;
  }
  export class Socket {
    /** Internal usage only */
    constructor(host: string, port: number);
  }

  export class Topic {
    /** Internal usage only */
    constructor(
      iterator: AsyncGenerator<any, void, unknown>,
      talk: (payload: any) => void,
      cancel: () => void
    );
  }

  export default function (host: string, port: number): OpenSpaceApi;
}
