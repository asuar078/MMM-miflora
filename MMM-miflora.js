Module.register("MMM-miflora", {
    // Default module config.
    defaults: {
        updateInterval: 60, // Seconds
        titleText: "Plant Life",
        // units: "metric",
        units: "imperial",
        tableClass: "small",
        decimalSymbol: ".",
        maxMsgTimeDiff_min: 30,
        nameCharLimit: 30
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        this.SoilMoistureLimit = {
            min: 20,
            max: 70,
            unit: '%'
        }

        this.SunlightLimit = {
            min: 1,
            max: 130,
            unit: 'kLUX'
        }

        this.TemperatureLimit = {
            min: 10,
            max: 35,
            unit: 'C'
        }

        this.BatteryLimit = {
            min: 5,
            max: 100,
            unit: '%'
        }

        // this.sensorValues = []
        this.sensorValues = [
            {
                address: 'c4:7c:8d:6b:ca:9e',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 100, firmware: '3.2.4'},
                sensorValues: {temperature: 5.0, lux: 500, moisture: 5, fertility: 0},
                friendlyName: 'lavender',
                timeStamp: 1615157554387
            },
            {
                address: 'c4:7c:8d:6b:cc:be',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 40, firmware: '3.2.4'},
                sensorValues: {temperature: 10.5, lux: 2000, moisture: 15, fertility: 0},
                friendlyName: 'Potato',
                timeStamp: Date.now()
            },
            {
                address: 'c4:7c:8d:3c:cb:73',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 95, firmware: '3.2.4'},
                sensorValues: {temperature: 20.9, lux: 5000, moisture: 30, fertility: 10},
                friendlyName: 'c4:7c:8d:3c:cb:73',
                timeStamp: Date.now()
            },
            {
                address: 'c4:8c:ad:6b:ca:9e',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 100, firmware: '3.2.4'},
                sensorValues: {temperature: 32.4, lux: 12000, moisture: 45, fertility: 0},
                friendlyName: 'Snow ball',
                timeStamp: 1615157554387
            },
            {
                address: 'c4:7c:8d:6b:cc:be',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 70, firmware: '3.2.4'},
                sensorValues: {temperature: 45.4, lux: 70000, moisture: 60, fertility: 0},
                friendlyName: 'Gary',
                timeStamp: Date.now()
            },
            {
                address: 'c4:7c:8d:3c:cb:76',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 95, firmware: '3.2.4'},
                sensorValues: {temperature: 27.4, lux: 8000, moisture: 70, fertility: 10},
                friendlyName: 'c4:7c:8d:3c:cb:76',
                timeStamp: Date.now()
            },
            {
                address: 'c4:8c:ad:6b:ca:9e',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 100, firmware: '3.2.4'},
                sensorValues: {temperature: 22.4, lux: 82000, moisture: 80, fertility: 0},
                friendlyName: 'Snow ball II',
                timeStamp: 1615157554387
            },
            {
                address: 'c4:7c:8d:6b:cc:be',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 4, firmware: '3.2.4'},
                sensorValues: {temperature: 14.1, lux: 70000, moisture: 86, fertility: 0},
                friendlyName: 'Patrick',
                timeStamp: Date.now()
            },
        ]

        // if (this.scanInterval === undefined) {
        //     this.update();
        //     this.scanInterval = setInterval(
        //         this.update.bind(this),
        //         this.config.updateInterval * 1000);
        // }
    },

    update: function () {
        this.sendSocketNotification('MIFLORA_DATA_REQUEST', this.config);
    },

    getTimeDiffMin(timeStamp) {
        let startTime = new Date(timeStamp);

        let endTime = new Date()
        let diff = (endTime.getTime() - startTime.getTime()) / 1000
        diff /= 60;
        return Math.abs(Math.round(diff));
    },

    notificationReceived: function(notification, payload, sender) {
        // if (sender) {
        //     Log.log(this.name + " received a module notification: " + notification + " from sender: " + sender.name);
        // } else {
        //     Log.log(this.name + " received a system notification: " + notification);
        // }

        if (notification === 'MIFLORA_SCAN') {
            Log.log("miflora scan message")
            this.update()
        }
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'MIFLORA_DATA_RESPONSE') {
            // Log.info(`Data response ${payload.sensorValues.length}`)
            // Log.info(payload)

            if (payload.sensorValues === undefined) {
                this.updateDom()
                return;
            }

            if (payload.sensorValues.length === 0) {
                this.updateDom()
                return;
            }

            for (const sensors of payload.sensorValues) {
                let index = this.sensorValues.findIndex((entry) => entry.address.toLowerCase() === sensors.address.toLowerCase())
                if (index === -1) {
                    // Log.info("adding new sensor")
                    this.sensorValues.push(sensors)
                } else {
                    // Log.info("replacing values")
                    this.sensorValues[index] = sensors
                }
            }

            this.updateDom()
        }
    },

    getStyles: function () {
        return ['MMM-miflora.css'];
    },

    celsiusToFahren: function (temp_c) {
        return (temp_c * (9 / 5)) + 32;
    },

    getDegreeLabel: function (showUnit = false) {
        let degreeLabel = "";
        if (this.config.units === "metric" || this.config.units === "imperial") {
            degreeLabel += "°";
        }
        if (showUnit) {
            switch (this.config.units) {
                case "metric":
                    degreeLabel += "C";
                    break;
                case "imperial":
                    degreeLabel += "F";
                    break;
                case "default":
                    degreeLabel = "K";
                    break;
            }
        }
        return degreeLabel
    },

    addUnitRow: function (tableHeader) {

        let unitRow = document.createElement("tr");
        unitRow.className = "flora-row"
        tableHeader.appendChild(unitRow)

        let tempLimit = ""
        switch (this.config.units) {
            case "metric":
                tempLimit = `(${this.TemperatureLimit.min} - ${this.TemperatureLimit.max} ${this.getDegreeLabel(true)})`
                break;
            case "imperial":
                tempLimit = `(${this.celsiusToFahren(this.TemperatureLimit.min)} - ${this.celsiusToFahren(this.TemperatureLimit.max)} ${this.getDegreeLabel(true)})`
                break;
        }

        let tempUnitCell = document.createElement("td");
        tempUnitCell.innerHTML = tempLimit;
        tempUnitCell.className = "flora-unit-cell flora-inner-cell-padding";
        unitRow.appendChild(tempUnitCell);

        let lightUnitCell = document.createElement("td");
        lightUnitCell.innerHTML = `(${this.SunlightLimit.min} - ${this.SunlightLimit.max} kLUX)`
        lightUnitCell.className = "flora-unit-cell flora-inner-cell-padding";
        unitRow.appendChild(lightUnitCell);

        let moistureUnitCell = document.createElement("td");
        moistureUnitCell.innerHTML = `(${this.SoilMoistureLimit.min} - ${this.SoilMoistureLimit.max} %)`
        moistureUnitCell.className = "flora-unit-cell flora-inner-cell-padding";
        unitRow.appendChild(moistureUnitCell);

        let batteryUnitCell = document.createElement("td");
        batteryUnitCell.innerHTML = `(${this.BatteryLimit.min} - ${this.BatteryLimit.max} %)`
        batteryUnitCell.className = "flora-unit-cell flora-inner-cell-padding";
        unitRow.appendChild(batteryUnitCell);

        let emptyUnitCell = document.createElement("td");
        emptyUnitCell.innerHTML = "(Last message)"
        emptyUnitCell.className = "flora-unit-cell flora-outer-cell-padding";
        unitRow.appendChild(emptyUnitCell);
    },

    addTableHeader: function (table) {
        let tableHeader = document.createElement(("thead"))
        table.appendChild(tableHeader)

        // create row with titles
        let titleRow = document.createElement("tr");
        titleRow.className = "flora-row"
        tableHeader.appendChild(titleRow)

        let nameCell = document.createElement("td");
        nameCell.className = "flora-name flora-icon flora-inner-cell-padding";
        nameCell.innerHTML = "Name"
        nameCell.rowSpan = 2
        titleRow.appendChild(nameCell);

        // add temp icon
        let tempIconCell = document.createElement("td");
        tempIconCell.className = "flora-icon flora-inner-cell-padding";
        titleRow.appendChild(tempIconCell);

        let tempIcon = document.createElement("span");
        tempIcon.className = "fa fa-temperature-high"
        tempIconCell.appendChild(tempIcon);

        // add light icon
        let lightIconCell = document.createElement("td");
        lightIconCell.className = "flora-icon flora-inner-cell-padding";
        titleRow.appendChild(lightIconCell);

        let lightIcon = document.createElement("span");
        lightIcon.className = "fa fa-sun-o"
        lightIconCell.appendChild(lightIcon);

        // add moisture icon
        let moistureIconCell = document.createElement("td");
        moistureIconCell.className = "flora-icon flora-inner-cell-padding";
        titleRow.appendChild(moistureIconCell);

        let moistureIcon = document.createElement("span");
        moistureIcon.className = 'fa fa-tint'
        moistureIconCell.appendChild(moistureIcon);

        // add moisture icon
        let batteryIconCell = document.createElement("td");
        batteryIconCell.className = "flora-icon flora-inner-cell-padding";
        titleRow.appendChild(batteryIconCell);

        let batteryIcon = document.createElement("span");
        batteryIcon.className = "fa fa-battery-full"
        batteryIconCell.appendChild(batteryIcon);

        // add time icon
        let timeIconCell = document.createElement("td");
        timeIconCell.className = "flora-icon flora-outer-cell-padding";
        titleRow.appendChild(timeIconCell);

        let timeIcon = document.createElement("span");
        timeIcon.className = "fa fa-hourglass-end"
        timeIconCell.appendChild(timeIcon);

        this.addUnitRow(tableHeader)
    },

    getTempComment: function (temp_c) {

        if (temp_c < this.TemperatureLimit.min) {
            return "too cold"
        }

        if (temp_c > this.TemperatureLimit.max) {
            return "too hot"
        }

        return ""
    },

    getBatteryComment: function (battery_level) {

        if (battery_level < this.BatteryLimit.min) {
            return "low battery"
        }

        return ""
    },

    getLightIntensityComment: function (lux) {

        if (lux <= 500) {
            return "no light"
        }

        // Low light plants
        // Lux 500-2500
        if (lux <= 2500) {
            return "low light"
        }

        // Medium light plants
        // Lux 2500-10000
        if (lux <= 10000) {
            return "medium light"
        }

        // Bright light plants
        // Lux 10000-20000
        if (lux <= 20000) {
            return "indirect light"
        }

        // Very bright light plants
        // Lux 20000-50000
        return "direct light"
    },

    getComComment: function (comTimeDiff_min) {

        if (comTimeDiff_min > this.config.maxMsgTimeDiff_min) {
            return "lost sensor"
        }

        return ""
    },

    getMoistureComment: function (moisture) {

        if (moisture <= 19) {
            return "very dry"
        }

        if (moisture <= 30) {
            return "tolerant dry"
        }

        if (moisture <= 45) {
            return "lightly moist"
        }

        if (moisture <= 60) {
            return "moist"
        }

        if (moisture <= 75) {
            return "lightly wet"
        }

        if (moisture <= 85) {
            return "wet"
        }

        return "very wet"
    },

    addValueCommentRow: function (tableBody, sensors) {
        // create row
        let commentRow = document.createElement("tr");
        commentRow.className = "flora-row"
        tableBody.appendChild(commentRow);

        let tempCommentCell = document.createElement("td");
        tempCommentCell.innerHTML = this.getTempComment(sensors.sensorValues.temperature)
        tempCommentCell.className = "flora-comment-cell flora-inner-cell-padding";
        // tempCommentCell.rowSpan = 2
        commentRow.appendChild(tempCommentCell);

        let lightCommentCell = document.createElement("td");
        lightCommentCell.innerHTML = this.getLightIntensityComment(sensors.sensorValues.lux)
        lightCommentCell.className = "flora-comment-cell flora-inner-cell-padding";
        // tempCommentCell.rowSpan = 2
        commentRow.appendChild(lightCommentCell);

        let moistureCommentCell = document.createElement("td");
        moistureCommentCell.innerHTML = this.getMoistureComment(sensors.sensorValues.moisture)
        moistureCommentCell.className = "flora-comment-cell flora-inner-cell-padding";
        // tempCommentCell.rowSpan = 2
        commentRow.appendChild(moistureCommentCell);

        let batteryCommentCell = document.createElement("td");
        batteryCommentCell.innerHTML = this.getBatteryComment(sensors.firmwareInfo.battery)
        batteryCommentCell.className = "flora-comment-cell flora-inner-cell-padding";
        // tempCommentCell.rowSpan = 2
        commentRow.appendChild(batteryCommentCell);

        let comCommentCell = document.createElement("td");
        let timeDiff = this.getTimeDiffMin(sensors.timeStamp)
        comCommentCell.innerHTML = this.getComComment(timeDiff)
        comCommentCell.className = "flora-comment-cell flora-outer-cell-padding";
        // tempCommentCell.rowSpan = 2
        commentRow.appendChild(comCommentCell);
    },

    addValueRow: function (tableBody, sensors) {
        // create row
        let row = document.createElement("tr");
        row.className = "flora-row"
        tableBody.appendChild(row);

        // add name
        let nameCell = document.createElement("td");
        nameCell.className = "flora-name flora-cell flora-good-data flora-inner-cell-padding ";
        // get name with first letter of words capital
        nameCell.innerHTML = sensors.friendlyName.toLowerCase()
            .split(' ')
            .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ')
        nameCell.rowSpan = 2
        row.appendChild(nameCell);

        // add temperature
        let degreeLabel = this.getDegreeLabel()

        if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
            this.config.decimalSymbol = ".";
        }

        let tempCell = document.createElement("td");
        let tempVal = sensors.sensorValues.temperature
        if (this.config.units === "imperial") {
            tempVal = this.celsiusToFahren(tempVal)
        }
        tempCell.innerHTML = tempVal.toFixed(1).replace(".", this.config.decimalSymbol) + degreeLabel;
        if (sensors.sensorValues.temperature >= this.TemperatureLimit.min
            && sensors.sensorValues.temperature <= this.TemperatureLimit.max) {
            tempCell.className = "flora-cell flora-good-data flora-inner-cell-padding";
        }
        else {
            tempCell.className = "flora-cell flora-bad-data flora-inner-cell-padding";
        }
        row.appendChild(tempCell);

        let lightCell = document.createElement("td");
        let lightVal = (sensors.sensorValues.lux / 1000).toString()
        lightCell.innerHTML = lightVal.replace(".", this.config.decimalSymbol)
        // if ((sensors.sensorValues.lux / 1000) >= this.SunlightLimit.min
        //     && (sensors.sensorValues.lux / 1000)  <= this.SunlightLimit.max) {
        //     lightCell.className = "flora-cell flora-good-data";
        // }
        // else {
        //     lightCell.className = "flora-cell flora-bad-data";
        // }
        lightCell.className = "flora-cell flora-good-data flora-inner-cell-padding";
        row.appendChild(lightCell);

        let moistureCell = document.createElement("td");
        let moistureVal = sensors.sensorValues.moisture.toString()
        moistureCell.innerHTML = moistureVal.replace(".", this.config.decimalSymbol) + " %"
        if (sensors.sensorValues.moisture >= this.SoilMoistureLimit.min
            && sensors.sensorValues.moisture  <= this.SoilMoistureLimit.max) {
            moistureCell.className = "flora-cell flora-good-data flora-inner-cell-padding";
        }
        else {
            moistureCell.className = "flora-cell flora-bad-data flora-inner-cell-padding";
        }
        row.appendChild(moistureCell);

        let batteryCell = document.createElement("td");
        let batteryVal = sensors.firmwareInfo.battery.toString()
        batteryCell.innerHTML = batteryVal.replace(".", this.config.decimalSymbol) + " %"
        if (sensors.firmwareInfo.battery >= this.BatteryLimit.min
            && sensors.firmwareInfo.battery  <= this.BatteryLimit.max) {
            batteryCell.className = "flora-cell flora-good-data flora-inner-cell-padding";
        }
        else {
            batteryCell.className = "flora-cell flora-bad-data flora-inner-cell-padding";
        }
        row.appendChild(batteryCell);

        let timeCell = document.createElement("td");

        let timeDiff = this.getTimeDiffMin(sensors.timeStamp)
        // Log.info(`data time diff: ${timeDiff}`)
        if (timeDiff > this.config.maxMsgTimeDiff_min) {
            timeCell.innerHTML = `> ${this.config.maxMsgTimeDiff_min} min`
            timeCell.className = "flora-cell flora-bad-data flora-outer-cell-padding";
        } else {
            timeCell.innerHTML = `${timeDiff} min ago`
            timeCell.className = "flora-cell flora-good-data flora-outer-cell-padding";
        }
        row.appendChild(timeCell);

        this.addValueCommentRow(tableBody, sensors)
    },

    // Override dom generator.
    getDom: function () {
        // Log.log("updating dom")

        let wrapper = document.createElement("div");
        wrapper.className = "flora-wrapper"

        // Create Title
        let title = document.createElement("p");
        title.className = "flora-title";
        title.innerHTML = this.translate(this.config.titleText);
        wrapper.appendChild(title);

        let treeIcon = document.createElement("a");
        treeIcon.className = "fa fa-tree flora-title-icon"
        title.appendChild(treeIcon);


        if (this.sensorValues.length === 0) {
            let message = document.createElement("p");
            message.innerHTML = "No sensors found"
            wrapper.appendChild(message);

            return wrapper;
        }


        let table = document.createElement("table");
        table.className = this.config.tableClass + "flora-table small";

        this.addTableHeader(table)

        let tableBody = document.createElement('tbody');
        table.appendChild(tableBody)

        for (const sensor of this.sensorValues) {
            this.addValueRow(tableBody, sensor)
        }

        wrapper.appendChild(table);
        return wrapper;
    }

});