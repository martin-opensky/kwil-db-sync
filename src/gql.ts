import { request, gql } from 'graphql-request';
import fetch from 'node-fetch';

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

type Response = {
  transactions: {
    edges: Edge[];
  };
};

const document = gql`
  query getDbTransactions(
    $dbid: String!
    $timestampFrom: BigInt
    $timestampTo: BigInt
  ) {
    transactions(
      timestamp: { from: $timestampFrom, to: $timestampTo }
      tags: [
        { name: "Application", values: ["KwilDb"] }
        { name: "DBID", values: [$dbid] }
        # {
        #   name: "Type",
        #   values: ["Export"],
        # }
      ]
      order: DESC
    ) {
      edges {
        node {
          id
          timestamp
          tags {
            name
            value
          }
        }
      }
    }
  }
`;

const variables = {
  dbid: `xd7e15fba3742a2911235d3f7183e6899691e10c873bbb51085bd64d8`,
  timestampFrom: 1691147560,
  timestampTo: 1691147560180,
};

const query = async () => {
  const data: Response = await request(
    'https://node2.bundlr.network/graphql',
    document,
    variables
  );

  if (data && data.transactions) {
    const actionData = data.transactions.edges.map((edge) => {
      const { node } = edge;
      return node;
    });

    for (const action of actionData) {
      const { id, tags } = action;

      const url = `https://arweave.net/${id}`;

      const response = await fetch(url);
      const content = await response.text();
      const json = JSON.parse(content);

      console.log(url, '\n\n', json.schema.owner, '\n\n\n\n\n');

      // TODO:

      // Type the JSON object for the action data
      // Once all actions have been saved to JSON, we can then execute them one by one
      // Verify the signature of the action is by someone who has permission to execute it (list of addresses for now)
      // Log when each action is being executed
      // Save successful actions to the db_sync_history table
      // Timestamps should also be saved.  When db_sync_history is null then we start from beginning of time
      // When db_sync_history is not null then we start from the last timestamp until now or now + 24 hours
    }
  }
};

query();
