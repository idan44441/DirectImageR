const _express = require('express');
const _multer = require('multer');
const _app = _express();
const _path = require('path');
const _destination = "assets";
const db = require("./config1");
//const app = require("./aws/index");

require("./node_modules/dotenv/lib/main").config();

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const fileUrlDetails = '';

aws.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
    // Note: 'bucket' is not a valid AWS SDK configuration property
});

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_NAME_photographe = process.env.BUCKET_NAME_photographer
const s3 = new aws.S3();

const upload1 = multer({
    storage: multerS3({
        s3: s3,
        bucket: BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          key: function (req, file, cb) {
            // cb(null, Date.now().toString())
            cb(null, file.originalname)
          }
    })
});



_app.use('/public', _express.static('public')); // Assuming 'styles.css' is in the 'public' directory
_app.use(_express.json());

const diskStorage = _multer.diskStorage({
    destination: _destination,
    filename:(req,file,cb)=>{
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().replace(/[-:.]/g, '').replace('T', '_').slice(0, -5); // Format date as YYYYMMDD_HHMMSS
        const randomString = Math.random().toString(36).substring(7); // Generate a random string to avoid filename collisions
        const fileName = `IMG_${formattedDate}_${randomString}${_path.extname(file.originalname)}`;
        return cb(null, fileName);
    }
});

const upload = _multer({
    storage:diskStorage,
    limits:{fileSize:2000000000}
})
_app.post("/check", (req, resp) => {
    const phoneNumber = req.body.phoneNumber;
    const fileUrl = req.body.fileUrl;

    // Check if the phone number already exists
    db.query(
        "SELECT * FROM users WHERE user_email = ?",
        [phoneNumber],
        (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                return resp.status(500).send("Internal server error");
            }

            // If phone number exists, return a response indicating it
            if (result.length > 0) {
                return resp.status(400).json({ error: "Phone number already exists" });
            }

            // Proceed with insertion if phone number does not exist
            db.query(
                "INSERT INTO `users` (`user_email`, `user_img_path`) VALUES (?, ?)",
                [phoneNumber, fileUrl],
                (err, result) => {
                    if (err) {
                        console.error("Error executing SQL query:", err);
                        return resp.status(500).send("Internal server error");
                    }

                    resp.json({
                        success: true
                    });
                }
            );
        }
    );
});

_app.post("/updateuserimage", (req, resp) => {
    const phoneNumber = req.body.phoneNumber;
    const fileUrl = req.body.fileUrl;

    // Parameterized query to avoid SQL injection
    const query = "UPDATE users SET user_img_path = ? WHERE user_email = ?";
    const values = [fileUrl, phoneNumber];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error("Error executing SQL query:", err);
            return resp.status(500).send("Internal server error");
        }

        // Check if any rows were affected
        if (result.affectedRows === 0) {
            return resp.status(404).send("User not found");
        }

        resp.json({
            success: true
        });
    });
});



_app.post("/deleteusers", (req, resp) => {
    db.query(
        "delete from users",
        (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                return resp.status(500).send("Internal server error");
            }
            else
            {
                resp.send("delete succsess");
            }
        }
    );
});


_app.get('/checkss', (req, resp) => {
    if (err) {
        console.error("Error executing SQL query:", err);
        resp.status(500).send("Internal server error");
    } else {
        resp.send("idan");
    }

});


_app.get('/checks', (req, resp) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            console.error('Error executing SQL query:', err);
            resp.status(500).send('Internal server error');
        } else {
            resp.json(fileUrlDetails); // Use resp.json to send JSON response
        }
    });
});


