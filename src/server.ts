import grpc from '@grpc/grpc-js';
import { loadSync } from '@grpc/proto-loader';
import { resolve } from 'path';

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
    const { originalDbid, localProviderDbid, providerAddress } = call.request;

    console.log('originalDbid', originalDbid);
    console.log('localProviderDbid', localProviderDbid);
    console.log('providerAddress', providerAddress);

    const response = {
      status: 'ok',
    };

    callback(null, response);
  },
});

server.bindAsync(
  '127.0.0.1:50061',
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      throw err;
    }
    console.log(`Listening on ${port}`);
    server.start();
  }
);
