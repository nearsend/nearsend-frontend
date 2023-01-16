# Nearsend Frontend

Frontend code for [Nearsend]('https://nearsend.io/')

## Getting Started

First, install the dependencies:

```bash
npm i
```

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Service Fee

Nearsend Core required a small amount of service fee per address when you make a transaction. The service fee is calculated based on USD, for example, 0.1 equals 10 cents (0.1 USD).

Service fee may be adjusted by updating the ENV variable `VITE_SERVICE_FEE_USD_PER_ACCOUNT`, make sure that it matches the number on our Smart Contract as well