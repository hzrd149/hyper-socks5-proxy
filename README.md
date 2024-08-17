# Hyper SOCKS5 proxy

`hyper-socks5-proxy` is a fairly simple SOCKS5 proxy server that can forward connections to [HyperDHT](https://docs.pears.com/building-blocks/hyperdht) nodes using [bech32 encoded pubkeys](./src/address.ts)

## Running using npx

```bash
npx hyper-socks5-proxy start
```

## Running from source

```bash
git clone https://github.com/hzrd149/hyper-socks5-proxy
cd hyper-socks5-proxy
yarn install # or npm install
yarn build # npm build
node dist/bin/proxy.js start
```
