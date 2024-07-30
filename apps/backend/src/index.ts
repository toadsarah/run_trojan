import express from 'express';
import v1Router from './router/v1';
import cors from 'cors';
import { initPassport } from './passport';
import authRoute from './router/auth';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import Web3 from 'web3';
import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk";
const ABI = require('./ABI.json');

const app = express();

const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',')
  : [];



app.use(
  cors({
    origin: allowedHosts,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  }),
);

const config = {
  apiKey: "jqsFXO1xwKNhPb4QUeOhoKyxADuCi3Wk",
  network: Network.ARB_SEPOLIA,
};
const alchemy = new Alchemy(config);

// ... existing code ...

const getNFTs = async (account: string) => {

  const nfts = await alchemy.nft.getNftsForOwner(account);

  console.log(nfts.totalCount);

  const userNFTs = nfts.totalCount

  return userNFTs;


}


app.post('/members', async (req, res) => {
  try {
    const account = req.body.owner;
    const numNFTs = await getNFTs(account); // Use await here

    if (numNFTs > 0) {
      res.status(200).json({ status: 200, numNFTs });
    } else {
      res.status(404).json({ status: 404, message: "You don't own any nft", numNFTs });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
});
// ... existing code ...





/*const web3 = new Web3('YOUR API KEY')
const contractAddress = '0xA9798C3EDE7616D25a541D40b339f43bc5aEc39B';
const contract = new web3.eth.Contract(ABI, contractAddress);
// console.log(contract)

const fetchNFTs = async (account: string) => {
  try {
    const nftBalance = await contract.methods.balanceOf('0x7Af7475Abe02a2e9CD03B0dc50EA534F84194e09').call();
    return { userNFTs: Number(nftBalance) }
  } catch (error) {
    console.log('Error fetching NFTs', error);
  }
}*/







dotenv.config();
app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  }),
);

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));


app.use('/auth', authRoute);
app.use('/v1', v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
