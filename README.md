# proc-tool

A small CLI utility for learning the Node.js `child_process` module. It demonstrates the three main ways to run tasks outside the main Node.js process:

- **`spawn`** – streaming external commands
- **`exec`** – running a command through the shell and buffering its output
- **`execFile`** – running an executable directly (no shell) and buffering its output
- **`fork`** – running another JS module in a separate process with IPC messaging

## Setup

```bash
npm install   # only needed if you plan to use nodemon
node main.js --help
```

## Usage

```bash
node main.js processes              # list running processes (spawns `ps aux`)
node main.js info                   # system info (execs `uname -a`)
node main.js node-info              # node version (execFiles `node --version`)
node main.js ping [host]            # ping a host, default google.com (spawn)
node main.js worker [limit]         # sum 1..N in a forked child process
node main.js git-status             # run `git status` (exec)
```

## How it works

### `spawn` / `exec` / `execFile` (`main.js`)

- `processes` and `ping` use `spawn`, which streams `stdout`/`stderr` events as they arrive — good for long-running or chatty commands.
- `info` and `git-status` use `exec`, which runs the command through a shell, buffers the whole output, and delivers it via a callback.
- `node-info` uses `execFile`, which runs an executable **without a shell** — safer (no shell injection, no shell-specific syntax) and slightly faster. It also buffers the output into a callback, so use it when you know the exact executable and args up front.

### `fork` example (`main.js` + `worker.js`)

`worker [limit]` forks `worker.js` as a real separate Node.js process. Parent and worker talk over IPC via `child.send()` and `process.send()`:

1. Parent sends `{ id, limit }` to the worker.
2. Worker computes `sum = 1 + 2 + ... + N`, reporting progress.
3. Worker replies with `{ type: "progress", percent }` at ~1% intervals, giving the event loop time to breathe with `setImmediate`.
4. Worker replies `{ type: "done", result }` and exits; the parent logs the elapsed time.

Run it with a large limit and watch the main process stay responsive while the calculation happens off the main thread:

```bash
node main.js worker 10000000
```

### `progressbar.js`

A standalone animation that renders `Progress: [████░░░░░░] 25%` to the terminal with `clearLine`/`cursorTo`. It is intentionally **not** hooked into the worker flow — fork a worker in one terminal and run `node progressbar.js` in another to see both animations running independently in different processes.

## Files

| File            | Purpose                                  |
| --------------- | ---------------------------------------- |
| `main.js`       | CLI entry point, spawns/execs/execFiles/forks |
| `worker.js`     | Forked child that sums numbers via IPC   |
| `progressbar.js`| Standalone progress-bar animation        |