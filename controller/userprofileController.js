const User = require('../model/user_model')
const Address = require('../model/address_model');
const bcrypt = require('bcrypt')


const securePassword = async (password)=>{
    try{
    
        const passwordHash = await bcrypt.hash(password,10)
         return passwordHash
    }

    catch (error){
        console.log(error.message);
    }

}

const LoadUserProfile = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        //console.log(userid);

        const userdata = await User.findOne({_id:userid})
        //console.log(userdata);

        res.render('userprofile',{userdata})

    } catch (error) {
        console.log(error.message);
    }


}

const updateUserProfile = async(req,res)=>{

    try {

        const userid = req.session.user_id
        const name = req.body.newname;
        const mobile = req.body.newMobile

        

        const userData = await User.findOneAndUpdate({_id:userid},{$set:{name:name,mobile:mobile}})

        if(userData){
            
            return res.status(200).json({ success: true });
            
        }
        
    } catch (error) {
        console.log(error.message);
    }

}

const updateUserPassword =async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const { oldPassword, newPassword } = req.body;
        //console.log(oldPassword,newPassword);

        const userdata = await User.findOne({_id:userid});

        


        const passwordmatch = await bcrypt.compare(oldPassword,userdata.password)

        if(oldPassword === newPassword){

            console.log('new pASSWORD Old password is same');
            return  res.status(404).json({success:false})
            

        }

        else if(passwordmatch){

            const spassword = await securePassword(newPassword);


 
            const updatepassword = await User.findOneAndUpdate({_id:userid},{$set:{password:spassword}})
            //console.log(updatepassword);
            return res.status(200).json({success:true})

        }else{
            return  res.status(404).json({success:false})
        }


    } catch (error) {
        console.log(error.message);
    }


}

const loadAddress = async(req,res)=>{

    try {

        const userid = req.session.user_id;
        
        const userdata = await User.findOne({_id:userid})
        const addressData = await Address.findOne({userId:userid})
         
        res.render('useraddress',{userdata:userdata,addressData:addressData})

    } catch (error) {
        console.log(error.message);
    }
}

const addAddressLoad = async(req,res)=>{

    try { 
        
        const userid = req.session.user_id
        const userdata = await User.findOne({_id:userid})
        res.render('addaddress',{userdata})

    } catch (error) {
        console.log(error.message);
    }

}

const addadress = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;

        const {name, city, district, state, country, mno, pincode} = req.body

        //console.log(name, city, district, state, country, mno, pincode);

        const address = await Address.findOne({userId:userid})

        if(address){

            address.address.push({
                name:name,
                    city:city,
                    district:district,
                    state:state,
                    country:country,
                    mobile:mno,
                    pincode:pincode
            })
             await address.save();
             res.redirect('/userAddress')

        }else{

            const address = new Address({

                userId:userid,
                address:[{
                    name:name,
                    city:city,
                    district:district,
                    state:state,
                    country:country,
                    mobile:mno,
                    pincode:pincode
                }]

            })

            await address.save()

            res.redirect('/userAddress')

        }


    } catch (error) {
        console.log(error.message);
    }

}

const deleteAddress = async(req,res)=>{

    try {
        
        const userid = req.session.user_id;
        const addressid = req.query.id 
        
        const updateaddress = await Address.findOneAndUpdate({userId:userid},{$pull:{address:{_id:addressid}}});

        if(updateaddress){
            res.json({success:true})
        }

    } catch (error) {
        console.log(error.message);
    }

}


const editaddressload = async(req,res)=>{

    try {
        
        const userid = req.session.user_id
        const userdata = await User.findOne({_id:userid})

        const addressid = req.query.id;
        const addressData = await Address.findOne({userId:userid,'address._id':addressid})
        
       
        if(addressData){

            const foundaddress =  addressData.address.find(addr => addr._id.toString() === addressid)

            

            if(foundaddress){

                res.render('editaddress',{userdata, address:foundaddress})
                
            }
        }
      

    } catch (error) {
        console.log(error.message);
    }
}


const updateaddress = async(req,res) =>{

    try {
        
        const {name, city, district, state, country, mno, pincode } = req.body;
        const userid = req.session.user_id;
        const addressid = req.body.id;
        

        const addressdata = await Address.findOne({userId:userid,'address._id':addressid})

        if(addressdata){

            const foundaddress = addressdata.address.find((addr)=> addr._id.toString() === addressid)

                if(foundaddress){
                    const updateAddress = await Address.findOneAndUpdate({userId:userid,address:foundaddress},

                     {$set:{
                            'address.$.name':name,
                            'address.$.city':city,
                            'address.$.district':district,
                            'address.$.state':state,
                            'address.$.country':country,
                            'address.$.mobile':mno,
                            'address.$.pincode':pincode
                        }},

                    {new:true})

                    if(updateAddress){
                        res.status(200).json({success:true})
                    }
                   
                    
                }else{
                    console.log('foundaddressnot getit');
                }
        }else{
            console.log('address data not get');
        }
        
        
        

    } catch (error) {
        console.log(error.message);
    }

}

const userlogout = async(req,res)=>{

    try {
        
        req.session.user_id = null;
        
        res.redirect('/home')

    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    LoadUserProfile,
    updateUserProfile,
    updateUserPassword,
    loadAddress,
    addAddressLoad,
    addadress,
    deleteAddress,
    editaddressload,
    updateaddress,
    userlogout
}