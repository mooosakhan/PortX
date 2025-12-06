const { exec } = require("child_process");

// scan a single port
function findPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -i :${port} -t`, (err, stdout) => {
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
    exec(`lsof -iTCP -sTCP:LISTEN -P -n`, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      const lines = stdout.trim().split("\n").slice(1); // Skip header
      const portMap = new Map();
      
      lines.forEach((line) => {
        const parts = line.split(/\s+/).filter(p => p.length > 0);
        if (parts.length < 9) return;
        
        // Find the address field (contains :)
        let address = '';
        for (let i = 8; i < parts.length; i++) {
          if (parts[i].includes(':')) {
            address = parts[i];
            break;
          }
        }
        
        const portMatch = address.match(/:(\d+)$/);
        if (portMatch) {
          const port = portMatch[1];
          if (!portMap.has(port)) {
            portMap.set(port, {
              pid: parts[1],
              process: parts[0],
              port: port,
              user: parts[2]
            });
          }
        }
      });
      
      resolve(Array.from(portMap.values()).sort((a, b) => 
        parseInt(a.port) - parseInt(b.port)
      ));
    });
  });
}

// kill a process
function killPort(pid) {
  return new Promise((resolve) => {
    exec(`kill -9 ${pid}`, (err) => resolve(!err));
  });
}

module.exports = { findPort, findAllPorts, killPort };
