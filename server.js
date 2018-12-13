const child_process = require('child_process');
const {EventEmitter} = require('@osjs/event-emitter');
const PulseAudioClient = require('paclient');
const si = require('systeminformation');

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
		const pa = new PulseAudioClient();
		
    [
      'none',
      'all',
      'sink',
      'source',
      'sinkInput',
      'sourceOutput',
      'module',
      'client',
      'sampleCache',
      'global',
      'card'
    ].forEach(event => {
      const cb = (...args) => {
        console.log({
          name: event,
          arguments: args
        });
        core.broadcast('hw/audio/'+event,...args);
      };
      pa.on(event,cb);
    });
		
		pa.on('ready',() => {
		  pa.subscribe('all',err => {
		    if(err) throw err;
		  });
		  [
		    ['/hardware/audio/getCards',req => new Promise((resolve,reject) => {
		      pa.getCards((err,sink) => {
		        if(err) return reject(err);
		        resolve(sink);
		      });
		    }),'get'],
		    ['/hardware/audio/getClients',req => new Promise((resolve,reject) => {
		      pa.getClients((err,info) => {
		        if(err) return reject(err);
		        resolve(info);
		      });
		    }),'get'],
		    ['/hardware/audio/getModules',req => new Promise((resolve,reject) => {
		      pa.getModules((err,info) => {
		        if(err) return reject(err);
		        resolve(info);
		      });
		    }),'get'],
		    ['/hardware/audio/getSinks',req => new Promise((resolve,reject) => {
		      pa.getSinks((err,results) => {
		        if(err) return reject(err);
            let list = child_process.execSync('pactl list sinks').toString().split('\n');
            for(let i = 0;i < results.length;i++) {
              let start = list.indexOf('Sink #'+i);
              let lines = list.slice(start,list.indexOf('',start));
              for(let line of lines) {
                if(line.startsWith('\tVolume: ')) results[i].volume = parseInt(line.split('/')[1].split(' ').join('').replace('%',''));
              }
            }
		        resolve(results);
		      });
		    }),'get'],
		    ['/hardware/audio/getSinkInputByIndex/:index',req => new Promise((resolve,reject) => {
		      pa.getSinkInputByIndex(parseInt(req.params.index),(err,sink) => {
		        if(err) return reject(err);
		        resolve(sink);
		      });
		    }),'get'],
		    ['/hardware/audio/getSources',req => new Promise((resolve,reject) => {
		      pa.getSources((err,results) => {
		        if(err) return reject(err);
            let list = child_process.execSync('pactl list sources').toString().split('\n');
            for(let i = 0;i < results.length;i++) {
              let start = list.indexOf('Source #'+i);
              let lines = list.slice(start,list.indexOf('',start));
              for(let line of lines) {
                if(line.startsWith('\tVolume: ')) results[i].volume = parseInt(line.split('/')[1].split(' ').join('').replace('%',''));
              }
            }
		        resolve(results);
		      });
		    }),'get'],
		    ['/hardware/audio/getSourceOutputByIndex/:index',req => new Promise((resolve,reject) => {
		      pa.getSourceOutputByIndex(parseInt(req.params.index),(err,sink) => {
		        if(err) return reject(err);
		        resolve(sink);
		      });
		    }),'get'],
		    ['/hardware/audio/setSinkVolumes/:index',req => new Promise((resolve,reject) => {
		      resolve(child_process.execSync('pactl set-sink-volume '+req.params.index+' '+req.query.value));
		    }),'get'],
		    ['/hardware/audio/setSourceVolumes/:index',req => new Promise((resolve,reject) => {
		      resolve(child_process.execSync('pactl set-source-volume '+req.params.index+' '+req.query.value));
		    }),'get'],
		    ['/hardware/audio/setSinkMute/:index/:enable',req => new Promise((resolve,reject) => {
		      pa.setSinkMute(parseInt(req.params.index),req.params.enable == 'true',err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.enable == 'true' });
		      });
		    }),'get'],
		    ['/hardware/audio/setSourceMute/:index/:enable',req => new Promise((resolve,reject) => {
		      pa.setSinkMute(parseInt(req.params.index),req.params.enable == 'true',err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.enable == 'true' });
		      });
		    }),'get'],
		    ['/hardware/audio/setSinkSuspend/:index/:enable',req => new Promise((resolve,reject) => {
		      pa.setSinkSuspend(parseInt(req.params.index),req.params.enable == 'true',err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.enable == 'true' });
		      });
		    }),'get'],
		    ['/hardware/audio/setSourceSuspend/:index/:enable',req => new Promise((resolve,reject) => {
		      pa.setSourceSuspend(parseInt(req.params.index),req.params.enable == 'true',err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.enable == 'true' });
		      });
		    }),'get'],
		    ['/hardware/audio/setDefaultSinkByName/:name',req => new Promise((resolve,reject) => {
		      pa.setDefaultSinkByName(req.params.name,err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.name });
		      });
		    }),'get'],
		    ['/hardware/audio/setDefaultSourceByName/:name',req => new Promise((resolve,reject) => {
		      pa.setDefaultSourceByName(req.params.name,err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.name });
		      });
		    }),'get'],
		    ['/hardware/audio/killClientByIndex/:index',req => new Promise((resolve,reject) => {
		      pa.setSinkSuspend(parseInt(req.params.index),err => {
		        if(err) return reject(err);
		        resolve({ value: parseInt(req.params.index) });
		      });
		    }),'get'],
		    ['/hardware/audio/killSinkInputByIndex/:index',req => new Promise((resolve,reject) => {
		      pa.killSinkInputByIndex(parseInt(req.params.index),err => {
		        if(err) return reject(err);
		        resolve({ value: parseInt(req.params.index) });
		      });
		    }),'get'],
		    ['/hardware/audio/killSourceOutputByIndex/:index',req => new Promise((resolve,reject) => {
		      pa.killSourceOutputByIndex(parseInt(req.params.index),err => {
		        if(err) return reject(err);
		        resolve({ value: parseInt(req.params.index) });
		      });
		    }),'get'],
		    ['/hardware/audio/moveSinkInput/:index/:dest',req => new Promise((resolve,reject) => {
		      pa.moveSinkInput(parseInt(req.params.index),parseInt(req.params.dest),err => {
		        if(err) return reject(err);
		        resolve({ index: parseInt(req.params.index), dest: parseInt(req.params.dest) });
		      });
		    }),'get'],
		    ['/hardware/audio/moveSourceOutput/:index/:dest',req => new Promise((resolve,reject) => {
		      pa.moveSourceOutput(parseInt(req.params.index),parseInt(req.params.dest),err => {
		        if(err) return reject(err);
		        resolve({ index: parseInt(req.params.index), dest: parseInt(req.params.dest) });
		      });
		    }),'get'],
		    ['/hardware/audio/setSinkPort/:index/:name',req => new Promise((resolve,reject) => {
		      pa.setSinkPort(parseInt(req.params.index),req.params.name,err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.name });
		      });
		    }),'get'],
		    ['/hardware/audio/setSourcePort/:index/:name',req => new Promise((resolve,reject) => {
		      pa.setSourcePort(parseInt(req.params.index),req.params.name,err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.name });
		      });
		    }),'get'],
		    ['/hardware/audio/setCardProfile/:index/:name',req => new Promise((resolve,reject) => {
		      pa.setCardProfile(parseInt(req.params.index),req.params.name,err => {
		        if(err) return reject(err);
		        resolve({ value: req.params.name });
		      });
		    }),'get'],
		    ['/hardware/audio/updateClientProperties/:props/:mode',req => new Promise((resolve,reject) => {
		      pa.updateClientProperties(JSON.parse(props),req.params.mode,err => {
		        if(err) return reject(err);
		        resolve(JSON.parse(props));
		      });
		    }),'get'],
		    ['/hardware/audio/removeClientProperties/:props',req => new Promise((resolve,reject) => {
		      req.params.props = req.params.props.split(',');
		      for(let i = 0;i < req.params.props.length;i++) req.params.props[i] = parseInt(req.params.props[i]);
		      pa.removeClientProperties(req.params.props,err => {
		        if(err) return reject(err);
		        resolve(req.params.props);
		      });
		    }),'get'],
		    ['/hardware/audio/pactl',req => new Promise((resolve,reject) => {
		      let output = child_process.execSync('pactl '+req.query.cmd).toString();
		      let lines = output.split('\n');
		      resolve({ output, lines });
		    }),'get'],
		  
			  ['/hardware/battery/get',req => si.battery(),'get'],
			  
			  ['/hardware/cpu/get',req => si.cpu(),'get'],
			  ['/hardware/cpu/flags',req => si.cpuFlags(),'get'],
			  ['/hardware/cpu/speed',req => si.cpuCurrentspeed(),'get'],
			  ['/hardware/cpu/temp',req => si.cpuTemperature(),'get'],
			  
			  ['/hardware/graphics/get',req => si.graphics(),'get'],
			  
			  ['/hardware/net/connections',req => si.networkConnections(),'get'],
			  ['/hardware/net/interfaces',req => si.networkInterfaces(),'get'],
			  ['/hardware/net/getDefaultInterfaceName',req => si.networkInterfaceDefault(),'get'],
			  ['/hardware/net/stats/:iface',req => si.networkStats(req.params.iface),'get'],
			  
			  ['/hardware/mem/get',req => si.mem(),'get'],
			  ['/hardware/mem/layout',req => si.memLayout(),'get'],
			  
			  ['/hardware/storage/devices',req => si.blockDevices(),'get'],
			  ['/hardware/storage/fs',req => si.fsSize(),'get'],
			  ['/hardware/storage/layout',req => si.diskLayout(),'get'],
			  ['/hardware/storage/io',req => si.disksIO(),'get'],
			  ['/hardware/storage/stat',req => si.fsStats(),'get'],
			  
			  ['/hardware/sys/get',req => si.system(),'get'],
			  ['/hardware/sys/bios',req => si.bios(),'get'],
			  ['/hardware/sys/baseboard',req => si.baseboard(),'get']
      ].forEach(([endpoint,fn,method]) => {
        this.core.app[method](endpoint,(req,res) => {
          if(method == 'ws') {
            fn(req,res);
          } else {
            fn(req).then(data => {
              res.json(data);
            }).catch(err => {
              res.json({ type: 'error', stack: err.stack, name: err.name, message: err.message });
            });
          }
        });
		  });
		  
      this.core.singleton('hw',() => ({
		    audio: {
		      events: audioEvents,
          getCards: cb => new Promise((resolve,reject) => {
            pa.getCards((err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getClients: cb => new Promise((resolve,reject) => {
            pa.getClients((err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getModules: cb => new Promise((resolve,reject) => {
            pa.getModules((err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getSinks: cb => new Promise((resolve,reject) => {
            pa.getSinks((err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              let list = child_process.execSync('pactl list sinks').toString().split('\n');
              for(let i = 0;i < results.length;i++) {
                let start = list.indexOf('Sink #'+i);
                let lines = list.slice(start,list.indexOf('',start));
                for(let line of lines) {
                  if(line.startsWith('\tVolume: ')) results[i].volume = parseInt(line.split('/')[1].split(' ').join('').replace('%',''));
                }
              }
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getSinkInputByIndex: (index,cb) => new Promise((resolve,reject) => {
            pa.getSinkInputByIndex(index,(err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getSources: cb => new Promise((resolve,reject) => {
            pa.getSources((err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              let list = child_process.execSync('pactl list sources').toString().split('\n');
              for(let i = 0;i < results.length;i++) {
                let start = list.indexOf('Source #'+i);
                let lines = list.slice(start,list.indexOf('',start));
                for(let line of lines) {
                  if(line.startsWith('\tVolume: ')) results[i].volume = parseInt(line.split('/')[1].split(' ').join('').replace('%',''));
                }
              }
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          getSourceOutputByIndex: (index,cb) => new Promise((resolve,reject) => {
            pa.getSourceOutputByIndex(index,(err,results) => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(results) : cb(null,results);
            });
          }),
          setSinkVolumes: (index,volumes,cb) => new Promise((resolve,reject) => {
            pa.setSinkVolumes(index,volumes,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(volumes) : cb(null,volumes);
            });
          }),
          setSourceVolumes: (index,volumes,cb) => new Promise((resolve,reject) => {
            pa.setSourceVolumes(index,volumes,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(volumes) : cb(null,volumes);
            });
          }),
          setSinkMute: (index,enable,cb) => new Promise((resolve,reject) => {
            pa.setSinkMute(index,enable,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(enable) : cb(null,enable);
            });
          }),
          setSourceMute: (index,enable,cb) => new Promise((resolve,reject) => {
            pa.setSourceMute(index,enable,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(enable) : cb(null,enable);
            });
          }),
          setSinkSuspend: (index,enable,cb) => new Promise((resolve,reject) => {
            pa.setSinkSuspend(index,enable,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(enable) : cb(null,enable);
            });
          }),
          setSourceSuspend: (index,enable,cb) => new Promise((resolve,reject) => {
            pa.setSourceSuspend(index,enable,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(enable) : cb(null,enable);
            });
          }),
          setDefaultSinkByName: (name,cb) => new Promise((resolve,reject) => {
            pa.setDefaultSinkByName(name,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(name) : cb(null,enable);
            });
          }),
          setDefaultSourceByName: (name,cb) => new Promise((resolve,reject) => {
            pa.setDefaultSourceByName(name,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(name) : cb(null,name);
            });
          }),
          killClientByIndex: (index,cb) => new Promise((resolve,reject) => {
            pa.killClientByIndex(index,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(index) : cb(null,index);
            });
          }),
          killSinkInputByIndex: (index,cb) => new Promise((resolve,reject) => {
            pa.killSinkInputByIndex(index,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(index) : cb(null,index);
            });
          }),
          killSourceOutputByIndex: (index,cb) => new Promise((resolve,reject) => {
            pa.killSourceOutputByIndex(index,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(index) : cb(null,index);
            });
          }),
          moveSinkInput: (index,dest,cb) => new Promise((resolve,reject) => {
            pa.moveSinkInput(index,dest,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve({ index, dest }) : cb(null,{ index, dest });
            });
          }),
          moveSourceOutput: (index,dest,cb) => new Promise((resolve,reject) => {
            pa.moveSourceOutput(index,dest,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve({ index, dest }) : cb(null,{ index, dest });
            });
          }),
          setSinkPort: (index,name,cb) => new Promise((resolve,reject) => {
            pa.setSinkPort(index,name,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(name) : cb(null,name);
            });
          }),
          setSourcePort: (index,name,cb) => new Promise((resolve,reject) => {
            pa.setSourcePort(index,name,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(name) : cb(null,name);
            });
          }),
          setCardProfile: (index,name,cb) => new Promise((resolve,reject) => {
            pa.setCardProfile(index,name,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(name) : cb(null,name);
            });
          }),
          updateClientProperties: (props,mode,cb) => new Promise((resolve,reject) => {
            pa.updateClientProperties(props,mode,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(props) : cb(null,props);
            });
          }),
          removeClientProperties: (props,cb) => new Promise((resolve,reject) => {
            pa.removeClientProperties(props,err => {
              if(err) return cb == undefined ? reject(err) : cb(err);
              cb == undefined ? resolve(props) : cb(null,props);
            });
          }),
          pactl: (commands,cb) => new Promise((resolve,reject) => {
		        let output = child_process.execSync('pactl '+req.query.cmd).toString();
		        let lines = output.split('\n');
            cb == undefined ? resolve({ output, lines }) : cb(null,{ output, lines });
          })
		    },
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
		});
		pa.connect();
	}
	start() {}
	destroy() {}
}
module.exports = ServiceProvider;
