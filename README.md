# Hyper SOCKS5 proxy

`hyper-socks5-proxy` is a fairly simple SOCKS5 proxy server that can forward connections to [HyperDHT](https://docs.pears.com/building-blocks/hyperdht) nodes using [bech32 encoded pubkeys](./src/address.ts)

## Running using npx

```bash
npx hyper-socks5-proxy start
```

## Running using docker

```bash
docker run --rm -it -p 1080:1080 docker pull ghcr.io/hzrd149/hyper-socks5-proxy:master
```

## Running from source

```bash
git clone https://github.com/hzrd149/hyper-socks5-proxy
cd hyper-socks5-proxy
yarn install # or npm install
yarn build # npm build
node dist/bin/proxy.js start
```

## Using the proxy in FireFox

To configure FireFox to use the local proxy, follow these steps

- Open [connection settings](https://support.mozilla.org/en-US/kb/connection-settings-firefox) in firefox
- Search for "proxy" or scroll to the bottom and find "Network Settings"
- Select "Manual proxy configuration"
- Select "SOCKS v5"
- Enter `127.0.0.1` in "SOCKS Host" and `1080` in "Port"
- Make sure the "Proxy DNS when using SOCKS v5" option is checked

Once your done it should look like this
![image](https://github.com/user-attachments/assets/3b4d0663-3ed0-448b-a11d-dd284e8f7c7b)
