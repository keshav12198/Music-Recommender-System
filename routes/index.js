var express = require('express');
var router = express.Router();
var recom = require('./recommender');
var passport = require('passport');
var SpotifyStrategy = require('../node_modules/passport-spotify/lib/passport-spotify/index').Strategy;
var path = require('path');
var request = require('request');
var User = require('../model/user');

var appKey = '2d83504ec3574492af1a333a3c5c99e4';
var appSecret = '1b1b12366ee34881ac01557fd7e988a4';


passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


passport.use(new SpotifyStrategy({
        clientID: appKey,
        clientSecret: appSecret,
        // callbackURL: 'http://spotify-avi.us-3.evennode.com/callback'
        callbackURL: 'http://localhost:3000/callback'
    },
        function (accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...

        process.nextTick(function () {
            console.log("Profile")
            
            return done(null, profile, {accessToken: accessToken, refreshToken: refreshToken});
        });

    }));

router.post("/addRecord", function(req, res){
    var user = new User({
        timestamp: req.body.timestamp,
        id : req.body.id,
        setting : req.body.setting,
        duration: req.body.duration,
        rating: req.body.rating,
        likedTime: req.body.likedTime,
        lowSortingTime: req.body.lowSortingTime,
        lowRemovingTime: req.body.lowRemovingTime,
        lowRatingTimes: req.body.lowRatingTime,
        middleDraggingTime: req.body.middleDraggingTime,
        middleLoadMoreTime: req.body.middleLoadMoreTime,
        highSliderTime: req.body.highSliderTime,
        highSortingTime: req.body.highSortingTime,
        detailTime:req.body.detailTime
    });
    console.log(req.body)
    user.save(function (err) {
        if (err)
            res.send(err);
        res.json({message: "user profile is updated"})
    })
});


router.get("/getRecord", function(req, res){
    User.find({},function (err, user) {
        if (err)
            res.send(err);
        else{
            res.send(user)
        }
    })
});



router.get('/logout',function (req,res) {
    res.render('logout')
})




router.get('/s8',function (req,res) {
    res.render('s8',{ data: req.user})
})

router.get('/login',function (req,res) {
    res.render('login')
})


/*
 route for web API
 */

router.get('/getArtist',function (req,res) {
    var result = {}
    recom(req.query.token).getTopArtists().then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getTrack',function (req,res) {
    var result = {}
    recom(req.query.token).getTopTracks().then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getGenre',function (req,res) {
    var result = {}
    recom(req.query.token).getTopGenres().then(function (data) {
        result.items = data;
        res.json(result)})
})


router.get('/getRecom',function (req,res) {
    var result = {}
    recom(req.query.token).getRecommendation(req.query.limit,req.query.artistSeed,req.query.trackSeed,req.query.genreSeed,req.query.min_danceability, req.query.max_danceability,
        req.query.min_energy, req.query.max_energy, req.query.min_instrumentalness, req.query.max_instrumentalness, req.query.min_liveness, req.query.max_liveness,
        req.query.min_speechiness, req.query.max_speechiness, req.query.min_valence, req.query.max_valence).then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getRecomByArtist',function (req,res) {
    var result = {}
    recom(req.query.token).getRecommendationByArtist(req.query.limit,req.query.seed,req.query.min_danceability, req.query.max_danceability,
        req.query.min_energy, req.query.max_energy, req.query.min_instrumentalness, req.query.max_instrumentalness, req.query.min_liveness, req.query.max_liveness,
        req.query.min_speechiness, req.query.max_speechiness, req.query.min_valence, req.query.max_valence).then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getRecomByTrack',function (req,res) {
    var result = {}
    recom(req.query.token).getRecommendationByTrack(req.query.limit,req.query.seed,req.query.min_danceability, req.query.max_danceability,
        req.query.min_energy, req.query.max_energy, req.query.min_instrumentalness, req.query.max_instrumentalness, req.query.min_liveness, req.query.max_liveness,
        req.query.min_speechiness, req.query.max_speechiness, req.query.min_valence, req.query.max_valence).then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getRecomByGenre',function (req,res) {
    var result = {}
    recom(req.query.token).getRecommendationByGenre(req.query.limit,req.query.seed,req.query.min_danceability, req.query.max_danceability,
        req.query.min_energy, req.query.max_energy, req.query.min_instrumentalness, req.query.max_instrumentalness, req.query.min_liveness, req.query.max_liveness,
        req.query.min_speechiness, req.query.max_speechiness, req.query.min_valence, req.query.max_valence).then(function (data) {
        result.items = data;
        res.json(result)})
})

router.get('/getRecomByFollowSimilar',function (req,res) {
    var result = {}
    recom(req.query.token).getArtistRelatedArtists(req.query.id).then(function (data) {
        var selectedRelated = data.slice(0,5);
        result.similar = selectedRelated
        return selectedRelated
    }).then(function (data) {
        recom(req.query.token).getRecommendationByFollowedArtist(data,'US').then(function (data) {
            result.items = data
            res.json(result)
        })
    })
})

router.get('/getAccount',function (req,res) {
    recom(req.query.token).getRecommendationByGenre().then(function (data) {
        res.json(data)})
})


router.get('/initiate', function (req, res) {
    //pass token to the webAPI used by recommender

    var reqData = {};

    var getTopArtists =
        recom(req.query.token).getTopArtists(50).then(function (data) {
            reqData.artist = data;
        });


    var getTracks =
        recom(req.query.token).getTopTracks(50).then(function (data) {
            reqData.track = data
        });


    var getGenres =
        recom(req.query.token).getTopGenres().then(function (data) {
            reqData.genre = data
        });

    Promise.all([getTopArtists, getTracks, getGenres]).then(function () {
        res.json({
            seed: reqData
        })
    })

});



router.get('/auth/spotify',
    passport.authenticate('spotify', {
        scope: ['user-read-email', 'user-read-private', 'user-top-read'],
        showDialog: true
    }),
    function (req, res) {
        
    });


router.get('/callback',
    passport.authenticate('spotify', {failureRedirect: '/'}),
    function (req, res) {

        res.cookie('spotify-token', req.authInfo.accessToken, {
            maxAge: 3600000
        });

        res.cookie('refresh-token', req.authInfo.refreshToken, {
            maxAge: 3600000
        });
        res.redirect('/s8');

    });


router.get('/refresh-token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(appKey + ':' + appSecret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            var refresh_token = body.refresh_token;
            res.json({
                'access_token': access_token,
                'refresh_token': refresh_token
            });
        }
    });
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect("/logout")
});


module.exports = router;
