const miflora = require('miflora')
const fs = require('fs');

const NAME_LOOKUP_FILE = './modules/MMM-miflora/friendlyNameLookup.json'
// const NAME_LOOKUP_FILE = 'friendlyNameLookup.json'

// const createFriendlyName = (address, name) => {
//     return {address, name}
// }

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

const updateFriendlyLookup = (address, name) => {
    if (!fs.existsSync(NAME_LOOKUP_FILE)) {
        console.log("file doesn't exit creating default")
        defaultFriendlyLookup()
    }

    const data = fs.readFileSync(NAME_LOOKUP_FILE, 'utf8');

    let friendly = JSON.parse(data); //now it an object
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

    // console.log('Current directory: ' + process.cwd());
    if (!fs.existsSync(NAME_LOOKUP_FILE)) {
        console.log("file doesn't exit creating default")
        defaultFriendlyLookup()
    }

    const data = fs.readFileSync(NAME_LOOKUP_FILE, 'utf8');

    let friendly = JSON.parse(data); //now it an object
    let index = friendly.lookup.findIndex((entry) => entry.address.toLowerCase() === address.toLowerCase())

    if (index === -1) {
        console.log("entry not found")
        return address
    } else {
        console.log("found entry")
        return friendly.lookup[index].name
    }
}

const discoverOptions = {
    duration: 10000
}

const scan = async () => {
    let sensorValues = []
    let devices = []

    try {
        console.log('starting scan')
        devices = await miflora.discover(discoverOptions)
        console.log('devices discovered: ', devices.length)
        if (devices.length === 0) {
            return []
        }
    } catch (e) {
        console.log(`discovery error ${e}`)
        return []
    }


    for (let dev of devices) {
        try {
            console.log(`query: ${dev.address}`)
            const query = await dev.query()
            query.friendlyName = friendlyNameLookup(query.address)
            query.timeStamp = Date.now()
            console.log(query)
            sensorValues.push(query)

        } catch (e) {
            console.log(`query error ${e}`)
        }
    }

    console.log(sensorValues)
    return {sensorValues}
}

module.exports.scan = scan;
module.exports.updateFriendlyLookup = updateFriendlyLookup;

// updateFriendlyLookup('c4:7c:8d:6b:ca:9e', 'tomato')
// updateFriendlyLookup('c4:7c:8d:6b:ca:9f', 'potato')
// let name = friendlyNameLookup('c4:7c:8d:6b:ca:9e')
// console.log(`got name: ${name}`)
//
// name = friendlyNameLookup('c4:7c:8d:6b:ca:9F')
// console.log(`got name: ${name}`)

// scan().then((values) => {
//     console.log(`got: ${values.sensor_values[0].friendlyName}`)
//     process.exit();
// }).catch((err) => {
//     console.log(err)
//     process.exit();
// })


