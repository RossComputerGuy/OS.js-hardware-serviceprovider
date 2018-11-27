class ServiceProvider {
	constructor(core,options={}) {
		this.core = core;
		this.options = options;
	}
	provides() {
		return [
			"hw"
		];
	}
	async init() {
		const callbackWrapper = (promise,cb) => {
			const isError = result => result.type == "error";
			const valueWrapper = result => typeof(result.value) == "string" && Object.keys(result).length == 1 ? result.value : result;
			if(typeof(cb) == "function") {
				return promise
					.then(result => isError(result) ? cb(new Error.result.message) : cb(null,valueWrapper(result)))
					.catch(error => cb(error));
			}
			return promise.then(result => isError(result) ? Promise.reject(result.message) : valueWrapper(result));
		};
		const req = (name,cb) => {
			const promise = this.core.request(this.core.url("hardware/"+name),{},"json");
			return callbackWrapper(promise,cb);
		};
		this.core.singleton("hw",() => ({
			battery: { get: cb => req("battery/get",cb) },
			cpu: {
				get: cb => req("cpu/get",cb),
				flags: cb => req("cpu/flags",cb),
				speed: cb => req("cpu/speed",cb),
				temp: cb => req("cpu/temp",cb)
			},
			graphics: { get: cb => req("graphics/get",cb) },
			net: {
				connections: cb => req("net/connections",cb),
				interfaces: cb => req("net/interfaces",cb),
				getDefaultInterfaceName: cb => req("net/getDefaultInterfaceName",cb),
				stats: (iface,cb) => req("net/stats/"+iface,cb)
			},
			mem: { get: cb => req("mem/get",cb), get: cb => req("mem/layout",cb) },
			storage: {
				devices: cb => req("storage/devices",cb),
				fs: cb => req("storage/fs",cb),
				layout: cb => req("storage/layout",cb),
				io: cb => req("storage/io",cb),
				stat: cb => req("storage/stat",cb)
			},
			sys: { get: cb => req("sys/get",cb), bios: cb => req("sys/bios",cb), baseboard: cb => req("sys/baseboard",cb) }
		}));
	}
	start() {}
	destroy() {}
}
module.exports = ServiceProvider;
