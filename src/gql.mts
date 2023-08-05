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
        { name: "Original-DBID", values: [$dbid] }
        { name: "Type", values: ["Action-Sync"] }
      ]
      order: ASC
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

export const query = async (originalDbId: string, timestampFrom: number) => {
  const variables = {
    dbid: originalDbId,
    timestampFrom,
    timestampTo: new Date().getTime(),
  };

  console.log(timestampFrom, variables.timestampTo);

  const data: Response = await request(
    'https://node2.bundlr.network/graphql',
    document,
    variables
  );

  return data;
};
