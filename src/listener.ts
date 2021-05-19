import fetch from 'node-fetch';
import http from 'http';
import https from 'https';
import cache, { nid_cache } from './cache';
import uid from './uid';

export default function listener (req: http.IncomingMessage, res: http.ServerResponse) {
	let ba = Array<Buffer>();
	req.on('data', (chunk: Buffer) => ba.push(chunk));
	req.on('end', async () => {
		const rd = Buffer.concat(ba);
		try {
			if (rd.length === 0) {
				const nid = uid.dec(req.url?.replace(/[^a-z]/gi, '') || '');
				const obj = cache.nid.get(nid);
				if (obj) {
					return fetch(`https://proxy.dogehouse.eu/static/${obj.hash}`)
					.then(async cres => {
						const headers: { [ index: string ]: string | number | string[] } = {};
						for (const [ h, v ] of obj.headers) {
							headers[h.toLowerCase()] = v;
						}
						for (let [ h, v ] of cres.headers) {
							h = h.toLowerCase();
							if (v && h !== 'content-type') headers[h] = v;
						}
						for (let [ h, v ] of Object.entries(headers)) {
							h = h.toLowerCase();
							(!res.hasHeader(h))
							&& (h !== 'access-control-allow-origin')
							&& (h !== 'access-control-allow-methods')
							&& (h !== 'access-control-allow-headers')
							&& (h !== 'content-encoding')
							&& (h !== 'content-length')
							&& res.setHeader(h, v);
						}
						const content = await cres.buffer();
						res.write(content);
						return res.end();
					});
				} else {
					res.statusCode = 404;
					res.write(JSON.stringify({
						error: 'Object not in cache.',
					}));
					return res.end();
				}
			}
			const {
				type,
				uri,
			} = JSON.parse(rd.toString());
			if ((typeof type !== 'string') || (typeof uri !== 'string')) {
				res.write(JSON.stringify({
					error: 'Invalid URI or type',
				}));
				return res.end();
			}
			if (cache.uri.has(uri)) {
				const cached = cache.uri.get(uri);
				if (cached?.uid) {
					res.write(JSON.stringify({
						error: null,
						success: true,
						descriptor: cached,
					}));
					return res.end();
				}
			}
			return fetch(uri)
			.then(async response => {
				let headers = [ ...response.headers ];
				const blob = await response.buffer();
				if (blob.length > 1 << 24) {
					res.write({
						error: 'Image too large.',
					});
					return res.end();
				}
				return await fetch('https://proxy.dogehouse.eu/static/push', {
					method: 'PUT',
					body: blob,
				}).then(async response => {
					const hash = await response.text();
					if (hash.length !== 64) {
						res.write(JSON.stringify({
							error: 'Internal error.',
						}));
						return res.end();
					}
					const storage_object = {
						...uid.uid(),
						uri,
						headers,
						hash,
					}
					cache.nid.set(storage_object.nid, storage_object);
					cache.uri.set(uri, storage_object);
					res.write(JSON.stringify({
						error: null,
						success: true,
						descriptor: storage_object,
					}));
					res.end();
				})
			})
			.catch((error) => {
				res.write(JSON.stringify({
					error: 'Invalid URI.',
				}));
				return res.end();
			});
		} catch (error) {
			res.write(JSON.stringify({
				error: 'Invalid JSON.',
			}));
			return res.end();
		}
	});
}
