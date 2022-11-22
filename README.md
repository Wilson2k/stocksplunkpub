
# StockSplunk

Stock simulator web app created by integrating Alpha Vantage Stock Data API with a MEAN stack.

To run server tests and the app on your machine, make sure you have MongoDB installed and a local MongoDB server running on your machine on port 27017. See [here](https://www.mongodb.com/docs/manual/installation/) for how to install and run MongoDB on your machine.

Before running the app locally, an [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) is needed. Edit the .env file in the server folder and set ALPHA_KEY to your key.

To run the app locally on your machine.
```
npm start
```
To test backend and frontend
```
npm test
```
To test frontend
```
cd client
npm test
```
To test backend
```
cd server
npm test
```