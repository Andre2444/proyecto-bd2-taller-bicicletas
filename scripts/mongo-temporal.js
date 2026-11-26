import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { existsSync } from 'node:fs';
import path from 'node:path';

// En este PC aprovechamos MongoDB instalado. En otros equipos se descarga una vez.
export function iniciarMongoTemporal() {
  const binary = { version: '7.0.14', downloadDir: '.local/mongodb-binaries' };
  const instalado = path.join(process.env.ProgramFiles || '', 'MongoDB/Server/9.0/bin/mongod.exe');
  if (process.platform === 'win32' && existsSync(instalado)) binary.systemBinary = instalado;
  return MongoMemoryReplSet.create({
    binary,
    replSet: { count: 1, configSettings: { electionTimeoutMillis: 5000 } },
  });
}
