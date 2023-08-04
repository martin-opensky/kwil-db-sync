import WebSocket from 'ws';

const ws = new WebSocket('ws://node2.bundlr.network/ws/transactions', {
  perMessageDeflate: true,
});

ws.on('error', console.error);

ws.on('open', function open() {
  ws.send('WS Open');
});

ws.on('message', function message(data) {
  console.log('NODE1 MESSAGE RECEIVED: %s', data);
});

// const json = JSON.parse(
//   '{"id":"qoiDYWEchpba5YB5KKxiittUHj7EH4oCAf4UBUEOEEE","owner":"xyTvKiCST8bAT6sxrgkLh8UCX2N1eKvawODuxwq4qOHIdDAZFU_3N2m59rkZ0E7m77GsJuf1I8u0oEJEbxAdT7uD2JTwoYEHauXSxyJYvF0RCcZOhl5P1PJwImd44SJYa_9My7L84D5KXB9SKs8_VThe7ZyOb5HSGLNvMIK6A8IJ4Hr_tg9GYm65CRmtcu18S9mhun8vgw2wi7Gw6oR6mc4vU1I-hrU66Fi7YlXwFieP6YSy01JqoLPhU84EunPQzXPouVSbXjgRU5kFVxtdRy4GK2fzEBFYsQwCQgFrySCrFKHV8AInu9jerfof_DxNKiXkBzlB8nc22CrYnvvio_BWyh-gN0hQHZT0gwMR-A7sbXNCQJfReaIZzX_jP6XoB82PnpzmL_j1mJ2lnv2Rn001flBAx9AYxtGXd9s07pA-FggTbEG3Y2UnlWW6l3EJ93E0IfxL0PqGEUlp217mxUHvmTw9fkGDWa8rT9RPmsTyji-kMFSefclw80cBm_iOsIEutGP4S3LDbP-ZVJWDeJOBQQpSgwbisl8qbjl2sMQLQihoG2TQyNbmLwfyq-XSULkXjUi1_6BH36wnDBLWBKF-bS2bLKcGtn3Vjet72lNHxJJilcj8vpauwJG0078S_lO5uGt6oicdGR6eh_NSn6_8za_tXg0G_fohz4Yb1z8","owner_address":"I-5rWUehEv-MjdK9gFw09RxfSLQX9DIHxG614Wf8qo0","signature":"j0F3ajL3MCNl5xv-j_5G623LL5S7GJJgQHNL4Z2eulGHnbCZ4isK4p3uTfC2hTiI6XWQAqx3d0O1T4dMe0euQnpwIt2hXxBwH5QUSbbgJFKHJxIZpZNDEPN9DjqrxxXlp1o_ldjIDYKtQAbrhjP27v48TY7uRXoxDTFBidkk870LIgK3IkQPvRVVWpBtvZftAgcPTDIxZkROpFYZBaknQjEo5567g4-qB4RanchRz83nfKFcEWKvbQetpNGYN1TxpoDvBylvwZbRuygnUNlsVB0R3642dYYnW0ZcErfVNixRVaHlSRuewSR3iNkhWSj6apP53W2-u29C6C4SS7ac868-3K3TZu0njpDB-jqT1OdhzNWa4hcquhlA29sZ0yyUQuiztZssGDYbdO1jyiXutwD4jke9S8D6QrkDwGbZEdGmYvLXJxTp0_EiU5Rutp7Nsk6bqY_YQEtR7kOQYa_R0So4r2uGgsodnpI31bD4vCyorjHvdVhXRDh7i7JI_QmNSqLSGSd2h-gdqebj4pvhx9N5vWHVn_ddZmFugUcXCaRkYNWJL7EKMm7fD11bfQQ__YOXaHDslThABk-n-FHcszzuW33BJCwGevylE5BYHyyICoiylcPIe3jjT6xZg320jLNs_wTCW3FV9BzGj5fJqdeJp4fdIsOCpF79q8yuoho","target":"","tags":[{"name":"dHlwZQ","value":"cmVkc3RvbmUtb3JhY2xlcw"},{"name":"dGltZXN0YW1w","value":"MTY5MTA3MzYzMA"},{"name":"ZGF0YVNlcnZpY2VJZA","value":"cmVkc3RvbmUtcHJpbWFyeS1wcm9k"},{"name":"c2lnbmVyQWRkcmVzcw","value":"MHg1MUNlMDRCZTRiM0UzMjU3MkM0RWM5MTM1MjIxZDA2OTFCYTdkMjAy"},{"name":"ZGF0YUZlZWRJZA","value":"X19fQUxMX0ZFRURTX19f"}],"data_size":4114}'
// );

// console.log(json.tags[0].value.toString('base64'));
