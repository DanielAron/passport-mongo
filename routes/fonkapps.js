var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//build the REST operations at the base for fonkapps
//this will be accessible from http://127.0.0.1:3000/fonkapps if the default route for / is left unchanged
router.route('/')
    //GET all fonkapps
    .get(isAuthenticated, function(req, res, next) {
        //retrieve all fonkapps from Monogo
        var userID = req.session.passport.user;
        mongoose.model('Fonkapp').find({
            user: userID
        }, function (err, fonkapps) {
            if (err) {
                return console.error(err);
            } else {
                //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                res.format({
                    //HTML response will render the index.jade file in the views/fonkapp folder. We are also setting "fonkapps" to be an accessible variable in our jade view
                    html: function(){
                        res.render('fonkapps/index', {
                            title: 'All my Fonkapps',
                            "fonkapps" : fonkapps
                        });
                    },
                    //JSON response will show all fonkapps in JSON format
                    json: function(){
                        res.json(infophotos);
                    }
                });
            }
        });
    })
    //POST a new fonkapp
    .post(isAuthenticated, function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var name = req.body.name;
        var category = req.body.category;
        var badge = req.body.badge;
        //var dob = req.body.dob;
        var company = req.body.company;
        var isloved = req.body.isloved;
        var userID = req.session.passport.user;
        //call the create function for our database
        mongoose.model('Fonkapp').create({
            name : name,
            category : category,
            badge : badge,
            //dob : dob,
            user: userID,
            isloved : isloved
        }, function (err, fonkapp) {
            if (err) {
                res.send("There was a problem adding the information to the database.");
            } else {
                //Fonkapp has been created
                console.log('POST creating new fonkapp: ' + fonkapp);
                res.format({
                    //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("fonkapps");
                        // And forward to success page
                        res.redirect("/fonkapps");
                    },
                    //JSON response will show the newly created fonkapp
                    json: function(){
                        res.json(fonkapp);
                    }
                });
            }
        })
    });


/* GET New Fonkapp page. */
router.get('/new', isAuthenticated, function(req, res) {
    res.render('fonkapps/new', { title: 'Add New Fonkapp' });
});


// route middleware to validate :id
router.param(isAuthenticated, 'id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Fonkapp').findById(id, function (err, fonkapp) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(fonkapp);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});


router.route('/:id')
    .get(isAuthenticated, function(req, res) {
        mongoose.model('Fonkapp').findById(req.params.id, function (err, fonkapp) {
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {
                console.log('GET Retrieving ID: ' + fonkapp._id);
                //var fonkappdob = fonkapp.dob.toISOString();
                //fonkappdob = fonkappdob.substring(0, fonkappdob.indexOf('T'))
                res.format({
                    html: function(){
                        res.render('fonkapps/show', {
                            //"fonkappdob" : fonkappdob,
                            "fonkapp" : fonkapp
                        });
                    },
                    json: function(){
                        res.json(fonkapp);
                    }
                });
            }
        });
    });

//GET the individual fonkapp by Mongo ID
router.get('/:id/edit', isAuthenticated,  function(req, res) {
    //search for the fonkapp within Mongo
    mongoose.model('Fonkapp').findById(req.params.id, function (err, fonkapp) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the fonkapp
            console.log('GET Retrieving ID: ' + fonkapp._id);
            //format the date properly for the value to show correctly in our edit form
            //var fonkappdob = fonkapp.dob.toISOString();
            //fonkappdob = fonkappdob.substring(0, fonkappdob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                    res.render('fonkapps/edit', {
                        title: 'Fonkapp' + fonkapp._id,
                        //"fonkappdob" : fonkapp,
                        "fonkapp" : fonkapp
                    });
                },
                //JSON response will return the JSON output
                json: function(){
                    res.json(fonkapp);
                }
            });
        }
    });
});

//PUT to update a fonkapp by ID
router.put('/:id/edit', isAuthenticated,  function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var category = req.body.category;
    var badge = req.body.badge;
    //var dob = req.body.dob;
    var company = req.body.company;
    var isloved = req.body.isloved;
    var userID = req.session.passport.user;

    //find the document by ID
    mongoose.model('Fonkapp').findById(req.params.id, function (err, fonkapp) {
        //update it
        fonkapp.update({
            name : name,
            category : category,
            badge : badge,
            //dob : dob,
            user: userID,
            isloved : isloved
        }, function (err, fonkappID) {
            if (err) {
                res.send("There was a problem updating the information to the database: " + err);
            }
            else {
                //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
                res.format({
                    html: function(){
                        res.redirect("/fonkapps/" + fonkapp._id);
                    },
                    //JSON responds showing the updated values
                    json: function(){
                        res.json(fonkapp);
                    }
                });
            }
        })
    });
});


//DELETE a Fonkapp by ID
router.delete('/:id/edit', isAuthenticated, function (req, res){
    //find blob by ID
    mongoose.model('Fonkapp').findById(req.params.id, function (err, fonkapp) {
        if (err) {
            return console.error(err);
        } else {
            //remove it from Mongo
            fonkapp.remove(function (err, fonkapp) {
                if (err) {
                    return console.error(err);
                } else {
                    //Returning success messages saying it was deleted
                    console.log('DELETE removing ID: ' + fonkapp._id);
                    res.format({
                        //HTML returns us back to the main page, or you can create a success page
                        html: function(){
                            res.redirect("/fonkapps");
                        },
                        //JSON returns the item with the message that is has been deleted
                        json: function(){
                            res.json({message : 'deleted',
                                item : fonkapp
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
