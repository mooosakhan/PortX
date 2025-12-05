
# PortX

**PortX** is a lightweight Electron app for Linux that helps you **scan active ports**, view running processes, and **kill processes occupying ports** with ease. Perfect for developers and sysadmins who need a simple GUI for port management.

---

## Features

- Scan a specific port to see which process is using it.
- Scan all active ports at once.
- Kill processes occupying a port directly from the app.
- Lightweight and easy-to-use GUI built with Electron.
- Works on Ubuntu/Linux with minimal setup.

---

## Installation

### From pre-built files (Linux)

1. Download the latest release from the [GitHub Releases](https://github.com/mooosakhan/portx/releases).  
2. Make the file executable (if needed):
   ```bash
   chmod +x portx-1.0.0.AppImage
````

3. Run the app:

   ```bash
   ./portx-1.0.0.AppImage
   ```

### Build from source

```bash
git clone https://github.com/mooosakhan/portx.git
cd portx
npm install
npm start
```

---

## Usage

1. Open the app.
2. Enter a port number in the search box and click **Scan**, or click **Scan All** to see all active ports.
3. Use the **Kill Process** button to stop a process occupying a port (may require your sudo password).

---

## Requirements

* Ubuntu / Linux (tested on 22.04)
* Node.js v22+
* npm
* Electron (installed via npm)

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

## License

This project is licensed under the ISC License.
