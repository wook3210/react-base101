const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const saltRounds = 10;

const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name:{
        type:   String,
        maxlength:  50
    },
    email:{
        type:   String,
        trim:   true,
        unique: 1
    },
    password:{
        type:   String,
        minLength:5
    },
    lastname:{
        type:   String,
        maxlength:  50
    },
    role:{
        type:   Number,
        default:    0
    },    
    token:{
        type:   String
    },
    tokenExp:{
        type:   Number
    }
})

userSchema.pre('save', function(next){

    var user = this;

    if(user.isModified('password')){

        //비밀번호를 암호화 시킨다. 
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
            
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
            
        })
    }else{
        next();
    }

})

//
//We may also define our own custom document instance methods.
//https://mongoosejs.com/docs/guide.html#methods
userSchema.methods.comparePassword = function(plainPassword, cb){

    console.log("this.password: " + this.password )

    bcrypt.compare(plainPassword, this.password, function(err, isMatch){

        if(err) return cb(err);

        cb(null, isMatch);

    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;
console.log("user._id.toHexString() : " + user._id.toHexString())    
    var token = jwt.sign(user._id.toHexString() , 'secretToken');
    user.token = token;

    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

// 사용자 정의 매소드 추가하기의 또다른 방법 아래 링크
// 출처: https://mobicon.tistory.com/302 [Mobile Convergence]
//  Schema.prototype.method()
// The example above uses the Schema.methods object directly to save an instance method. You can also use the Schema.method()
// https://mongoosejs.com/docs/api.html#schema_Schema-method
// Schema.method() adds instance methods to the "Schema.methods object". You can also add instance methods directly to the Schema.methods object as seen in the
userSchema.method('generateTokenOfUserDate', function() {
    return crypto.createHash('md5').update(this.name + Date().toString()).digest("hex");
  });



userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰 디코딩 
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저 아이디를 이용해서 유저를 db에서 찾은 후 
        //클라이언트에서 가져온 token과 비교한다. 
        user.findOne({"_id": decoded, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })

    })
}

const User = mongoose.model('User', userSchema)

module.exports = {User}