_app.post("/phoneExist", async (req, res) => {
    try {
        // Assuming you are passing the phone number in the request body
        const phoneNumber1 = req.body.phoneNumber;
        console.log(phoneNumber1);

        // Using parameterized query to prevent SQL injection
        db.query(`SELECT * FROM users WHERE user_email = '${phoneNumber1}'`, (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                res.status(500).send("Internal server error");
            } else {    
                // Checking if any user exists with the given phone number
                if (result.length > 0) {
                    res.json({
                        phoneNumberExists: 1  // Changed to reflect phone number check
                    });
                } else {
                    res.json({
                        phoneNumberExists: 0  // Changed to reflect phone number check
                    });
                }
            }
        });


    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Internal server error");
    }
});




_app.post("/userImage", async (req, res) => {
    try {
        // Assuming you are passing the phone number in the request body
        const phoneNumber1 = req.body.usermail;
        console.log(phoneNumber1);

        // Using parameterized query to prevent SQL injection
        db.query(`SELECT user_img_path FROM users WHERE user_email = '${phoneNumber1}'`, (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                res.status(500).send("Internal server error");
            } else {    
                // Checking if any user exists with the given phone number
                if (result.length > 0) {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                } else {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                }
            }
        });


    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Internal server error");
    }
});



_app.post("/userImages", async (req, res) => {
    try {
        // Assuming you are passing the phone number in the request body
        const phoneNumber1 = req.body.usermail;
        console.log(phoneNumber1);

        // Using parameterized query to prevent SQL injection
        db.query(`select path_to_img from matches where user_email='${phoneNumber1}'`, (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                res.status(500).send("Internal server error");
            } else {    
                // Checking if any user exists with the given phone number
                if (result.length > 0) {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                } else {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                }
            }
        });


    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Internal server error");
    }
});


_app.post("/AlluserImages", async (req, res) => {
    try {
        // Assuming you are passing the phone number in the request body
        const phoneNumber1 = req.body.usermail;
        console.log(phoneNumber1);

        // Using parameterized query to prevent SQL injection
        db.query(`select path_to_img from matches`, (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                res.status(500).send("Internal server error");
            } else {    
                // Checking if any user exists with the given phone number
                if (result.length > 0) {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                } else {
                    res.json({
                        imageUrl: result  // Changed to reflect phone number check
                    });
                }
            }
        });


    } catch (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Internal server error");
    }
});




_app.get("/", (req, res) => {
    res.send('1');
});

const path = require('path');


_app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

_app.get("/thankyou.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'thankyou.html'));
});

_app.get("/manage.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'manage.html'));
});

