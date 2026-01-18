const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name:{
        required: true,
        type: String,
        validate:{
            validator:async function(theUser){
                const user = await mongoose.models.users.findOne({name : theUser});
                return !user;
            },
            message: 'the name already exists'
        }
    },
    email: {
        required: true,
        type: String,
        validate:[
        {
            validator: async function (eml){
                const email = await mongoose.models.users.findOne({email: eml});
                return !email;
            },
            message: 'the email already exists'
        },
        {
            validator: async function(emel){
                return emel.includes('@');
            },
            message: 'the email should include the "@"'
        }
    ]
    },
    password: {
        required: true,
        type: String,
        minLength:6,
        select: false //do not return password by default in queries
    }

},{timestamps:true});

//=======  MIDDLEWARE: hash password before saving ======

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }

    try{
        const salt = await bcrypt.genSalt(10);

        this.password = await bcrypt.hash(this.password,salt);

        next();
    }catch(error){
        next(error);
    }
});


// ========= Method: compare passwords =========

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
        return await bcrypt.compare(candidatePassword , this.password);
    }catch(error){
        throw error;
    }
};



const users = mongoose.model('users',userSchema);

module.exports = users