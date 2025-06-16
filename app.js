const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
    res.send("home route is working");
})

//index route
app.get("/listings", async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
});

//new listing route

app.get("/listings/new", async (req,res)=>{
    res.render("./listings/new.ejs");
});

//edit route

app.get("/listings/:id/edit", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/edit.ejs", { listing });
});



//show route
app.get("/listings/:id", async (req,res)=>{
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing })
});

//update route

app.put("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body }, {new: true,  runValidators: true });
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing })
    
});

//create route

app.post("/listings", async(req, res)=>{
    const { title , description , image , price , location , country } = req.body;
    const newListing  = new Listing({ title , description , image, price , location , country });
    await newListing.save();
    
    res.redirect("/listings");
});

//Delete route

app.delete("/listings/:id", async(req,res)=>{
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})


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

app.listen(8080, ()=>{
    console.log("app is listening to port 8080");
})