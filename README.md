# Load Balancer NginX
---

## Konfigurasi


VPC
````
Nama : sekolah
IP : 192.168.100.0/24
````

4 Subnet 
````
subnet-public : 192.168.100.0/26
subnet-private-1 : 192.168.100.64/26
subnet-private-2 : 192.168.100.128/26
subnet-private-3 : 192.168.100.192/26
````

3 Instance EC2
````
srv-public : ubuntu : di subnet-public
srv-private-1 : ubuntu : di subnet-private-1
srv-private-2 : ubuntu : di subnet-private-2
````

1 SG
````
sg-sekolah
allow inbound 22/SSH, 80/HTTP, 443/HTTPS, ICMP
from 0.0.0.0/0
````

1 IGW
````
sekolah-igw attach ke VPC sekolah 
````


2 route table
````
sekolah-public-rt
0.0.0.0/0 via IGW sekolah-igw
associate ke subnet-public

sekolah-private-rt
0.0.0.0/0 via IGW instance srv-public
associate ke subnet-private-1, subnet-private-2, subnet-private-3

````




## Setting NAT Instance
---

````
Set srv-public
````



## Load Balancer NginX
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