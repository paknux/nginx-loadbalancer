# Aplikasi CRUD PHP-MySQL yang menyimpan file di **AWS S3** 
---

## menggunakan **EC2 Ubuntu 24.04** di lingkungan **AWS Academy**.
---

````
#!/bin/bash
# 1. Update & Install
apt update -y && apt install nodejs npm git -y

# 2. Setup Folder
mkdir -p /opt/monitor-app
cd /opt/monitor-app

# 3. Clone & Install Dependencies
git clone https://github.com/paknux/nginx-loadbalancer .
npm install express socket.io os-utils systeminformation

# 4. Daftarkan ke Crontab agar otomatis jalan saat REBOOT nanti
(crontab -l 2>/dev/null; echo "@reboot sleep 10 && /usr/bin/node /opt/monitor-app/server.js >> /opt/monitor-app/monitor.log 2>&1 &") | crontab -

# 5. JALANKAN SEKARANG (Agar langsung aktif saat User Data selesai)
/usr/bin/node /opt/monitor-app/server.js >> /opt/monitor-app/monitor.log 2>&1 &
````