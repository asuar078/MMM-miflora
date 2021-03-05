Module.register("MMM-miflora", {
    // Default module config.
    defaults: {
        updateInterval: 30, // Seconds
        titleText: "Plant Life",
        units: "metric",
        tableClass: "small",
        decimalSymbol: ".",
    },

    start: function () {
        Log.info("Starting module: " + this.name);

        // this.sensorValues = []
        this.sensorValues = [
            {
                address: 'c4:7c:8d:6b:ca:9e',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 100, firmware: '3.2.4'},
                sensorValues: {temperature: 22.4, lux: 230, moisture: 0, fertility: 0},
                friendlyName: 'lavender',
                timeStamp: 1614954202204
            },
            {
                address: 'c4:7c:8d:3c:cb:73',
                type: 'MiFloraMonitor',
                firmwareInfo: {battery: 95, firmware: '3.2.4'},
                sensorValues: {temperature: 27.4, lux: 700, moisture: 20, fertility: 10},
                friendlyName: 'c4:7c:8d:3c:cb:73',
                timeStamp: 1614954202204
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
        this.sendSocketNotification('DATA_REQUEST', this.config);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'DATA_RESPONSE') {
            Log.info(`Data response ${payload.sensorValues.length}`)
            Log.info(payload)

            if (payload.sensorValues.length === 0) {
                return;
            }

            for (const sensors of payload.sensorValues) {
                let index = this.sensorValues.findIndex((entry) => entry.address.toLowerCase() === sensors.address.toLowerCase())
                if (index === -1) {
                    Log.info("adding new sensor")
                    this.sensorValues.push(sensors)
                } else {
                    Log.info("replacing values")
                    this.sensorValues[index] = sensors
                }
            }
            // this.sensorValues = payload;
            this.updateDom()
        }
    },

    getStyles: function () {
        return ['MMM-miflora.css'];
    },

    // Override dom generator.
    getDom: function () {
        let wrapper = document.createElement("div");
        wrapper.className = "flora-wrapper"

        // Create Title
        let title = document.createElement("p");
        title.className = "flora-title";
        title.innerHTML = this.translate(this.config.titleText);
        wrapper.appendChild(title);

        let treeIcon = document.createElement("a");
        treeIcon.className = 'fa fa-tree flora-title-icon'
        title.appendChild(treeIcon);

        if (this.sensorValues.length === 0) {
            let message = document.createElement("p");
            message.innerHTML = "No sensors found"
            wrapper.appendChild(message);

            return wrapper;
        }


        let table = document.createElement("table");
        table.className = this.config.tableClass + " flora-table";

        let tableHeader = document.createElement(("thead"))
        table.appendChild(tableHeader)

        // create row with titles
        let titleRow = document.createElement("tr");
        titleRow.className = "flora-row"
        tableHeader.appendChild(titleRow)

        let nameCell = document.createElement("td");
        nameCell.className = "flora-name flora-icon";
        nameCell.innerHTML = "Name"
        titleRow.appendChild(nameCell);

        // add temp icon
        let tempIconCell = document.createElement("td");
        tempIconCell.className = "flora-icon";
        titleRow.appendChild(tempIconCell);

        let tempIcon = document.createElement("span");
        tempIcon.className = 'fa fa-temperature-high'
        tempIconCell.appendChild(tempIcon);

        // add light icon
        let lightIconCell = document.createElement("td");
        lightIconCell.className = "flora-icon ";
        titleRow.appendChild(lightIconCell);

        let lightIcon = document.createElement("span");
        lightIcon.className = 'fa fa-sun-o'
        lightIconCell.appendChild(lightIcon);

        // add moisture icon
        let moistureIconCell = document.createElement("td");
        moistureIconCell.className = "flora-icon ";
        titleRow.appendChild(moistureIconCell);

        let moistureIcon = document.createElement("span");
        moistureIcon.className = 'fa fa-tint'
        moistureIconCell.appendChild(moistureIcon);

        // add moisture icon
        let batteryIconCell = document.createElement("td");
        batteryIconCell.className = "flora-icon ";
        titleRow.appendChild(batteryIconCell);

        let batteryIcon = document.createElement("span");
        batteryIcon.className = 'fa fa-battery-full'
        batteryIconCell.appendChild(batteryIcon);

        let tableBody = document.createElement('tbody');
        table.appendChild(tableBody)

        for (const sensors of this.sensorValues){
            // create row
            let row = document.createElement("tr");
            row.className = "flora-row"
            tableBody.appendChild(row);

            // add name
            let nameCell = document.createElement("td");
            nameCell.className = "flora-name flora-cell";
            nameCell.innerHTML = sensors.friendlyName
            row.appendChild(nameCell);

            // add temperature
            let degreeLabel = "";
            if (this.config.units === "metric" || this.config.units === "imperial") {
                degreeLabel += "°";
            }
            if (this.config.scale) {
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
            if (this.config.decimalSymbol === "" || this.config.decimalSymbol === " ") {
                this.config.decimalSymbol = ".";
            }

            let tempCell = document.createElement("td");
            let tempVal = sensors.sensorValues.temperature.toString()
            tempCell.innerHTML = tempVal.replace(".", this.config.decimalSymbol) + degreeLabel;
            tempCell.className = "flora-cell";
            row.appendChild(tempCell);

            let lightCell = document.createElement("td");
            let lightVal = sensors.sensorValues.lux.toString()
            lightCell.innerHTML = lightVal .replace(".", this.config.decimalSymbol)
            lightCell.className = "flora-cell";
            row.appendChild(lightCell);

            let moistureCell = document.createElement("td");
            let moistureVal = sensors.sensorValues.moisture.toString()
            moistureCell.innerHTML = moistureVal .replace(".", this.config.decimalSymbol) + " %"
            moistureCell.className = "flora-cell";
            row.appendChild(moistureCell);

            let batteryCell = document.createElement("td");
            let batteryVal = sensors.firmwareInfo.battery.toString()
            batteryCell.innerHTML = batteryVal .replace(".", this.config.decimalSymbol) + " %"
            batteryCell.className = "flora-cell";
            row.appendChild(batteryCell);
        }

        wrapper.appendChild(table);
        return wrapper;
    }

});