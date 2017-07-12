const express = require('express');
const router = express.Router();
const models = require("./models/gabble.js");

const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

function authenticate(req, res){
  models.User.findOne({
    username: req.body.username,
    password: req.body.password
  }, function(err, user){
    if (err){
      console.log("error loggin in " + err);
    }
    if (!user) {
      console.log("couldn't find user");
    }
    console.log("logged in!");
    user.activeUser = req.body.username;
    user.save(function (err) {
     if (err) return console.log("error saving active user" + err)
     });
    req.session.authenticated = true;
    res.redirect('/');
  })
}

function checkAuthentication(req, res){
  if (req.session && req.session.authenticated){
    console.log("Login successful / authenticated");

    return models.Post.find().then(function(user, post){
    res.render('index', { gabble : user, post });

    })
  }
  else {
    console.log("Invalid login, redirecting to login");
    return res.redirect('/login');
  }
};


function savePost(req, res){

  console.log("submitted post in req.body is: " + req.body.post);

  let newPost = new models.Post({
    author: req.session.activeUser,
    post: req.body.post,
    dateTime: new Date,
    likes: []
  });
  newPost.save().then(function(err, newUser) {
    console.log("new post saved!");
    return res.redirect('/');
  }).catch(function(err){
    console.log("error saving post to db " + err)
  })

};


router.get('/', function(req, res) {
  checkAuthentication(req, res);
})

router.get('/post', function(req, res){
  res.render('post')
})

router.post('/post', function(req, res){
  savePost(req, res);
})


router.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/login');
})

router.get('/login', function(req, res) {
  res.render('login');
})

router.post('/login', function(req, res) {
  authenticate(req, res);
});

router.get('/signup', function(req, res){
  res.render('signup');
});


router.post('/signup', function(req, res) {

  let newUser = new models.User({
    username: req.body.username,
    password: req.body.password
  });
  newUser.save().then(function(err, newUser) {
    console.log("new user registered!")
    return res.redirect('/');
  }).catch(function(err){
    console.log("error registering user " + err);
  })
});

router.post('/likes', function (req, res){


})

router.post('/delete', function(req, res){

})


module.exports = router;
