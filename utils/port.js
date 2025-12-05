const { exec } = require("child_process");

function findProcessByPort(port) {
  console.log(`[findProcessByPort] Searching for port: ${port}`);
  
  return new Promise((resolve) => {
    exec(`lsof -i :${port} -t`, (error, stdout) => {
      console.log(`[findProcessByPort] lsof output:`, stdout);
      console.log(`[findProcessByPort] lsof error:`, error);
      
      if (error || !stdout) {
        console.log(`[findProcessByPort] No process found on port ${port}`);
        return resolve(null);
      }

      const pid = stdout.trim().split('\n')[0];
      console.log(`[findProcessByPort] Found PID: ${pid}`);
      
      exec(`ps -p ${pid} -o comm=,user=`, (err, out) => {
        console.log(`[findProcessByPort] ps output:`, out);
        console.log(`[findProcessByPort] ps error:`, err);
        
        if (err) {
          resolve({ pid, process: "Unknown", user: "" });
        } else {
          const parts = out.trim().split(/\s+/);
          const result = {
            pid: pid,
            process: parts[0] || "Unknown",
            user: parts[1] || ""
          };
          console.log(`[findProcessByPort] Resolved result:`, result);
          resolve(result);
        }
      });
    });
  });
}

function findAllActivePorts() {
  console.log(`[findAllActivePorts] Starting scan for all active ports...`);
  
  return new Promise((resolve) => {
    const cmd = `lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null`;
    console.log(`[findAllActivePorts] Executing command: ${cmd}`);
    
    exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout) => {
      console.log(`[findAllActivePorts] Raw output length:`, stdout ? stdout.length : 0);
      console.log(`[findAllActivePorts] Error:`, error);
      console.log(`[findAllActivePorts] First 500 chars of output:`, stdout ? stdout.substring(0, 500) : 'none');
      
      if (error || !stdout) {
        console.error('[findAllActivePorts] Error finding ports:', error);
        return resolve([]);
      }

      const lines = stdout.trim().split('\n');
      console.log(`[findAllActivePorts] Total lines:`, lines.length);
      console.log(`[findAllActivePorts] First few lines:`, lines.slice(0, 3));
      
      const dataLines = lines.slice(1); // Skip header
      const portMap = new Map();

      dataLines.forEach((line, index) => {
        console.log(`[findAllActivePorts] Processing line ${index}:`, line);
        
        // Split by whitespace, handling multiple spaces
        const parts = line.split(/\s+/).filter(p => p.length > 0);
        console.log(`[findAllActivePorts] Line ${index} parts:`, parts);
        
        if (parts.length < 9) {
          console.log(`[findAllActivePorts] Line ${index} skipped - not enough parts (${parts.length})`);
          return;
        }

        const process = parts[0];
        const pid = parts[1];
        const user = parts[2];
        
        // Find the address field (contains :)
        let address = '';
        for (let i = 8; i < parts.length; i++) {
          if (parts[i].includes(':')) {
            address = parts[i];
            break;
          }
        }
        
        console.log(`[findAllActivePorts] Line ${index} address:`, address);
        
        // Match port at the end, after colon
        const portMatch = address.match(/:(\d+)$/);
        if (portMatch) {
          const port = portMatch[1];
          console.log(`[findAllActivePorts] Line ${index} extracted port:`, port);
          
          if (!portMap.has(port)) {
            portMap.set(port, {
              port,
              pid,
              process,
              user
            });
            console.log(`[findAllActivePorts] Added port ${port} to map`);
          } else {
            console.log(`[findAllActivePorts] Port ${port} already in map, skipping`);
          }
        } else {
          console.log(`[findAllActivePorts] Line ${index} no port match in address`);
        }
      });

      const result = Array.from(portMap.values()).sort((a, b) => 
        parseInt(a.port) - parseInt(b.port)
      );
      
      console.log(`[findAllActivePorts] Final result - Found ${result.length} ports:`, result);
      resolve(result);
    });
  });
}

function killProcess(pid) {
  console.log(`[killProcess] Attempting to kill PID: ${pid}`);
  
  return new Promise((resolve) => {
    exec(`kill -9 ${pid}`, (error) => {
      console.log(`[killProcess] Kill result - Error:`, error);
      const success = !error;
      console.log(`[killProcess] Success:`, success);
      resolve(success);
    });
  });
}

module.exports = { findProcessByPort, findAllActivePorts, killProcess };
