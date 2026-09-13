# Antigravity Agent Guidelines & Security Protocols

## Mandatory Pre-Commit & Routine Security Audit

Before creating any git commit or whenever touching configuration or build files, the agent MUST perform the following security checks:

### 1. Supply Chain & Backdoor Inspection
Scan modified and staged files—especially configuration files such as `postcss.config.js`, `vite.config.js`, `next.config.js`, `webpack.config.js`, `tailwind.config.js`, and `package.json`—for hidden or obfuscated malicious payloads:
- **Stealth Whitespace**: Check for hundreds of trailing tab (`\t`) or space characters designed to hide code off-screen.
- **Blockchain Dead-Drop Resolvers**: Watch for Ethereum RPC queries (e.g. `eth.blockscout.com`, `1rpc.io`, `eth.drpc.org`, `ethereum-rpc.publicnode.com`, `blastapi.io`) or known malicious sender addresses (e.g. `0xa322E5f3D311D3080e6f0121063e9aDC2490Ef1a`).
- **Anomalous Shims**: Look for injected `createRequire` in ES module configuration files or unexpected `child_process.spawn("node", ["-e", ...])` / `eval()` executions.

### 2. Pre-Commit Verification Workflow
Before executing `git commit`:
1. Run `git status` and `git diff --cached` (or inspect staged changes).
2. Confirm no unintended files or stealth payload modifications exist.
3. If any suspicious changes or unexpected modifications to configuration files are detected, abort the commit immediately, alert the user, and revert the malicious changes.
