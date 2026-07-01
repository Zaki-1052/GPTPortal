# GPTPortal

The full documentation lives in the project root: **[../README.md](../README.md)**.

That README covers installation, configuration, every supported provider and model,
the architecture, the HTTP API, deployment, security, cost management, and a
troubleshooting/FAQ section. This file is only a pointer so the docs don't drift.

## 30-second start

```bash
git clone https://github.com/Zaki-1052/GPTPortal.git
cd GPTPortal
npm install
cp .env.example .env      # set USER_USERNAME, USER_PASSWORD, and at least one API key
node server.js
```

Then open `http://localhost:3000/portal` and sign in with the username and
password you set. Prefer a browser form for your keys? Start the server and visit
`http://localhost:3000/setup` instead of editing `.env` by hand.

See the [root README](../README.md) for everything else.
