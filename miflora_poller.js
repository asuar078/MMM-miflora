const fs = require('fs');
const { exec } = require("child_process");

const NAME_LOOKUP_FILE = '/home/pi/MagicMirror/modules/MMM-miflora/friendlyNameLookup.json'
const SCAN_SCRIPT_CMD = '/home/pi/MagicMirror/modules/MMM-miflora/scan.sh'

class FriendlyName {
    constructor(address, name) {
        this.address = address;
        this.name = name
    }
}

const defaultFriendlyLookup = () => {
    let friendly = {
        lookup: []
    }

    friendly.lookup.push(new FriendlyName('default', 'unknown'))

    const json = JSON.stringify(friendly)

    fs.writeFileSync(NAME_LOOKUP_FILE, json, {
        encoding: "utf8",
        flag: "w",
        mode: 0o666
    });
}

const getFriendlyLookup = () => {

    if (!fs.existsSync(NAME_LOOKUP_FILE)) {
        console.log("file doesn't exit creating default")
        defaultFriendlyLookup()
    }

    try {
        const data = fs.readFileSync(NAME_LOOKUP_FILE, 'utf8');
        return JSON.parse(data)
    }
    catch (e) {
       console.log(e)
    }

    fs.unlinkSync(NAME_LOOKUP_FILE)
    console.log("file is corrupted removing and resetting to default")
    defaultFriendlyLookup()

    const data = fs.readFileSync(NAME_LOOKUP_FILE, 'utf8');
    return JSON.parse(data)
}

const editFriendlyLookup = (newLookup) => {

    let friendly = {
        lookup: []
    }

    for (let lookup of newLookup) {
        const entry = new FriendlyName(lookup.address, lookup.name)
        friendly.lookup.push(entry)
    }

    const json = JSON.stringify(friendly)

    fs.writeFileSync(NAME_LOOKUP_FILE, json, {
        encoding: "utf8",
        flag: "w",
        mode: 0o666
    });
}

const updateFriendlyLookup = (address, name) => {
    let friendly = getFriendlyLookup()
    let index = friendly.lookup.findIndex((entry) => entry.address.toLowerCase() === address.toLowerCase())

    if (index === -1) {
        console.log("not found adding new entry")
        friendly.lookup.push(new FriendlyName(address, name))
    } else {
        console.log("found updating entry")
        friendly.lookup[index].name = name
    }

    const json = JSON.stringify(friendly)

    fs.writeFileSync(NAME_LOOKUP_FILE, json, {
        encoding: "utf8",
        flag: "w",
        mode: 0o666
    });
}

const friendlyNameLookup = (address) => {
    let friendly = getFriendlyLookup()
    let index = friendly.lookup.findIndex((entry) => entry.address.toLowerCase() === address.toLowerCase())

    if (index === -1) {
        console.log("entry not found")
        updateFriendlyLookup(address, address)
        return address
    } else {
        console.log("found entry")
        return friendly.lookup[index].name
    }
}

const scan = (callback) => {
    let devices = {
        'sensorValues': []
    }

    try {
        exec(SCAN_SCRIPT_CMD, (error, stdout, stderr) => {
            try {
                if (error) {
                    console.log(`scan error ${error}`)
                    callback(devices)
                    return;
                }
                if (stderr) {
                    console.log(`scan error: ${stderr}`);
                    callback(devices)
                    return;
                }
                console.log(stdout)

                // Send data
                const scanResult = JSON.parse(stdout)
                console.log(`sending result: ${scanResult}`)

                for (let dev of scanResult ) {
                    dev.friendlyName = friendlyNameLookup(dev.address)
                    dev.timeStamp = Date.now()
                    devices.sensorValues.push(dev)
                }

                callback(devices)
            } catch (e) {
                console.log(`error ${e}`)
                callback(devices)
            }
        });
    } catch (e) {
        console.log(`discovery error ${e}`)
        callback(devices)
    }
}

module.exports.scan = scan;
module.exports.getFriendlyLookup = getFriendlyLookup ;
module.exports.updateFriendlyLookup = updateFriendlyLookup;
module.exports.editFriendlyLookup = editFriendlyLookup;
module.exports.friendlyNameLookup = friendlyNameLookup;

// updateFriendlyLookup('c4:7c:8d:6b:ca:9e', 'tomato')
// updateFriendlyLookup('c4:7c:8d:6b:ca:9f', 'potato')
// let name = friendlyNameLookup('c4:7c:8d:6b:ca:9e')
// console.log(`got name: ${name}`)
//
// name = friendlyNameLookup('c4:7c:8d:6b:ca:9f')
// console.log(`got name: ${name}`)
//
// updateFriendlyLookup('c4:7c:8d:6b:ca:9e', 'tomato')
// updateFriendlyLookup('c4:7c:8d:6b:ca:9f', 'potato')
// process.exit();

// scan((values) => {
//     console.log("got back")
//     console.log(values)
//     process.exit();
// })

