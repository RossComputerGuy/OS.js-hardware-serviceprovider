const si = require("systeminformation");

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
		[
			["/hardware/battery/get",req => si.battery(),"get"],
			
			["/hardware/cpu/get",req => si.cpu(),"get"],
			["/hardware/cpu/flags",req => si.cpuFlags(),"get"],
			["/hardware/cpu/speed",req => si.cpuCurrentspeed(),"get"],
			["/hardware/cpu/temp",req => si.cpuTemperature(),"get"],
			
			["/hardware/graphics/get",req => si.graphics(),"get"],
			
			["/hardware/net/connections",req => si.networkConnections(),"get"],
			["/hardware/net/interfaces",req => si.networkInterfaces(),"get"],
			["/hardware/net/getDefaultInterfaceName",req => si.networkInterfaceDefault(),"get"],
			["/hardware/net/stats/:iface",req => si.networkStats(req.params.iface),"get"],
			
			["/hardware/mem/get",req => si.mem(),"get"],
			["/hardware/mem/layout",req => si.memLayout(),"get"],
			
			["/hardware/storage/devices",req => si.blockDevices(),"get"],
			["/hardware/storage/fs",req => si.fsSize(),"get"],
			["/hardware/storage/layout",req => si.diskLayout(),"get"],
			["/hardware/storage/io",req => si.disksIO(),"get"],
			["/hardware/storage/stat",req => si.fsStats(),"get"],
			
			["/hardware/sys/get",req => si.system(),"get"],
			["/hardware/sys/bios",req => si.bios(),"get"],
			["/hardware/sys/baseboard",req => si.baseboard(),"get"]
		].forEach(([endpoint,fn,method]) => {
			this.core.app[method](endpoint,(req,res) => {
		        fn(req).then(data => {
		        	if(typeof(data) == "string") data = { value: data };
		            res.json(data);
		        }).catch(err => {
		            res.json({ type: "error", stack: err.stack, name: err.name, message: err.message });
		        });
        	});
		});
		
		this.core.singleton("hw",() => ({
			battery: { get: si.battery },
			cpu: { get: si.cpu, flags: si.cpuFlags, speed: si.cpuCurrentspeed, temp: si.cpuTemperature },
			graphics: { get: si.graphics },
			net: {
				connections: si.networkConnections,
				interfaces: si.networkInterfaces,
				getDefaultInterfaceName: si.networkInterfaceDefault,
				stats: si.networkStats
			},
			mem: { get: si.mem, layout: si.memLayout },
			storage: { devices: si.blockDevices, fs: si.fsSize, layout: si.diskLayout, io: si.disksIO, stat: si.fsStats },
			sys: { get: si.system, bios: si.bios, baseboard: si.baseboard }
		}));
	}
	start() {}
	destroy() {}
}
module.exports = ServiceProvider;
