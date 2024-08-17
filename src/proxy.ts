import { createServer } from "@pondwader/socks5-server";
import HyperDHT from "hyperdht";
import net from "net";
import createDebug from "debug";
import { decodeAddress, isAddress } from "hyper-address";

export type ProxyOptions = { node?: HyperDHT };
export type HyperSocks5Proxy = ReturnType<typeof createServer> & {
  node: HyperDHT;
};

const debug = createDebug("hyper-socks5-proxy");

export function createProxy(options?: ProxyOptions): HyperSocks5Proxy {
  const proxy = createServer() as HyperSocks5Proxy;

  proxy.node = options?.node || new HyperDHT();

  proxy.connectionHandler = (connection, sendStatus) => {
    if (connection.command !== "connect")
      return sendStatus("COMMAND_NOT_SUPPORTED");

    connection.socket.on("error", () => {}); // Ignore errors

    // hyper addresses
    if (isAddress(connection.destAddress)) {
      const pubkey = Buffer.from(decodeAddress(connection.destAddress));
      debug("Connecting to", pubkey.toString("hex"));
      const stream = proxy.node.connect(pubkey);

      let streamOpened = false;
      stream.on("error", (err: Error & { code: string }) => {
        if (!streamOpened) {
          switch (err.code) {
            case "EINVAL":
            case "ENOENT":
            case "ENOTFOUND":
            case "ETIMEDOUT":
            case "EADDRNOTAVAIL":
            case "EHOSTUNREACH":
              sendStatus("HOST_UNREACHABLE");
              break;
            case "ENETUNREACH":
              sendStatus("NETWORK_UNREACHABLE");
              break;
            case "ECONNREFUSED":
              sendStatus("CONNECTION_REFUSED");
              break;
            default:
              sendStatus("GENERAL_FAILURE");
          }
        }
      });

      stream.once("open", () => {
        streamOpened = true;
        sendStatus("REQUEST_GRANTED");
      });

      stream.on("data", (chunk) => connection.socket.write(chunk));
      connection.socket.on("data", (chunk) => stream.write(chunk));

      connection.socket.on("close", () => stream.destroy());

      return stream;
    }
    // everything else
    else {
      const stream = net.createConnection({
        host: connection.destAddress,
        port: connection.destPort,
      });
      stream.setNoDelay();

      let streamOpened = false;
      stream.on("error", (err: Error & { code: string }) => {
        if (!streamOpened) {
          switch (err.code) {
            case "EINVAL":
            case "ENOENT":
            case "ENOTFOUND":
            case "ETIMEDOUT":
            case "EADDRNOTAVAIL":
            case "EHOSTUNREACH":
              sendStatus("HOST_UNREACHABLE");
              break;
            case "ENETUNREACH":
              sendStatus("NETWORK_UNREACHABLE");
              break;
            case "ECONNREFUSED":
              sendStatus("CONNECTION_REFUSED");
              break;
            default:
              sendStatus("GENERAL_FAILURE");
          }
        }
      });

      stream.on("ready", () => {
        streamOpened = true;
        sendStatus("REQUEST_GRANTED");
        connection.socket.pipe(stream).pipe(connection.socket);
      });

      connection.socket.on("close", () => stream.destroy());

      return stream;
    }
  };

  // intercept the close call and close the hyperdht node
  const parentClose = proxy.close;
  proxy.close = (cb) => {
    return parentClose(() => {
      proxy.node
        .destroy({ force: true })
        .then(() => {
          if (cb) cb();
        })
        .catch((err) => {
          if (cb) cb(err);
        });
    });
  };

  return proxy;
}
