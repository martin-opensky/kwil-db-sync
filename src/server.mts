import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { resolve } from 'path';
import DbSync from './db-sync.mjs';

const protoPath = resolve('./proto/db-sync.proto');

const packageDefinition = loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// @ts-ignore
server.addService(protoDescriptor.DbSyncService.service, {
  Sync: (call: any, callback: Function) => {
    const { originalDbId, localProviderDbid, providerAddress } = call.request;

    const dbSync = new DbSync(originalDbId, localProviderDbid, providerAddress);

    dbSync.restore();

    const response = {
      status: 'ok',
    };

    callback(null, response);
  },
});

server.bindAsync(
  'dns:///kwil-db-sync:50061',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      throw err;
    }
    console.log(`Listening on ${port}`);
    server.start();
  }
);
