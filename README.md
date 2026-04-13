# Load Balancer NginX

---
## A. Konfigurasi

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
subnet-private-3 sementara kosong nantinya bisa ditempatkan srv-database di sini
````

1 SG
````
sg-sekolah:
allow inbound 22/SSH, 80/HTTP, 443/HTTPS, 3306/MySQL, dan ICMP
from 0.0.0.0/0
````

1 IGW
````
sekolah-igw attach ke VPC sekolah 
````


2 route table
````
sekolah-public-rt:
subnet-associate ke subnet-public
0.0.0.0/0 via IGW sekolah-igw

sekolah-private-rt:
subnet-associate ke subnet-private-1, subnet-private-2, subnet-private-3
0.0.0.0/0 via NAT instance srv-public
````



---
## B. Ganti Hostname yang sesuai

B1. Masuk ke setiap instance jalankan perintah

misal di srv-public:
````
sudo hostnamectl set-hostname srv-public
````

B2. lalu jalankan bash lembali agar perubahan langsung tampak
````
exec bash
````

B3. Lakukan hal yang sama untuk srv-private-1 dan srv-private-2



---
## C. Setting srv-public agar dapat menjadi NAT Instance

C1. Buka file /etc/sysctl.conf dan hapus tanda komentar (#) pada baris:
````
net.ipv4.ip_forward=1
````

C2. Setelah itu, jalankan agar forwarding aktif
````
sudo sysctl -p
````

C3. Tampilkan nama interface
````
ip link show
````
misal diketahui namanya ens5


C4. Buat rule ip tables yang akan mentranslasikan (SNAT-masquerade) setiap paket yang akan keluar dari interface ens5
````
sudo iptables -t nat -A POSTROUTING -o ens5 -j MASQUERADE
````

---
## D. Load Balancer NginX

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

