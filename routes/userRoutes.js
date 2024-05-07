import express from "express";
import { changePassword, createUser, getAllUsers, sendNotification, signinUser, updateUser, uploadImage } from "../controllers/userControllers.js";



const router = express.Router();


// CREATE USER
router.post("/create-user", createUser);
  
  // USER SIGN IN
  router.post("/signin", signinUser);

  
  // GET ALL USERS WITH ROLE USER
  router.get("/", getAllUsers );
  
  // UPDATE USER BY ID
  router.put("/update-user", updateUser);

  // UPLOAD IMAGE
  router.post('/upload-image',uploadImage)

// CHANGE PASSWORD
    router.post('/change-password',changePassword)
  
  // SEND NOTIFICATION
  router.post("/send-notification", sendNotification);





export default router;

