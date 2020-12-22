// backend 시작점
const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',{
    useNewUrlParser:true, useUnifiedTopology:true, useCreateIndex: true , useFindAndModify:false
})  .then(()=>console.log('MongoDB Connected...'))
    .catch(err=>console.log(err))


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})