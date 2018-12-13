const {EventEmitter} = require('@osjs/event-emitter');

class ServiceProvider {
	constructor(core,options={}) {
		this.core = core;
		this.options = options;
	}
	provides() {
		return [
			'hw'
		];
	}
	async init() {
		const callbackWrapper = (promise,cb) => {
			const isError = result => result.type == 'error';
			if(typeof(cb) == 'function') {
				return promise
					.then(result => isError(result) ? cb(new Error.result.message) : cb(null,typeof(result.value) == 'undefined' ? result : result.value))
					.catch(error => cb(error));
			}
			return promise.then(result => isError(result) ? Promise.reject(result.message) : typeof(result.value) == 'undefined' ? result : result.value);
		};
		const req = (name,cb) => {
			const promise = this.core.request(this.core.url('hardware/'+name),{},'json');
			return callbackWrapper(promise,cb);
		};
		const audioEvents = new EventEmitter();
		const audioEventsSocket = new WebSocket(window.location.protocol.replace('http','ws')+'/'+window.location.hostname+':'+window.location.port+this.core.url('/hardware/audio/events'));
		audioEventsSocket.onmessage = ev => audioEvents.emit(JSON.parse(ev.data).name,...JSON.parse(ev.data).arguments);
		this.core.singleton('hw',() => ({
		  audio: {
		    events: audioEvents,
		    getCards: cb => req('audio/getCards',cb),
		    getClients: cb => req('audio/getClients',cb),
		    getModules: cb => req('audio/getModules',cb),
		    getSinks: cb => req('audio/getSinks',cb),
		    getSinkInputByIndex: (index,cb) => req('audio/getSinkInputByIndex/'+index,cb),
		    getSources: cb => req('audio/getSources',cb),
		    getSourceOutputByIndex: (index,cb) => req('audio/getSourceOutputByIndex/'+index,cb),
		    setSinkVolumes: (index,vol,cb) => req('audio/setSinkVolumes/'+index+'?value='+vol,cb),
		    setSourceVolumes: (index,vol,cb) => req('audio/setSourceVolumes/'+index+'?value='+vol,cb),
		    setSinkMute: (index,enable,cb) => req('audio/setSinkMute/'+index+'/'+(enable ? 'true' : 'false'),cb),
		    setSourceMute: (index,enable,cb) => req('audio/setSourceMute/'+index+'/'+(enable ? 'true' : 'false'),cb),
		    setSinkSuspend: (index,enable,cb) => req('audio/setSinkSuspend/'+index+'/'+(enable ? 'true' : 'false'),cb),
		    setSourceSuspend: (index,enable,cb) => req('audio/setSourceSuspend/'+index+'/'+(enable ? 'true' : 'false'),cb),
		    setDefaultSinkByName: (name,cb) => req('audio/setDefaultSinkByName/'+name,cb),
		    setDefaultSourceByName: (name,cb) => req('audio/setDefaultSourceByName/'+name,cb),
		    killClientByIndex: (index,cb) => req('audio/killClientByIndex/'+index,cb),
		    killSinkInputByIndex: (index,cb) => req('audio/killSinkInputByIndex/'+index,cb),
		    killSourceOutputByIndex: (index,cb) => req('audio/killSourceOutputByIndex/'+index,cb),
		    moveSinkInput: (index,dest,cb) => req('audio/moveSinkInput/'+index+'/'+dest,cb),
		    moveSourceOutput: (index,dest,cb) => req('audio/moveSourceOutput/'+index+'/'+dest,cb),
		    setSinkPort: (index,name,cb) => req('audio/setSinkPort/'+index+'/'+name,cb),
		    setSourcePort: (index,name,cb) => req('audio/setSourcePort/'+index+'/'+name,cb),
		    setCardProfile: (index,name,cb) => req('audio/setCardProfile/'+index+'/'+name,cb),
		    updateClientProperties: (props,mode,cb) => req('audio/updateClientProperties/'+JSON.stringify(props)+'/'+mode,cb),
		    removeClientProperties: (props,mode,cb) => req('audio/updateClientProperties/'+props.join(','),cb),
		    subscribe: (events,cb) => req('audio/subscribe/'+(Array.isArray(events) ? events.join(',') : events),cb),
		    pactl: (commands,cb) => req('audio/pactl?cmd='+commands,cb)
		  },
		  battery: { get: cb => req('battery/get',cb) },
		  cpu: {
        get: cb => req('cpu/get',cb),
        flags: cb => req('cpu/flags',cb),
        speed: cb => req('cpu/speed',cb),
        temp: cb => req('cpu/temp',cb)
      },
      graphics: { get: cb => req('graphics/get',cb) },
      net: {
        connections: cb => req('net/connections',cb),
        interfaces: cb => req('net/interfaces',cb),
        getDefaultInterfaceName: cb => req('net/getDefaultInterfaceName',cb),
        stats: (iface,cb) => req('net/stats/'+iface,cb)
      },
      mem: { get: cb => req('mem/get',cb), get: cb => req('mem/layout',cb) },
      storage: {
        devices: cb => req('storage/devices',cb),
        fs: cb => req('storage/fs',cb),
        layout: cb => req('storage/layout',cb),
        io: cb => req('storage/io',cb),
        stat: cb => req('storage/stat',cb)
      },
      sys: { get: cb => req('sys/get',cb), bios: cb => req('sys/bios',cb), baseboard: cb => req('sys/baseboard',cb) }
    }));
	}
	start() {}
	destroy() {}
}
module.exports = ServiceProvider;
