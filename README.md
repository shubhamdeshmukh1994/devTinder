# devTinder
sudo nano /opt/homebrew/etc/redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru

brew services restart redis