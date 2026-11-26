import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import newman from 'newman';
import { MongoClient } from 'mongodb';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const repl=await MongoMemoryReplSet.create({replSet:{count:1},binary:{version:'7.0.14',downloadDir:'.local/mongodb-binaries'}});
const client=new MongoClient(repl.getUri());
await client.connect();
const child=spawn('java',['-jar','target/taller-bicicletas-1.0.0.jar'],{env:{...process.env,MONGODB_URI:repl.getUri(),MONGODB_DB:'spring_smoke',PORT:'3101'},stdio:['ignore','pipe','pipe']});
let logs=''; child.stdout.on('data',x=>logs+=x.toString('latin1')); child.stderr.on('data',x=>logs+=x.toString('latin1'));
try {
  let ready=false; for(let i=0;i<50;i++){if(child.exitCode!==null)break;try{let r=await fetch('http://127.0.0.1:3101/api/salud');if(r.ok&&logs.includes('(cliente):')){ready=true;break}}catch{} await new Promise(r=>setTimeout(r,1000));}
  if(!ready) throw new Error('Spring Boot no inició. '+logs.slice(-4000).replace(/[a-f0-9]{64}/g,'[token oculto]'));
  const values=[]; for(const role of ['coordinador','tecnico','cliente']) {const line=logs.split(/\r?\n/).find(s=>s.includes('Token inicial')&&s.includes(role+'):'));const vals=line?.match(/([a-f0-9]{64}) \| ID: ([a-f0-9]{24})/);if(!vals)throw new Error('No se detectó token inicial del rol '+role);values.push({key:role+'Id',value:vals[2],enabled:true},{key:role+'Token',value:vals[1],enabled:true});}
  values.push({key:'baseUrl',value:'http://127.0.0.1:3101/api',enabled:true});
  const collections=await client.db('spring_smoke').listCollections().toArray();
  if(collections.length!==8||collections.some(c=>!c.options.validator?.$jsonSchema))throw new Error('Spring Boot no instaló los ocho esquemas');
  for(const name of ['citas','ordenesServicio']){const indexes=await client.db('spring_smoke').collection(name).indexes();if(!indexes.some(i=>i.unique&&i.partialFilterExpression))throw new Error('Falta índice único parcial: '+name);}
  const collection=JSON.parse(await readFile('postman/BD2.postman_collection.json','utf8'));
  const runner=newman.run({collection,environment:{values},reporters:'cli'});
  const summary=await new Promise((resolve,reject)=>runner.on('done',(err,result)=>err?reject(err):resolve(result)));
  const evidence={generadoEn:new Date().toISOString(),herramienta:'Newman contra Spring Boot y MongoDB replica set temporal',estadisticas:summary.run.stats,errores:summary.run.failures.map(f=>({caso:f.source?.name,mensaje:f.error?.message}))};
  await mkdir('docs/evidencias',{recursive:true});
  await writeFile('docs/evidencias/resultados-spring-postman.json',JSON.stringify(evidence,null,2));
  console.log(`Spring Newman: ${summary.run.stats.requests.total} solicitudes, ${summary.run.stats.assertions.total} aserciones, ${summary.run.failures.length} fallos.`);
  if(summary.run.failures.length){for(const line of logs.split(/\r?\n/).filter(line=>line.includes('Error interno de API:')))console.error(line);}
  if(summary.run.failures.length)process.exitCode=1;
} finally { if(child.exitCode===null){child.kill();await new Promise(resolve=>child.once('exit',resolve));} await client.close(); await repl.stop(); }

