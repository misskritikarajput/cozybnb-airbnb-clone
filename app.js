const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");



//connect to DB

main()
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/cozyBnB');
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


//home route
app.get("/",(req,res)=>{
    console.log("home route is working");
    res.redirect("/listings");
})

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
}));

//new listing route

app.get("/listings/new", wrapAsync(async (req,res)=>{
    res.render("./listings/new.ejs");
}));

//edit route

app.get("/listings/:id/edit", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
}));



//show route
app.get("/listings/:id", wrapAsync(async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing })
}));

//update route

app.put("/listings/:id", validateListing, wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body }, {new: true,  runValidators: true });
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing })
    
}));

//create route

app.post("/listings", validateListing, wrapAsync(async(req, res, next)=>{
    const { title , description , image , price , location , country } = req.body;
    const newListing  = new Listing({ title , description , image, price , location , country });
    await newListing.save();
    
    res.redirect("/listings");
    
}));

//Delete route

app.delete("/listings/:id", wrapAsync(async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


/* app.get("/test", (req,res)=>{
    let sampleListing = new Listing({
        title: "My home",
        description: "By the beach",
        price: 1200,
        location: "Goa",
        Country: "India",
    })

    sampleListing.save().then(()=>{
        console.log("Saved Succesfully");
        res.send("Saved Succesfully");
    })
    .catch((err)=>{
        console.log(err);
    })
}) */
 
/* app.all("*", (req, res, next) => {
    try{
        next(new ExpressError(404, "Page not Found!"));
    } catch (err) {
        next(err);
    }
    
}); */

app.use((err, req, res, next)=>{
    let {status=500, message="Something went wrong"} = err;
    res.status(status).render("error.ejs",{ message });
    //res.status(status).send(message);
});

app.listen(8080, ()=>{
    console.log("app is listening to port 8080");
})
