# devTinder
sudo nano /opt/homebrew/etc/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru

brew services restart redis

kill -9 $(lsof -t -i:3000) 