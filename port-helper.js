const { exec } = require("child_process");

// scan a single port
function findPort(port) {
  return new Promise((resolve) => {
    exec(`sudo lsof -i :${port} -t`, (err, stdout) => {
      if (err || !stdout) return resolve(null);
      const pid = stdout.trim();
      exec(`ps -p ${pid} -o comm= -o user=`, (err2, out2) => {
        if (err2) return resolve(null);
        const [process, user] = out2.trim().split(/\s+/);
        resolve({ pid, process, user });
      });
    });
  });
}

// scan all listening ports
function findAllPorts() {
  return new Promise((resolve) => {
    exec(`sudo lsof -i -P -n | grep LISTEN`, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      const lines = stdout.trim().split("\n");
      const ports = lines.map((line) => {
        const parts = line.split(/\s+/);
        return {
          pid: parts[1],
          process: parts[0],
          port: parts[8].match(/:(\d+)$/)[1],
          user: parts[2],
        };
      });
      resolve(ports);
    });
  });
}

// kill a process
function killPort(pid) {
  return new Promise((resolve) => {
    exec(`sudo kill -9 ${pid}`, (err) => resolve(!err));
  });
}

module.exports = { findPort, findAllPorts, killPort };
