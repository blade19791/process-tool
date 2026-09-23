# proc-tool

A small CLI utility for learning the Node.js `child_process` module. It demonstrates the three main ways to run tasks outside the main Node.js process:

- **`spawn`** – streaming external commands
- **`exec`** – running a command and buffering its output
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
node main.js ping [host]            # ping a host, default google.com (spawn)
node main.js worker [limit]         # sum 1..N in a forked child process
node main.js git-status             # run `git status` (exec)
```

## How it works

### `spawn` / `exec` (`main.js`)

- `processes` and `ping` use `spawn`, which streams `stdout`/`stderr` events as they arrive — good for long-running or chatty commands.
- `info` and `git-status` use `exec`, which buffers the whole output and delivers it through a callback — good for quick commands where you want the full result at once.

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
| `main.js`       | CLI entry point, spawns/execs/forks      |
| `worker.js`     | Forked child that sums numbers via IPC   |
| `progressbar.js`| Standalone progress-bar animation        |

## Git conventions

This repo uses [Conventional Commits](https://www.conventionalcommits.org/): every commit message is `type(scope): subject`, followed by an optional body and footer.

```text
feat(worker): report progress via IPC
fix(main): handle nonzero exit codes
docs(readme): add usage examples
refactor(main): extract ping into own function
```

| Type      | When to use                              |
| --------- | ---------------------------------------- |
| `feat`    | new command or feature                   |
| `fix`     | bug fix                                  |
| `docs`    | documentation only                       |
| `refactor`| code change with no behavior change      |
| `test`    | adding or updating tests                 |

Write the subject as an imperative sentence (e.g. "add usage examples", not "added usage examples") and keep it under ~50 characters. Skip the `(scope)` when it adds nothing.