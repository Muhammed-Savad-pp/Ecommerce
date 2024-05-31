
const User = require('../model/user_model')

const isLogin = async (req,res,next)=>{

     try {
        
        
        if(req.session.user_id){
            
            next()
        }else{
            res.redirect('/login')
        }

     } catch (error) {
         console.log(error.message)
     }

}


const isLogout = async(req,res,next)=>{


    try {
        
        if(req.session.user_id){
            res.redirect('/home')
        }
        next();

    } catch (error) {
        console.log(error.message)
    }


}

const checkStatus = async(req,res,next)=>{

    try {
        
        const userData = await User.findById(req.session.user_id);

        if(userData.is_blocked == false){
            next()
        }else{
            req.session.user_id = null
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    isLogin,
    isLogout,
    checkStatus
}