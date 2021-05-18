let inc = 0;
let alp = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function enc (n: number) {
	let r = '';
	while (n) {
		let f = n & 31;
		r = alp[f] + r;
		n >>= 5;
	}
	return r;
}

export function dec (e: string) {
	let n = 0;
	for (const c of e) {
		n <<= 5;
		n += alp.indexOf(c);
	}
	return n;
}

export function uid () {
	const nid = inc++;
	return ({
		nid,
		uid: enc(nid),
	});
}

export default module.exports = {
	enc,
	dec,
	uid,
}
