import multer from " multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {//cb means callback
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.originalname);//file.originalname is not a good practise for now lets go with it
    }
  })
  
  const upload = multer({
     storage, //storage: storage in ES6 u can directly write 
    })