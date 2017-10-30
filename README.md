# winston-udp-transport

Transport for `winston` logger to write logs via UDP

# Usage 


``` javascript
import { UDPTransport } from 'winston-udp-transport';

...

const options = {
    host: <host>,
    port: <port>,
    node_name: <this_node_name>,
    appName: <your_app_name>,
    level: <minimum_logging_level>,
    ...
}

winston.add(UDPTransport, options);
transports.push(new UDPTransport(options));

```

# License

[MIT](https://opensource.org/licenses/MIT)
