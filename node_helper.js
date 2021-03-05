'use strict';

/* Magic Mirror
 * Module: MMM-miflora
 *
 * By Arian Suarez
 * MIT Licensed.
 */

const NodeHelper = require('node_helper');
const poller = require('./miflora_poller')

module.exports = NodeHelper.create({
    start: function () {
        console.log('MMM-miflora helper started ...');
        this.scanInProgress = false;
    },

    // Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, payload) {
        if (notification === 'DATA_REQUEST') {
            const self = this

            if (this.scanInProgress === false) {
                console.log("scanning for sensors")
                this.scanInProgress = true;

                // execute scan
                poller.scan().then((sensorValues) => {
                    // Send data
                    console.log(`sending result: ${sensorValues}`)
                    self.sendSocketNotification('DATA_RESPONSE', sensorValues);

                    this.scanInProgress = false;
                })
            }
            else {
                console.log("scan already in progress")
            }
        }
    }
});