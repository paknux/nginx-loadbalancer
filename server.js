const express = require('express');
const os = require('os');
const si = require('systeminformation');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/info', async (req, res) => {
    try {
        const [cpu, mem, disk, net] = await Promise.all([
            si.currentLoad(),
            si.mem(),
            si.fsSize(),
            si.networkStats()
        ]);

        // Konversi RAM ke GB
        const ramUsed = (mem.active / 1024 / 1024 / 1024).toFixed(1);
        const ramTotal = (mem.total / 1024 / 1024 / 1024).toFixed(1);

        // Konversi Disk ke GB (Drive utama)
        const mainDisk = disk[0];
        const diskUsed = (mainDisk.used / 1024 / 1024 / 1024).toFixed(1);
        const diskTotal = (mainDisk.size / 1024 / 1024 / 1024).toFixed(1);

        // Ambil IP Lokal Utama
        const nets = os.networkInterfaces();
        let ipAddr = '127.0.0.1';
        for (const name of Object.keys(nets)) {
            for (const netInterface of nets[name]) {
                if (netInterface.family === 'IPv4' && !netInterface.internal) {
                    ipAddr = netInterface.address;
                    break;
                }
            }
        }

        res.json({
            hostname: os.hostname(),
            os: `${os.type()} ${os.release()}`,
            ip: ipAddr,
            cpu: Math.round(cpu.currentLoad) + "%",
            ramPct: Math.round((mem.active / mem.total) * 100) + "%",
            ramCap: `${ramUsed}GB / ${ramTotal}GB`,
            diskPct: Math.round(mainDisk.use) + "%",
            diskCap: `${diskUsed}GB / ${diskTotal}GB`,
            netIn: (net[0].rx_sec / 1024).toFixed(2) + " KB/s",
            netOut: (net[0].tx_sec / 1024).toFixed(2) + " KB/s"
        });
    } catch (error) {
        res.status(500).json({ error: "Gagal ambil data sistem" });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`\n🚀 SERVER AKTIF: http://localhost:${port}\n`);
});