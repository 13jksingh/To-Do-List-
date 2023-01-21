const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/to-do-list');

const toDoSchema = {
    name : String
}

const Item = mongoose.model("Item",toDoSchema);

const brush = new Item({
    name : "Brush Your teeth"
})
const bath = new Item({
    name : "Take bath"
})
const study = new Item({
    name : "Study well"
})

const listSchema = {
    name : String,
    items : [toDoSchema]
}

const List = mongoose.model("List",listSchema);

const defaultItems = [brush, bath, study];

const app = express();

app.set('view engine',"ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use("/list", express.static("public"));

app.get("/list/:customList",function(req,res){
    const customListName = req.params.customList;
    List.findOne({name:customListName},function(err,docs){
        if (!err){
            if (!docs){
                //create list 
                const list = new List({
                    name : customListName,
                    items : defaultItems
                });
                list.save(function(err){
                    if (err){
                        console.log(err)
                    }else{
                        console.log("saved")
                    }
                });
                res.redirect("/list/"+customListName);
            }else{
                // print 
                res.render('list', { kindOfDay: docs.name, listOfItems: docs.items });
            }
        }
    })
});

app.get("/", function (req, res) {
    Item.find({}, function (err, results) {
        if (results.length == 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Added")
                }
                res.redirect("/");
            });
        }else{
            res.render('list', { kindOfDay: "Today", listOfItems: results });
        }  
    });

});

app.post("/",function(req,res){
    var nextItem = req.body.nextItem;
    const newItem = new Item({
        name : nextItem
    });
    if (req.body.submit == "Today"){
        newItem.save(function(err){
            if (err){
                console.log(err);
            }else{
                console.log("Saved");
            }
        });
        res.redirect("/");
    }else{
        const nameUrl = req.body.submit;
        List.findOne({ name: nameUrl }, function (err, doc) {
            if (!err){
                if (doc){
                    doc.items.push(newItem);
                    doc.save(function(err){
                        if (err){
                            console.log(err);
                        }else{
                            console.log("saved at" , nameUrl);
                        }
                    });
                    res.redirect("/list/" + req.body.submit);
                }
            }
            
        })
    }
    
});



app.post("/delete",function(req,res){
    const listName = req.body.listName;
    const itemName = req.body.checkbox;
    if (listName=="Today"){
        Item.findByIdAndDelete(req.body.checkbox , function(err){
            if (err){
                console.log(err);
            }else{
                console.log("Deleted");
                res.redirect("/");
            }
        });
    }else{
        List.findOneAndUpdate({name : listName},{$pull : {items : {_id : itemName}}}, function(err){
            if (err){
                console.log(err);
            }else{
                console.log("Deleted");
            }
            
        });
        res.redirect("/list/"+listName);
    }
});

app.listen(3000,function(){
    console.log("Server Started");
});


