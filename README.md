
## Required 

sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)

https://github.com/noble/noble#running-on-linux


## sample output

```javascript
[ { address: 'c4:7c:8d:6b:ca:9e',
    type: 'MiFloraMonitor',
    firmwareInfo: { battery: 100, firmware: '3.2.4' },
    sensorValues: { temperature: 22.4, lux: 230, moisture: 0, fertility: 0 },
    friendlyName: 'lavender',
    timeStamp: 1614954202204 } ]

```
