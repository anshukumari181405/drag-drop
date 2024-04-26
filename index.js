const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

cloudinary.config({
    cloud_name: "ddzqkln93",
    api_key: "134179754639625",
    api_secret: "XBOklPz9WLRiHoRZRVxphrm9GcY"
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

const DATA_FILE = path.join(__dirname, 'imageData.json');
app.use(cors());

 function saveImageData(imageData){
    fs.readFile(DATA_FILE, (err, data) =>{
        if(err){
            console.log("Error reading files:", err);
            if(err.code === 'ENOENT'){
                fs.writeFile(DATA_FILE, JSON.stringify([imageData], null,2),err =>{
                    if(err){
                        console.log("Error writing new file:", err);
                    } else {
                        console.log("Successfully created and saved imageData.json with initial data");
                    }
                });
            }
        } else {
            try{
                const images = JSON.parse(data);
                images.push(imageData);
                fs.writeFile(DATA_FILE, JSON.stringify(images,null,2),err => {
                    if(err){
                        console.log("Error writing to file:", err);
                    } else {
                        console.log("Successfully updated imageData.json");
                    }
                });
            } catch(parseErr){
                console.log("Error parsing JSON data:", parseErr);
            }

        }
    
 });
}
app.get('/images',(req,res) => {
    fs.readFile(DATA_FILE,(err,data) => {
        if(err){
            console.error("Error reading file:",err);
            return res.status(500).send("Error reading file");
        }
        try{
            const imageData = JSON.parse(data);
            return res.status(200).json(imageData);
        } catch(parseErr){
            console.error("Error parsing JSON data:", parseErr);
            return res.status(500).send("Error parsing JSON data");
        }
    });
});

app.post('/upload', upload.single('image'), async(req,res) => {
    try{
        const result = await cloudinary.uploader.upload_stream({resource_type:'auto'},
    (error, result) => {
        if(error) return res.status(500).send("Upload failed");
        saveImageData({url:result.url,public_id:result.public_id});
        return res.status(200).json(result);
    }
    ).end(req.file.buffer);
    } catch(err){
        return res.status(500).send(err.message);
    }
});

app.listen(port,() =>{
    console.log(`server running on ${port}`);
})
