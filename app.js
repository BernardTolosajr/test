const express = require('express');
const axios = require('axios').default;
const https = require('https');
const rsa = require('node-rsa');
const fs = require('fs');
const sha256 = require('js-sha256');

const app = express();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Read the key files
const public = fs.readFileSync('./keys/client_public_key_php_dotnet.pem', 'utf-8'); //Try public or private
const private = fs.readFileSync('./keys/client_private_key_php_dotnet.pem', 'utf-8'); //Try public or private

// console.log('private key', typeof private);
// console.log('public key', typeof public);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const agent = new https.Agent({
  rejectUnauthorized: false,
});

app.get('/', (req, res) => {
  res.status(200).send('Hello server is running').end();
});

// Auth API
app.get('/auth/:authId', (req, res) => {
  //Create signature here
  const HTTP_URI = '/v1/authorizations/applyToken';
  const HTTP_METHOD = 'POST';
  const CLIENT_ID = '2022030313304100083286';
  const REQUEST_TIME = new Date().toISOString();
  const HTTP_BODY = {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
  };

  const CONTENT_TO_BE_SIGNED = `${HTTP_METHOD} ${HTTP_URI} \n ${CLIENT_ID} ${REQUEST_TIME} ${JSON.stringify(HTTP_BODY)}`;
  console.log('CONTENT_TO_BE_SIGNED', CONTENT_TO_BE_SIGNED);

  const signature = sha256.hmac(public, CONTENT_TO_BE_SIGNED); // try public or pirvate
  const signatureToBase64 = Buffer.from(signature).toString('base64');

  console.log('signature', signature);
  console.log('signatureToBase64', signatureToBase64);

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Client-Id': '2022030313304100083286',
    'Request-Time': new Date().toISOString(),
    signature: `algorithm=RSA256,keyVersion=1,signature=${signatureToBase64}`,
  };

  let data = {
    referenceClientId: '2022030313304100083286',
    grantType: 'AUTHORIZATION_CODE',
    authCode: req.params.authId,
  };

  res.status(200).json({
    CONTENT_TO_BE_SIGNED,
    signature: signatureToBase64,
    data,
  });

  axios
    .post('pointwestmp-sit.com.ph/v1/oauths/applyToken', data, { headers })
    .then((response) => {
      console.log('response', response);
    })
    .catch((error) => {
      // console.log('error', error);
    });

  // console.log('headers', headers);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening to port 3000');
});
