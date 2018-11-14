const Gdax = require('gdax');
const publicClient = new Gdax.PublicClient();
const key = 'your_api_key';
const secret = 'your_b64_secret';
const passphrase = 'your_passphrase';

const apiURI = 'https://api.pro.coinbase.com';
const sandboxURI = 'https://api-public.sandbox.pro.coinbase.com';

const authedClient = new Gdax.AuthenticatedClient(
  key,
  secret,
  passphrase,
  apiURI
);


//fetch account info
authedClient.getAccounts();
//response:
/**
 * [
 {
     "id": "71452118-efc7-4cc4-8780-a5e22d4baa53",
     "currency": "BTC",
     "balance": "0.0000000000000000",
     "available": "0.0000000000000000",
     "hold": "0.0000000000000000",
     "profile_id": "75da88c5-05bf-4f54-bc85-5c775bd68254"
 },
 {
     "id": "e316cb9a-0808-4fd7-8914-97829c1925de",
     "currency": "USD",
     "balance": "80.2301373066930000",
     "available": "79.2266348066930000",
     "hold": "1.0035025000000000",
     "profile_id": "75da88c5-05bf-4f54-bc85-5c775bd68254"
 }
 ]
 */

//ws
const websocket = new Gdax.WebsocketClient(
  ['BTC-USD', 'ETH-USD'],
  'wss://ws-feed-public.sandbox.pro.coinbase.com',
  {
    key: 'suchkey',
    secret: 'suchsecret',
    passphrase: 'muchpassphrase',
  },
  { channels: ['full', 'level2'] }
);

websocket.unsubscribe({ channels: ['full'] });

//ws get a price tick
websocket.subscribe({ product_ids: ['LTC-USD'], channels: ['ticker', 'user'] });

websocket.subscribe({
  channels: [
    {
      name: 'user',
      product_ids: ['ETH-USD'],
    },
  ],
});


//ticker:
/**
 * {
    "type": "ticker",
    "trade_id": 20153558,
    "sequence": 3262786978,
    "time": "2017-09-02T17:05:49.250000Z",
    "product_id": "BTC-USD",
    "price": "4388.01000000",
    "side": "buy", // Taker side
    "last_size": "0.03000000",
    "best_bid": "4388",
    "best_ask": "4388.01"
}
 * @type {{side: string, price: string, size: string, product_id: string}}
 */




//ws fills (account info change in binance)

//order
// Buy 1 LTC @ 75 USD
const params = {
  side: 'buy',
  price: '75.00', // USD
  size: '1', // LTC
  product_id: 'LTC-USD',
};
authedClient.placeOrder(params, callback);


//clear everything
authedClient.cancelAllOrders