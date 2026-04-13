# Load Balancer NginX

---
## A. Konfigurasi

A.1. VPC
````
Nama : sekolah
IP : 192.168.100.0/24
````

A.2. Subnet : 4 buah 
````
subnet-public : 192.168.100.0/26
subnet-private-1 : 192.168.100.64/26
subnet-private-2 : 192.168.100.128/26
subnet-private-3 : 192.168.100.192/26
````

A.3. Instance EC2 : 3 buah
````
srv-public : ubuntu : di subnet-public
srv-private-1 : ubuntu : di subnet-private-1
srv-private-2 : ubuntu : di subnet-private-2
subnet-private-3 sementara kosong nantinya bisa ditempatkan srv-database di sini
````

A.4. SG : 1 buah
````
sg-sekolah:
allow inbound 22(SSH), 80(HTTP), 443(HTTPS), 3306(MySQL), TCP/3000(Node.js), dan ICMP(ping)
from 0.0.0.0/0
````

A.5. IGW : 1 buah
````
sekolah-igw attach ke VPC sekolah 
````


A.6. Route table : 2 buah
````
sekolah-public-rt:
subnet-associations ke subnet-public
0.0.0.0/0 via IGW sekolah-igw
````

Kemudian buat dulu instance EC2 srv-public, baru buat routing table berikut ini:
````
sekolah-private-rt:
subnet-associations ke subnet-private-1, subnet-private-2, subnet-private-3
0.0.0.0/0 via NAT instance srv-public
````



---
## B. Ganti Hostname yang sesuai

B.1. Masuk ke setiap instance jalankan perintah

misal di srv-public:
````
sudo hostnamectl set-hostname srv-public
````

lalu jalankan bash lembali agar perubahan langsung tampak
````
exec bash
````

B.3. Lakukan hal yang sama untuk srv-private-1 dan srv-private-2



---
## C. Setting srv-public agar dapat menjadi NAT Instance

C.1. Buka file /etc/sysctl.conf dan hapus tanda komentar (#) pada baris:
````
net.ipv4.ip_forward=1
````

C.2. Setelah itu, jalankan agar forwarding aktif
````
sudo sysctl -p
````

C.3. Tampilkan nama interface
````
ip link show
````
misal diketahui namanya ens5



C.4. Buat rule iptables yang akan mentranslasikan (SNAT-masquerade) setiap paket yang akan keluar dari interface ens5
````
sudo iptables -t nat -A POSTROUTING -o ens5 -j MASQUERADE
````

C.5. Agar aturan ini tidak hilang saat reboot, instal iptables-persistent:
````
sudo apt update && sudo apt install iptables-persistent -y
````
Pilih 'Yes' saat muncul dialog konfirmasi penyimpanan rules

C.6. Shutdown instance
````
Pilih srv-public
Instance state > Stop instance
````


C.7. Stop Source/Destination Check
````
Pilih srv-public, kondisinya stopped
Action > Networking > Change source/destination check > centang Stop > Save
````

C.8. Run kembali instance
````
Pilih srv-public
Instance state > Start instance
````


## D. Load Balancer NginX
````
sudo su

apt update -y 

apt install nodejs npm git -y

mkdir -p /opt/monitor-app

cd /opt/monitor-app

git clone https://github.com/paknux/nginx-loadbalancer .

npm install express socket.io os-utils systeminformation

(crontab -l 2>/dev/null; echo "@reboot sleep 10 && /usr/bin/node /opt/monitor-app/server.js >> /opt/monitor-app/monitor.log 2>&1 &") | crontab -

/usr/bin/node /opt/monitor-app/server.js >> /opt/monitor-app/monitor.log 2>&1 &


````

---
User Data
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

