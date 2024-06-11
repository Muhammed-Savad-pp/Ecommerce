const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('./model/user_model')
require('dotenv').config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = 'http://zakio.online/auth/google/callback'

router.get('/auth/google', (req, res) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`
    res.redirect(url);
});


// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
    const { code } = req.query;
  
    try {
      // Exchange authorization code for access token
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      });
  
      const { access_token, id_token } = data;
  
      // Use access_token or id_token to fetch user profile
      const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      function generateRandomString(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        const charactersLength = characters.length;
        
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return result;
      }

      const exitcsUser = await User.findOne({email:profile.email})

      if(!exitcsUser){

        const user = new User({

            email:profile.email,
            name:profile.name,
            password:profile.id,
            is_blocked:false,
            referlCode:generateRandomString(6)
        })

        await user.save();
        
        req.session.user_id = user._id;

      }else{
        req.session.user_id = exitcsUser._id;
      }
  
      // Code to handle user authentication and retrieval using the profile data
      
  
      res.redirect('/');
    } catch (error) {
      console.error('Error:', error.message);
      res.redirect('/login');
    }
  });
  

  module.exports = router