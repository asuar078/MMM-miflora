from miflora.miflora_poller import (
    MI_BATTERY,
    MI_CONDUCTIVITY,
    MI_LIGHT,
    MI_MOISTURE,
    MI_TEMPERATURE,
    MiFloraPoller,
)
from miflora.miflora_scanner import scan
from btlewrap.bluepy import BluepyBackend
import json
import sys


def print_to_stdout(*a):
    # Here a is the array holding the objects
    # passed as the argument of the function
    print(*a, file=sys.stdout)


def print_to_stderr(*a):
    # Here a is the array holding the objects
    # passed as the argument of the function
    print(*a, file=sys.stderr)


# [ { address: 'c4:7c:8d:6b:ca:9e',
#     firmwareInfo: { battery: 100, firmware: '3.2.4' },
#     sensorValues: { temperature: 22.4, lux: 230, moisture: 0, fertility: 0 },
#     friendlyName: 'lavender',
#     timeStamp: 1614954202204 } ]

def main():
    try:
        scan_result = scan(BluepyBackend)
        # print(scan_result)
        sensors = []

        for mac in scan_result:
            poller = MiFloraPoller(mac, BluepyBackend, cache_timeout=60)
            temp = poller.parameter_value(MI_TEMPERATURE)
            moisture = poller.parameter_value(MI_MOISTURE)
            light = poller.parameter_value(MI_LIGHT)
            fer = poller.parameter_value(MI_CONDUCTIVITY)
            battery = poller.parameter_value(MI_BATTERY)
            firmware = poller.firmware_version()
            # print(f'temp: {temp}, moisture: {moisture}, light: {light}, battery: {battery}')
            miflora_sensor = {
                'address': mac,
                'firmwareInfo': {'battery': battery, 'firmware': firmware},
                'sensorValues': {'temperature': temp, 'lux': light, 'moisture': moisture, 'fertility': fer},
            }

            sensors.append(miflora_sensor)

        print_to_stdout(json.dumps(sensors))

    except Exception as error:
        print_to_stderr(error)


if __name__ == '__main__':
    main()
