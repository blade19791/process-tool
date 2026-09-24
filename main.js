import { spawn, exec, execFile, fork } from "node:child_process";
import { isValidIPv4, isValidHostname } from "./validator.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("Please provide a command.");
  process.exit(1);
}

switch (args[0]) {
  case "processes":
    processes();
    break;

  case "info":
    info();
    break;
  case "node-info":
    nodeInfo();
    break;
  case "ping":
    ping(args[1]);
    break;
  case "worker":
    worker(args[1]);
    break;
  case "git-status":
    gitStatus();
    break;
  default:
    console.log("Unknown command.");
    process.exit(1);
}

function processes() {
  const child = spawn("ps", ["aux"]);

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("error", (error) => {
    console.error("Error: ", error);
  });

  child.on("close", (code) => {
    console.log("Process exit with code: ", code);
  });
}

function info() {
  exec("uname -a", (error, stdout, stderr) => {
    if (error) return console.error("Error: ", error);
    if (stderr) return console.error("stderr: ", error);

    console.log("SYSTEM INFORMATION: ");
    console.log(stdout);
  });
}

function nodeInfo() {
  execFile("node", ["--version"], (error, stdout, stderr) => {
    if (error) return console.error("Error: ", error);
    if (stderr) return console.error("stderr: ", stderr);

    console.log("NODE VERSION: ");
    console.log(stdout);
  });
}

function ping(host) {
  host ||= "google.com";
  validateHost(host);

  const child = spawn("ping", [host]);

  child.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  child.on("error", (error) => {
    console.error("Error: ", error);
  });

  child.on("close", (code) => {
    console.log("Process exit with code: ", code);
  });
}

function worker(limit) {
  limit ||= 1000;
  const start = Date.now();
  const child = fork("./worker.js");

  child.on(
    "message",
    ({ id, type, current, limit: total, result, percent }) => {
      if (type === "progress") {
        console.log(`Worker ${id}: ${percent}%`);
      } else if (type === "done") {
        console.log(
          `Worker ${id}: result = ${result} in ${Date.now() - start}ms`,
        );
      }
    },
  );

  child.on("exit", (code, signal) => {
    console.log(`Process exit with code: ${code}, signal: ${signal}`);
  });

  child.on("error", (err) => {
    console.error("Worker error event:", err.message);
  });

  child.send({ id: 0, limit: Number(limit) });
}

function gitStatus() {
  exec("git status", (error, stdout, stderr) => {
    if (error) return console.error("Error: ", error);
    if (stderr) return console.error("stderr: ", error);

    console.log("GIT STATUS: ");
    console.log(stdout);
  });
}

function handleShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => handleShutdown(signal));
});

function validateHost(host) {
  if (!isValidHostname(host) && !isValidIPv4(host)) {
    console.error("Invalid hostname or IP address.");
    process.exit(1);
  }
}
