const express = require('express');
const axios = require('axios');
const router = express.Router();

const APP_ID = '470968858795731'
const APP_SECRET = 'cb1b87b0defbcd7504dcda6f28f6dd67'
const REDIRECT_URI = 'http://localhost:3000/home/auth/facebook/callback'

router.get('/auth/facebook', (req, res) => {
    const url = `https://www.facebook.com/v13.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=email`
    console.log(url);
    res.redirect(url);
});

router.get('/auth/facebook/callback', async (req, res) => {
    
    const { code } = req.query;
  console.log('kasdf');
    try {
      // Exchange authorization code for access token
      const { data } = await axios.get(`https://graph.facebook.com/v13.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}&redirect_uri=${REDIRECT_URI}`);
      
      const { access_token } = data;
  
      // Use access_token to fetch user profile
      const { data: profile } = await axios.get(`https://graph.facebook.com/v13.0/me?fields=name,email&access_token=${access_token}`);
      
  
      // Code to handle user authentication and retrieval using the profile data
      console.log(profile,'asdfd');
  
      res.redirect('/home');
    } catch (error) {
      console.error('Error:', error.response.data.error);
      res.redirect('/login');
    }
});

module.exports = router;