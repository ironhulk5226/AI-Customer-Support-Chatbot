import multer from "multer"
import path from "path";

const storage = multer.diskStorage({
    destination:(req,file,cb)=> { // cb = callback function
        cb(null,"uploads/");

    },
    filename: (req,file,cb)=>{
        const uniqueName = `${Date.now()}-${file.originalname}`; // 1758350000000-document.pdf
        cb(null , uniqueName);
    }
});

const fileFilter = (req,file,cb)=>{
    const allowedExtensions = [".pdf",".docx"];

    const extension = path.extname(file.originalname).toLowerCase();

    if(allowedExtensions.includes(extension)){
        cb(null,true);
    }
    else{
        cb(new Error("Only PDF and DOCX files are allowed"));
    }
}

const upload = multer({storage,fileFilter});

export default upload;

