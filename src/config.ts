import BaseConfig from 'doge-config';

class ProxyConfig extends BaseConfig {
	constructor () {
		super('doge-proxy', {
			port: 21053,
		});
	}
}

export const config = new ProxyConfig;

export default config;
module.exports = config;
