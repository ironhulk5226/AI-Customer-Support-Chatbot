import Document from "../models/Document.js";
import fs from "fs/promises";
import { processDocument } from "../services/documentProcessingService.js";


export const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No document uploaded."
            });
        }

        const extension = req.file.originalname
            .split(".")
            .pop()
            .toLowerCase();

        const document = await Document.create({
            name: req.file.originalname,
            originalFileName: req.file.originalname,
            fileType: extension,
            fileSize: req.file.size,
            filePath: req.file.path,
            status: "processing"
        });

        try {
            const processedData = await processDocument(
                req.file.path,
                extension
            );

            document.status = "processed";
            document.processedAt = new Date();
            document.processingError = null;

            await document.save();

            res.status(201).json({
                message: "Document uploaded and processed successfully.",
                document: {
                    id: document._id,
                    name: document.name,
                    fileType: document.fileType,
                    fileSize: document.fileSize,
                    status: document.status,
                    processedAt: document.processedAt,
                    chunkCount: processedData.chunks.length
                }
            });
        } catch (processingError) {
            document.status = "failed";
            document.processingError = processingError.message;

            await document.save();

            res.status(500).json({
                message: "Document uploaded but processing failed.",
                documentId: document._id
            });
        }
    } catch (error) {
        console.error(
            "Document upload error:",
            error.message
        );

        res.status(500).json({
            message: "Failed to upload document."
        });
    }
};

export const getDocuments = async (req,res)=>{
    try {
        const documents = await Document.find().sort({createdAt:-1}); // descending order
        res.status(200).json({
            documents
        });
        
    } catch (error) {
        console.error("Get Documents Error:",error.message);

        res.status(500).json({
            message: "Failed to fetch documents"
        })

    }
};

export const getDocumentById = async(req,res)=>{
    try {
        const document = await Document.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                message:"Document not found"
            });
        }
        res.status(200).json({
            document
        });
        
    } catch (error) {
        console.error("Get Document Error:",error.message);

        res.status(500).json({
            message:"Failed to Fetch document"
        })
        
    }
}

export const deleteDocument = async(req,res) =>{
    try {
        const document = await Document.findById(req.params.id);
        if(!document){
            return res.status(404).json({
                message:"Document Not Found"
            })
        }
        
        try {
            await fs.unlink(document.filePath);
            
        } catch (fileError) {
            console.warn("File Could not be deleted:",
                fileError.message
            )
        }

        await Document.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Document Deleted Successfully."
        })

    } catch (error) {
        console.error("Delete document error:",error.message);

        res.status(500).json({
            message:"Failed to delete document"
        })
        
    }
}