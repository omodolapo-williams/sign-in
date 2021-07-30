const express =   require ('express');
const session =   require('express-session')
const hbs     =    require('express-handlebars')
const mongoose =  require('mongoose')
const passport =   require('passport')
const localStrategy= require('passport-local').Strategy
const bcrypt = require('bcrypt')
const app  = express();
mongoose.connect("mongodb://localhost:27017/node-auth-yt",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//create database
const UserSchema = new mongoose.Schema({
  username: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string' ,
    required: true
  }
});
const User = mongoose.model('User', UserSchema)

//Middleware
app.engine('hbs', hbs({extname: '.hbs'}))

app.set('view engine', hbs)

//use items from a file(html or css), publicfolder allows it to be accessible to all
app.use(express.static(__dirname + '/public'))

//import session and add a secret key
app.use(session({
  secret: "verygoodsecret",
  resave: false,
  saveUnintitialized: true
}));

app.use(express.urlencoded({extended: false}))

//for testing
app.use(express.json());

//Always initialize the passport
app.use(passport.initialize())

//when we move from one page to another, we wants to be connected to the sessions.
app.use(passport.session())

//when we login, we serialize and unserialize our unserialize
passport.serializeUser(function(user, done){
  done(null, user.id);
})

passport.deserializeUser(function (id, done){
  //setup user module and connect to the username, when we want the user's details, we deserial it

  User.findById(id, function (err, user){
    done(err, user);
  })
})

// to login, it will use localstrategy, check username and password. If there's no user like that in the db, it will return incorrect username

  passport.use (new localStrategy(function (username, password, done){
    User.findOne({ username: username }, function (err, user){
      if (err) return done(err)
      if (!user) return done(null, false,{message: 'Incorrect username'})

      bcrypt.compare(password, user.password, function (err, res){
        if (err) return done(err)

        if( res===false) return done(null, false, {message: 'Incorrect password'})

        return done(null, user)
      })
  })
}))

// renders from a template from a view folder
app.get('/', (req, res) =>{
  res.render('index', {title: 'Home'})

})

app.listen(3000, () => {
  console.log("listening on port 3000")
})
