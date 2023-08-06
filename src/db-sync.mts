import { NodeKwil, Utils } from 'kwil';
import { query } from './gql.mjs';
import fetch from 'node-fetch';
import { Signer, Wallet } from 'ethers';
import { CronJob } from 'cron';

type Tag = {
  name: string;
  value: string;
};

type Edge = {
  node: {
    id: string;
    signature: string;
    timestamp: number;
    tags: Tag[];
  };
};

type ResponseData = {
  transactions: {
    edges: Edge[];
  };
};

type ActionData = {
  name: string;
  value: string;
};

type ActionToSync = {
  id: string;
  timestamp: number;
  arweaveId: string;
  actionName: string;
  data: ActionData[];
};

export default class DbSync {
  originalDbId: string;
  localProviderDbid: string;
  providerAddress: string;
  kwil: NodeKwil;
  signer: Signer;
  lastActionTimestamp: number = 0;

  constructor(
    originalDbId: string,
    localProviderDbid: string,
    providerAddress: string
  ) {
    console.log('originalDbId', originalDbId);
    console.log('localProviderDbid', localProviderDbid);
    console.log('providerAddress', providerAddress);

    this.kwil = new NodeKwil({
      kwilProvider: process.env.KWIL_PROVIDER_URL as string,
    });

    this.signer = new Wallet(process.env.ADMIN_PRIVATE_KEY as string);
    const address = this.signer.getAddress();
    console.log('signer address', address);
    console.log('PK', process.env.ADMIN_PRIVATE_KEY);

    this.originalDbId = originalDbId;
    this.localProviderDbid = localProviderDbid;
    this.providerAddress = providerAddress;
  }

  async restore() {
    const timestampFrom = 0;
    const data: ResponseData = await query(this.originalDbId, timestampFrom);

    if (data && data.transactions && data.transactions.edges.length > 0) {
      await this.processResponse(data);
    } else {
      console.log('Restore: No transactions found');
    }

    // Start the sync cron
    await this.syncCron();
  }

  async syncCron() {
    console.log('syncCron: Starting CRON');

    const job = new CronJob('*/10 * * * * *', async () => {
      console.log(
        'You will see this message every 10 seconds',
        this.providerAddress
      );

      console.log('lastActionTimestamp', this.lastActionTimestamp);

      // TODO: Need to update lastTimestamp whenever transactions have been found
      const data: ResponseData = await query(
        this.originalDbId,
        this.lastActionTimestamp
      );

      if (data && data.transactions && data.transactions.edges.length > 0) {
        const excludeLocalActions = true;
        await this.processResponse(data, excludeLocalActions);
      } else {
        console.log('Cron: No transactions found');
      }
    });

    console.log('After job instantiation');
    job.start();
  }

  private async processResponse(
    data: ResponseData,
    excludeLocalActions: boolean = false
  ) {
    const actionsToExecute: ActionToSync[] = [];

    const actionData = data.transactions.edges.map((edge) => {
      const { node } = edge;
      return node;
    });

    for (const action of actionData) {
      const { id, tags, timestamp } = action;

      // Will set the lastActionTimestamp to the last action that was executed for when we run the cron again
      this.lastActionTimestamp = timestamp + 1;

      // tags['Provider-Address']
      const providerAddressTagIndex = tags.findIndex(
        (tag) => tag.name == 'Provider-Address'
      );
      const actionIdTagIndex = tags.findIndex((tag) => tag.name == 'Action-Id');
      // console.log('providerAddressTagIndex', providerAddressTagIndex);
      // console.log('actionIdTagIndex', actionIdTagIndex);

      // Skip this action if it was committed my the local provider
      // In case of Cron, we only want actions that other providers have executed
      if (
        excludeLocalActions &&
        tags[providerAddressTagIndex].value == this.providerAddress
      ) {
        console.log('Skipping local action', tags[actionIdTagIndex].value);
        continue;
      }

      const url = `https://arweave.net/${id}`;

      const response = await fetch(url);
      const content = await response.text();
      const json: ActionToSync = JSON.parse(content);

      json.id = tags[actionIdTagIndex].value;
      json.timestamp = timestamp;
      json.arweaveId = id;

      actionsToExecute.push(json);
    }

    if (actionsToExecute.length > 0) {
      await this.executeActions(actionsToExecute);
    }
  }

  private async executeActions(actionsToExecute: ActionToSync[]) {
    console.log(`Executing ${actionsToExecute.length} actions....`);
    let counter = 0;
    for (const action of actionsToExecute) {
      const { actionName, data } = action;

      const inputs = new Utils.ActionInput();

      for (const d of data) {
        const { name, value } = d;
        inputs.put(name, value);
      }

      try {
        const actionTx = await this.kwil
          .actionBuilder()
          .dbid(this.localProviderDbid)
          .name(actionName)
          .concat(inputs)
          .signer(this.signer)
          .buildTx();

        const actionResult = await this.kwil.broadcast(actionTx);

        if (actionResult.status === 200) {
          console.log('Action executed successfully', action.id);
          await this.saveToDbSyncHistory(action);
        }

        counter++;

        const progress = (counter / actionsToExecute.length) * 100;

        console.log(`Restoring ${progress.toFixed(2)}% complete`);
      } catch (e) {
        console.log('Kwil Error', e);
      }
    }
  }

  private async saveToDbSyncHistory(action: ActionToSync) {
    try {
      const inputs = new Utils.ActionInput()
        .put('$id', action.id)
        .put('$action_timestamp', action.timestamp)
        .put('$arweave_id', action.arweaveId)
        .put('$provider_address', this.providerAddress)
        .put('$executed_at', new Date().getTime());

      const actionTx = await this.kwil
        .actionBuilder()
        .dbid(this.localProviderDbid)
        .name('save_db_sync')
        .concat(inputs)
        .signer(this.signer)
        .buildTx();

      const actionResult = await this.kwil.broadcast(actionTx);

      if (actionResult.status === 200) {
        console.log('Saved to DB Sync History successfully', action.id);
      }
    } catch (e) {
      console.log('Kwil Error', e);
    }
  }
}
