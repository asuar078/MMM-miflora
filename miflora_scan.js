const miflora = require('miflora')
const friendly = require('./miflora_poller')

const discoverOptions = {
    duration: 10000
}

const scan = async () => {
    let sensorValues = []
    let devices = []

    try {
        // console.log('starting scan')
        devices = await miflora.discover(discoverOptions)
        // console.log('devices discovered: ', devices.length)
        if (devices.length === 0) {
            return []
        }
    } catch (e) {
        // console.log(`discovery error ${e}`)
        process.stderr.write(e)
        return;
    }


    for (let dev of devices) {
        try {
            // console.log(`query: ${dev.address}`)
            const query = await dev.query()
            query.friendlyName = friendly.friendlyNameLookup(query.address)
            query.timeStamp = Date.now()
            // console.log(query)
            sensorValues.push(query)

        } catch (e) {
            // console.log(`query error ${e}`)
            process.stderr.write(e)
        }
    }

    const json = JSON.stringify(sensorValues)
    process.stdout.write(json)
}

scan().then((values) => {
    process.exit();
}).catch((err) => {
    process.exit();
})
