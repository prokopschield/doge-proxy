import http from 'http';
import config from './config';
import listener from './listener';

const server = http.createServer(listener);
server.listen(config.__getNumber('port'));

// forward complaints to the void
process.on('uncaughtException', () => {});
