const express = require('express');
const axios = require('axios').default;

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Hello server is running').end();
});

app.get('/auth/:authId', (req, res) => {
  console.log(req.params);

  axios
    // .get('https://www.pointwestmp-sit.com.ph')
    .get('https://api.sampleapis.com/switch/games')
    .then(function (response) {
      // handle success
      // console.log(response.data);

      res.json({
        authCode: req.params.authId,
        games: response.data,
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Listening to port 3000');
});
