/* Magic Mirror Config Sample
 *
 * By Michael Teeuw https://michaelteeuw.nl
 * MIT Licensed.
 *
 * For more information on how you can configure this file
 * See https://github.com/MichMich/MagicMirror#configuration
 *
 */

const UserConfig = {
  timeFormat: 12,
  units: "imperial",
}

var config = {
  address: "0.0.0.0", // Address to listen on, can be:
  // - "localhost", "127.0.0.1", "::1" to listen on loopback interface
  // - another specific IPv4/6 to listen on a specific interface
  // - "0.0.0.0", "::" to listen on any interface
  // Default, when address config is left out or empty, is "localhost"
  port: 8080,
  basePath: "/", // The URL path where MagicMirror is hosted. If you are using a Reverse proxy
  // you must set the sub path here. basePath must end with a /
  ipWhitelist: [], // Set [] to allow all IP addresses
  // or add a specific IPv4 of 192.168.1.5 :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
  // or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
  // ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

  useHttps: false, // Support HTTPS or not, default "false" will use HTTP
  httpsPrivateKey: "", // HTTPS private key path, only require when useHttps is true
  httpsCertificate: "", // HTTPS Certificate path, only require when useHttps is true

  language: "en",
  logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
  timeFormat: UserConfig.timeFormat,
  units: UserConfig.units,
  // serverOnly:  true/false/"local" ,
  // local for armv6l processors, default
  //   starts serveronly and then starts chrome browser
  // false, default for all NON-armv6l devices
  // true, force serveronly mode, because you want to.. no UI on this device

  modules: [{
    module: "alert",
  },
  // {
  //   module: "updatenotification",
  //   position: "top_bar"
  // },
  {
    module: "clock",
    position: "top_left"
  },
  {
    module: "weather",
    position: "top_right",
    config: {
      weatherProvider: 'openweathermap',
      locationID: '4168618',
      apiKey: "your-api-key",
      type: 'current',
      units: UserConfig.units,
      timeFormat: UserConfig.timeFormat,
      showHumidity: true,
    }
  },
  {
    module: "weather",
    position: "top_right",
    config: {
      weatherProvider: 'openweathermap',
      locationID: '4168618',
      apiKey: "your-api-key",
      type: 'forecast',
      units: UserConfig.units,
      timeFormat: UserConfig.timeFormat,
    }
  },
  {
    module: "MMM-Pollen",
    position: "top_right",
    header: "Pollen Forecast",
    config: {
      updateInterval: 3 * 60 * 60 * 1000, // every 3 hours
      zip_code: "33716"
    }
  },
  {
    module: "MMM-MoonPhase",
    position: "top_right",
    config: {
      updateInterval: 43200000,
      hemisphere: "N",
      resolution: "detailed",
      basicColor: "white",
      title: true,
      phase: true,
      x: 200,
      y: 200,
      alpha: 0.7
    }
  },
  {
    module: "MMM-miflora",
    position: "top_left",
    config: {
      units: UserConfig.units,
    }
  },
  {
    module: "MMM-Remote-Control",
    // uncomment the following line to show the URL of the remote control on the mirror
    position: "bottom_left",
    // you can hide this module afterwards from the remote control itself
    config: {
      customCommand: {}, // Optional, See "Using Custom Commands" below
      showModuleApiMenu: true, // Optional, Enable the Module Controls menu
      secureEndpoints: true, // Optional, See API/README.md
    }
  },
  {
    module: "MMM-page-indicator",
    position: "bottom_bar",
  },
  {
    module: 'MMM-pages',
    config: {
      modules:
        [
          ["weather"],
          ["MMM-Pollen", "MMM-MoonPhase", "MMM-miflora"]
        ],
      fixed:
        [
          "clock", "MMM-page-indicator", "MMM-Remote-Control"
        ],
      hiddenPages: {

      },
      rotationTime: 5000,
    }
  }
  ]
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") {
  module.exports = config;
}