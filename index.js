// backend 시작점
const express = require('express')
const app = express()
const port = 5000

const config = require('./config/key')

const bodyParser = require('body-parser')
const cookiePaser = require('cookie-parser');
const {User} = require('./models/User')

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookiePaser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI,{
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true , useFindAndModify:false
})  .then(()=>console.log('MongoDB Connected...'))
    .catch(err=>console.log(err))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
      
app.get('/', (req, res) => {  res.send('Hello World!')})


app.post('/register', (req, res)=>{

    const user = new User(req.body)

    user.save((err, userInfo)=>{
        if(err) return res.json({success:false, err})
        return res.status(200).json({
            success:true
        })
    })
})

app.post('/login', (req, res)=> {
 
    const user = new User(req.body);

    //1. 요청된 email을 DB에서 검색 
    User.findOne({email: req.body.email}, (err, user) =>{
      if(!user){
        return res.json({
          loginSuccess: false,
          message: "No user"
        })
      }
      //2. password 체크
      user.comparePassword(req.body.password, (err, isMatch)=>{
        if(!isMatch)
          return res.json({loginSuccess:false, message:"password is wrong"});

      //3. token 생성
        user.generateToken((err, user) => {
          if(err) return res.status(400).send(err);

          // token을 저장한다.  into 쿠키 , 로컬스토리지,..
          res.cookie("x_auth", user.token)
             .status(200)
             .json({loginSuccess:true, userId:user._id})
        });
        
      });
    });
})
