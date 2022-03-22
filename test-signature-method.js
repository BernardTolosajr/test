console.log('test');
const fs = require('fs');
const rsu = require('jsrsasign-util');
function getHeaderData(clientId, merchantId, urlString, privKey, authCode) {
  const rs = require('jsrsasign'); //sample rsa-js library, you can use other or if you have your own rsa library
  moment = require('moment'); //moment library

  const date = new Date();
  currentTimestamp = moment(date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  referenceMerchantOrderId = 'SAMPLE_REF_MERCHANT_MINI_PROGRAM_' + Math.floor(Math.random() * 10000);
  productCode = '51090000001432700001';
  requestUrlString = urlString.substr(urlString.indexOf('/v1'));
  let privateKeyStr = privKey;

  // const postData = {
  //   partnerId: merchantId,
  //   paymentRequestId: referenceMerchantOrderId,
  //   paymentOrderTitle: 'MP merchant',
  //   productCode: productCode,
  //   paymentAmount: {
  //     currency: 'PHP',
  //     value: '100',
  //   },
  //   paymentFactor: {
  //     isCashierPayment: true,
  //   },
  //   extraParams: {
  //     ORDER: {
  //       referenceOrderId: referenceMerchantOrderId,
  //       orderAmount: {
  //         currency: 'PHP',
  //         value: '10',
  //       },
  //     },
  //   },
  //   envInfo: {
  //     osType: 'IOS',
  //     terminalType: 'SYSTEM',
  //     extendInfo: '{"orderTerminalType":"MAP"}',
  //   },
  // };

  let postData = {
    // referenceClientId: clientId,
    // grantType: 'AUTHORIZATION_CODE',
    // authCode: authCode,
    // extendInfo: { "customerBelongsTo": "GCASH" },
    // customerBelongsTo: "GCASH"

    //part 2
    "referenceClientId": clientId,
    "grantType": "AUTHORIZATION_CODE",
    "authCode": authCode,
    // "extendInfo": "{\"customerBelongsTo\":\"GCASH\"}" //Returns invalid
    "extendInfo": { "customerBelongsTo": "GCASH" }, //Returns valid
  };

  const dataToSign = 'POST ' + requestUrlString + '\n' + clientId + '.' + currentTimestamp + '.' + JSON.stringify(postData);
  // const dataToSign = 'POST ' + requestUrlString + '\n' + clientId + '.' + currentTimestamp;
  console.log('Data to sign: ' + dataToSign);

  if (!privateKeyStr.startsWith('-----BEGIN PRIVATE KEY-----')) {
    privateKeyStr = '-----BEGIN PRIVATE KEY-----\n' + privateKeyStr + '\n-----END PRIVATE KEY-----';
  }
  // set RSA privateKey
  const rsaPrivateKey = rs.KEYUTIL.getKey(privateKeyStr, 'passwd');

  // initialize
  const sig = new rs.KJUR.crypto.Signature({ alg: 'SHA256withRSA' });

  // initialize for signature generation
  sig.init(rsaPrivateKey);
  sig.updateString(dataToSign);

  // calculate signature
  const sigValueHex = sig.sign();
  // console.log('sigValueHex---------------------------------------------------: \n' + sigValueHex);

  const hex2b64Signature = rs.hex2b64(sigValueHex);
  // console.log('hex2b64Signature------------------------------------------: \n' + hex2b64Signature);

  const encodedSignature = encodeURIComponent(hex2b64Signature);
  console.log('encodedSignature---------------------------------------------: \n' + encodedSignature);

  const headerData = {
    "content-type": "application/json; charset=UTF-8",
    "Client-Id": clientId,
    "Request-Time": currentTimestamp,
    "Signature": "algorithm=RSA256, keyVersion=2, signature=" + encodedSignature,
  };

  return headerData;
}
// var privateKey = rsu.readFile('./keys/client_private_key_php_dotnet.pem');
var testprivateKey = rsu.readFile('./test_keys/private_key.pem');
// const privateKey = fs.readFileSync('./keys/client_private_key_php_dotnet.pem', 'utf-8');
const data = getHeaderData(
  "2018103116394800000000",
  "217020000647885614522",
  "https://api-sit.saas.mynt.xyz/v1/authorizations/applyToken.htm",
  testprivateKey,
  "202203216mHXgGwy07W0886400079314"
);
console.log('headers', data);
