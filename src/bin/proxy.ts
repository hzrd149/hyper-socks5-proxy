#!/usr/bin/env node
import { Command } from "commander";

import { createProxy } from "../proxy";
import { decodeAddress, encodeAddress } from "../address";

process.title = "proxy";

const program = new Command();

program
  .command("decode")
  .description("decode a bech32 hyper address to hex")
  .argument("<address>", "The hypr1 bech32 encoded address")
  .action((address: string) => {
    process.stdout.write(decodeAddress(address) + "\n");
  });
program
  .command("encode")
  .description("encode a hex hyperdht key to a bech32 address")
  .argument("<key>", "A hex string")
  .action((key: string) => {
    process.stdout.write(encodeAddress(Buffer.from(key, "hex")) + "\n");
  });

program
  .command("start")
  .description("Starts the HTTP proxy")
  .option(
    "-p, --port <port>",
    "Port number to the proxy server should bind to",
    (v) => parseInt(v),
    1080,
  )
  .action((options) => {
    const proxy = createProxy();

    proxy.listen(options.port, () => {
      console.log("SOCKS5 proxy server listening on port %d", options.port);
    });

    async function shutdown() {
      await proxy.node.destroy({ force: true });
      process.exit(0);
    }

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  });

program.parse();
