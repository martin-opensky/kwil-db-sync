import { request, gql } from 'graphql-request';

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

export const query = async (originalDbid: string, timestampFrom: number) => {
  const variables = {
    dbid: originalDbid,
    timestampFrom,
    timestampTo: new Date().getTime(),
  };

  console.log(timestampFrom, variables.timestampTo);

  if (!process.env.BUNDLR_NODE_URL) {
    throw new Error('BUNDLR_NODE_URL is not defined');
  }

  const data: Response = await request(
    `${process.env.BUNDLR_NODE_URL}/graphql`,
    document,
    variables
  );

  return data;
};