_app.get("/gallery.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

_app.get("/allimages.html", (req, res) => {
    res.sendFile(path.join(__dirname, 'allimages.html'));
});



_app.get('/images', function(req, res) {
    const imgFolder = path.join(__dirname, '/assets/');
    const fs = require('fs');

    fs.readdir(imgFolder, function(err, files) {
        if (err) {
            return console.error(err);
        }

        const jpgFiles = files.filter(file => {
    const extension = path.extname(file).toLowerCase();
    return extension === '.jpg' || extension === '.JPG';
});


        const filesArr = jpgFiles.map(file => {
            const filePath = path.join(imgFolder, file); // Define filePath here
            const imageData = fs.readFileSync(filePath, { encoding: 'base64' });
            return { name: file /*, base64Data: imageData*/};
        });

        res.json(filesArr);
    });
});


_app.get('/imagesUrl', function(req, res) {
    const imgFolder = path.join(__dirname, '/assets/');
    const fs = require('fs');

    fs.readdir(imgFolder, function(err, files) {
        if (err) {
            return console.error(err);
        }

        const jpgFiles = files.filter(file => {
            const extension = path.extname(file).toLowerCase();
            return extension === '.jpg' || extension === '.JPG';
        });

        const filesArr = [];

        jpgFiles.forEach(file => {
            const FileLocation = 'assets/' + file;
            const filePath = path.join(imgFolder, file);

            db.query("SELECT `CreationDate`,`user_id` FROM `USER` WHERE `imageUrl` LIKE ?", [FileLocation], (err, result) => {
                if (err) {
                    console.error("Error executing SQL query:", err);
                    res.status(500).send("Internal server error");
                    return; // return early to prevent further execution
                }

                const creationDate = result.length > 0 ? result[0].CreationDate : null;
                const IdUser = result.length > 0 ? result[0].user_id : null;

                const imageData = fs.readFileSync(filePath, { encoding: 'base64' });
                filesArr.push({IdUser: IdUser, name: file, creationDate: creationDate});
                if (filesArr.length === jpgFiles.length) {
                    res.json(filesArr);
                }
            });
        });
    });
});

_app.get('/imageDetails', function(req, res) {
    const imgName = req.query.imageName;
    const imgPath = path.join(__dirname, 'assets', imgName); // Constructing the path to the image

    const fs = require('fs');

    fs.readFile(imgPath, function(err, data) {
        if (err) {
            console.error(err);
            return res.status(404).send("Image not found");
        }

        db.query("SELECT `CreationDate`, `user_id` FROM `USER` WHERE `imageUrl` LIKE ?", ['assets/' + imgName], (err, result) => {
            if (err) {
                console.error("Error executing SQL query:", err);
                return res.status(500).send("Internal server error");
            }

            const creationDate = result.length > 0 ? result[0].CreationDate : null;
            const IdUser = result.length > 0 ? result[0].user_id : null;

            // Convert image data to base64
            const imageData = data.toString('base64');

            res.json({
                IdUser: IdUser,
                name: imgName,
                creationDate: creationDate,
                imageData: imageData
            });
        });
    });
});


_app.delete('/images', function(req, res) {
    const imgFolder = path.join(__dirname, '/assets/');
    const fs = require('fs');

    // Read all files in the folder
    fs.readdir(imgFolder, function(err, files) {
        if (err) {
            return res.status(500).json({ error: 'Failed to read images folder.' });
        }

        // Loop through each file
        files.forEach(function(file) {
            // Construct the file path of the image to be deleted
            const imagePath = path.join(imgFolder, file);
            
            // Attempt to delete the file
            fs.unlink(imagePath, function(err) {
                if (err) {
                    // Error while deleting file
                    console.error(`Failed to delete ${file}. Error: ${err}`);
                } else {
                    console.log(`${file} deleted successfully.`);
                }
            });
        });

        // All files deleted successfully
        res.json({ success: 'All images deleted successfully.' });
    });
});




_app.post("/upload1", upload1.single("user"), (req, res) => {
    // Check if the uploaded file has a valid extension
    if (req.file && (req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg'|| req.file.mimetype === 'image/JPG')) {
        res.json({
            success: "ok",
            file_name: res.file.location
        });
    } else {
        // If file extension is not allowed, respond with an error
        res.status(400).json({ error: "File format not supported. Please upload a JPG file." });
    }
});

_app.post('/upload', upload1.single('user'), async function (req, res, next) {
    //res.send('Successfully uploaded ' + req.file.location + ' location!');
    res.json({
        success: "ok",
        file_name: req.file.location

    });
});





function exceptionHandler(err,req,res,next){
    if (err instanceof _multer.MulterError){
        res.json({
          success: "not ok",
          message:err.message
        })
    }
}


_app.use(exceptionHandler);

/////



_app.get("/list", async (req, res) => {
    try {
        let r = await s3.listObjectsV2({ Bucket: BUCKET_NAME }).promise();
        let x = r.Contents.map(item => item.Key);
        res.send(x);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



_app.get("/download/:filename", async (req, res) => {
    const filename = req.params.filename;
    try {
        let x = await s3.getObject({ Bucket: BUCKET_NAME_photographe, Key: filename }).promise();
        res.send(x.Body);
    } catch (error) {
        console.error(error);
        res.status(404).send("File Not Found");
    }
});


_app.delete("/delete/:filename", async (req, res) => {
    const filename = req.params.filename;
    try {
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: filename }).promise();
        res.send("File Deleted Successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



_app.listen(3000,()=>{
    console.log("project is in run state")
})