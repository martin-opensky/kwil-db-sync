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

const DbSyncService =
  grpc.loadPackageDefinition(packageDefinition).DbSyncService;

// @ts-ignore
const client = new DbSyncService(
  '127.0.0.1:50061',
  grpc.credentials.createInsecure()
);

client.Sync(
  {
    originalDbId: 'xd7e15fba3742a2911235d3f7183e6899691e10c873bbb51085bd64d8',
    localProviderDbId: 1691147560,
    providerAddress: 1691147560180,
  },
  (err, response) => {
    if (err) {
      throw err;
    }
    console.log(response);
  }
);
