const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// session setup the packages
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash  = require('connect-flash');
const multer = require('multer');

const errorController = require('./controllers/error');
const User = require('./models/user');

const MONGODB_URI = 
  'mongodb+srv://naorzshop:pDZltX186oyJ7FzT@cluster0.s4da6f3.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0';
const dbUrl = 'mongodb://localhost:27017/shop';

const app = express();
// excute the MongoDBStore as constructor
const store = new MongoDBStore({
  uri: dbUrl,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
    // console.log(file);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
    // console.log("filterd true");
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

//serving statically
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(flash());

app.use((req,res,next)=>{
  res.locals.isAuthenticated= req.session.isLoggedIn;
  next();
})

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// app.use((error, req, res, next) => {
//   // res.status(error.httpStatusCode).render(...);
//   // res.redirect('/500');
//   res.status(500).render('500', {
//     pageTitle: 'Error!',
//     path: '/500',
//     isAuthenticated: req.session.isLoggedIn
//   });
// });

mongoose
  .connect(dbUrl
    // 'mongodb+srv://naorzshop:pDZltX186oyJ7FzT@cluster0.s4da6f3.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(result => {
    console.log("connected");
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
