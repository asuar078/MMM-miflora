'use strict';

/* Magic Mirror
 * Module: MMM-miflora
 *
 * By Arian Suarez
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const poller = require('./miflora_poller')
const { exec } = require("child_process");

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-miflora helper started ...');
        this.scanInProgress = false;
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MIFLORA_DATA_REQUEST') {
            const self = this

            if (this.scanInProgress === false) {
                console.log("scanning for sensors")
                this.scanInProgress = true;

                exec("/home/pi/MMM-miflora/scan.sh", (error, stdout, stderr) => {
                    if (error) {
                        console.log(`scan error ${error}`)
                        this.scanInProgress = false;
                        return;
                    }
                    if (stderr) {
                        console.log(`scan error: ${stderr}`);
                        this.scanInProgress = false;
                        return;
                    }
                    try {
                        // Send data
                        const sensorValues = JSON.parse(stdout)
                        console.log(`sending result: ${sensorValues}`)
                        self.sendSocketNotification('MIFLORA_DATA_RESPONSE', sensorValues);

                        this.scanInProgress = false;
                    }
                    catch (e) {
                        console.log(e)
                    }

                });

                // // execute scan
                // poller.scan()
                //     .then((sensorValues) => {
                //         // Send data
                //         console.log(`sending result: ${sensorValues}`)
                //         self.sendSocketNotification('MIFLORA_DATA_RESPONSE', sensorValues);
                //
                //         this.scanInProgress = false;
                //     }).catch((e) => {
                //     console.log(`scan error ${e}`)
                //     this.scanInProgress = false;
                // })
            } else {
                console.log("scan already in progress")
            }
        }
        if (notification === 'MIFLORA_GET_FRIENDLY_NAME_REQUEST') {
            const self = this

            console.log('friendly name request')
            const friendly = poller.getFriendlyLookup()
            self.sendSocketNotification('MIFLORA_GET_FRIENDLY_NAME_RESPONSE', friendly);
        }
        if (notification === 'MIFLORA_UPDATE_FRIENDLY_NAME_REQUEST') {
            const self = this

            console.log(`updating ${payload.address} to ${payload.name}`)
            if (payload.address && payload.name) {
                poller.updateFriendlyLookup(payload.address, payload.name)
            }

            const friendly = poller.getFriendlyLookup()
            self.sendSocketNotification('MIFLORA_UPDATE_FRIENDLY_NAME_RESPONSE', friendly);
        }

        if (notification === 'MIFLORA_TEST') {
            console.log("node helper got miflora test")
        }
    }
});