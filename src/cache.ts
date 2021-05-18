export interface CachedObject {
	nid: number;
	uid: string;
	uri: string;
	headers: Array<[string, string | number]>;
	hash: string;
}

export const nid_cache = new Map<number, CachedObject>();
export const uri_cache = new Map<string, CachedObject>();

export default module.exports = {
	nid: nid_cache,
	uri: uri_cache,
}
