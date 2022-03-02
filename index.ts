/*****************************************************************************************
 *                                                                                       *
 * Wormhole                                                                              *
 *                                                                                       *
 * Copyright (c) 2022                                                                    *
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

import { Server } from "./server.js";

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

let server = new Server(settings.port, settings.password, settings.hostPassword);

