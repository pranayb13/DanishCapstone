var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash")
    User        = require("./models/user"),
    session = require("express-session"),
    methodOverride = require("method-override"),
	router = express.Router(),
	MongoClient = require("mongodb").MongoClient,
	ipfsUpload = require("./routes/ipfs");


//requiring routes
var indexRoutes = require("./routes/index");
    
// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri = 'mongodb+srv://thealpheonix:theghostoftheuchiha@conf-mate.shxow.mongodb.net/test?retryWrites=true&w=majority' || 'mongodb://localhost/doc_verify'
mongoose.connect(databaseUri,{ useFindAndModify: false, useNewUrlParser: true ,useUnifiedTopology: true },function(err){
	if(err){
		console.log(err);
	}
	else{
		console.log("Successfully connected to database");
	}
});
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
//require moment
app.locals.moment = require('moment');
// seedDB(); //seed the database

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Hello, welcome to Doc-Verify",
    resave: false,
    saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


app.use("/show", indexRoutes);

app.get("/",function(req,res){
	res.render("front")
})

app.get("/login", function(req,res){
	res.render("login");
})

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: ("/profile"),
        failureRedirect: "/login" 
    }), function(req, res){
});

app.get("/profile", function(req, res) {
	if(req.isAuthenticated())
	{
		var user = req.user;
		if(user.usertype=='admin'){
			// res.render("admin", {user:user})
			res.redirect("/admin")
		}
		else{
			res.render("profile", {user:user})
		}
	}
	else
	{
		// req.flash("error", "You must be signed in to do that!");
		res.redirect("/login");
	}
});

app.get("/admin",ipfsUpload)
app.post("/uploadProfilePicture",ipfsUpload)

app.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "See you later!");
   res.redirect("/");
});

app.get("/signup",function(req,res){
	res.render("signup");
})


app.post("/signup",function(req,res){
	 var newUser = new User({username: req.body.username, email:req.body.email,usertype: req.body.usertype});
     User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("signup");
        }
		 res.redirect("/login");
    });
})


function isLoggedIn(req, res, next){
        if(req.isAuthenticated())
		{
            return 1;
        }
        // req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    };


app.listen(5000, function(){
   console.log("The Server Has Started!");
});