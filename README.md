
# StockSplunk

Paper trading and investment calculator web app created by integrating Alpha Vantage Stock Data API with a MEAN stack. Utilizes a Redis cache to reduce third party API calls. This app is containerized using [Docker.](https://www.docker.com/products/docker-desktop/)

The frontend and backend are served through a [NGINX](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) reverse proxy.

Before running the app locally, an [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) is needed. Edit the .env file in the server folder and set ALPHA_KEY to your key.

To run the app locally on your machine, make sure you have Docker installed and running.

```
docker compose up -d
```

Then go to localhost on a browser from your machine.

# Demo

If you don't want to create an account for the live web app at [stocksplunk.com.](https://stocksplunk.com)

```
Email: user@demo.com
Password: demopassword
```
