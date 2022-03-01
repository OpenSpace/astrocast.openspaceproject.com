import { Server } from "./server.js";


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

let server = new Server(settings.port, settings.password, settings.hostPassword);

