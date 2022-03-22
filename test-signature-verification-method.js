function verifySignatureData() {
  const rs = require('jsrsasign');
  // let publicKey =
  //   'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvGjBwHB60UqSUZ/jlOafx/+nzY2h3SbGJAY0/ennkzgJEEZF6zIiah2xls1Ap6kcLaHJvnebHTbHlMpydPNDcbMTg68kYfj3DeseFNW8oCsWxb3qUdk6/zbFpTkf+svfyWzmXakvpaI76rQ0X0vUxymTW+YMg3kfEaizUJI+TdCUbS0woQlf9zQ7rVL+wMt/xcmTHt+WjDzf6tP4JW0SjKvQ57Fsrs+xh6zFGVapzurjd+qnIjntm9ARfNoh/2m1Q16soulb4tiFyO/Mf7JC8HtNMehNz1A4Mw9PH9V3DB1nF3DvFqGuyPKafIgchxaCw0xvaQgI843Fk9zTxAFnGwIDAQAB'; // Real pub

  let publicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgo22hZx9N2EXHh8ZspL/iHYcuL1tSdQ974nTkJHRlKRWNzyQqO6TSYouY+nA0y/WD2Pz2wwKwTDBFW82DNekYgFeKZ2bCrsG3Twi7tn3DbfFGKzXfBzXYv6sggL/1Ej2/ABzMVWIaAo8t9Wo5A+/12nOLQIwxsHXZTUrbCJeZYUAfRQFLyIp2/PxVeVd0bLhtEAAj8aJq8RlSlPYdUIgk+CJ+WVdUs7rhMd09MArgAFwB3iRPbBS4gf7QEswRaBDQ3fTJIYE6xTr53geuv9MAO6B2x0Qt0ctmrdGtjLdsoq2KWmlPXo/GS6uJadwQ+xR9JbudS4eZYKNYTf6zGsvVwIDAQAB" // sample pub

  const encodedSignature =
    'SvksvEFcrQRZV0KKxSXG41Z6QSaQ2yDlEanKqKc6RbZf0REW6AshThdvr4e%2F9%2FCgGLC9vOiUi6sFVPvE%2BiabINSwrckUefzzLDN7RUeSrooEzc1N0A6QgyFKLEqR%2Fq0sYWPWS4dVnb6Ibj1VoH5L%2BzgjBs4BK2nnxe9j2UKqiUtWa9mtAHgp5R%2FCogstxh6ZyQZM9YoZZt9ERaGE4NaJQySiry0AyXL4KdIVGN383AlDVDJ6TblEf%2BSc3k7W3wE0i3MlHqCArbW46stojaUTaXTS9VLxcTned1RQ7lhSffspJhDvNBDnbtFcfxGIfm%2FKAcIpO8XdtaFz0zL2%2BsUdMA%3D%3D';

  //   const signData =
  //     'POST /v1/payments/notifyPayment\n2020112612565700010165.2020-12-10T17:13:37+08:00.{"paymentId":"20201210121212800110170479200347226","paymentRequestId":"f5c95d45f97802f45775","partnerId":"217020000646283818110","paymentTime":"2020-12-10T17:13:37+08:00","paymentAmount":{"currency":"PHP","value":"100"},"paymentStatus":"SUCCESS"}';

  const signData =
    'POST /v1/authorizations/applyToken.htm\n2018103116394800000000.2022-03-21T11:32:32.770+08:00.{"referenceClientId":"2018103116394800000000","grantType":"AUTHORIZATION_CODE","authCode":"202203216mHXgGwy07W0886400079314","extendInfo":{"customerBelongsTo":"GCASH"}}';
  // Signature Verification
  const decodedSignature = decodeURIComponent(encodedSignature);
  console.log('decodedSignature: ' + decodedSignature);

  const sigValueHex = rs.b64tohex(decodedSignature);
  console.log('sigValueHex: ' + sigValueHex);

  if (!publicKey.startsWith('-----BEGIN PUBLIC KEY-----')) {
    publicKey = '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';
  }

  // Set RSA publicKey
  const rsaPublicKey = rs.KEYUTIL.getKey(publicKey, 'passwd');

  // Initialize
  const sig = new rs.KJUR.crypto.Signature({ alg: 'SHA256withRSA', prov: 'cryptojs/jsrsa' });
  sig.init(rsaPublicKey);
  sig.updateString(signData);
  let sigIsValid = sig.verify(sigValueHex);

  // Verification result
  console.log('Is Verification Valid: ' + sigIsValid);
}

verifySignatureData();
