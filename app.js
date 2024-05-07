import express from "express";
import { errorHandler, notFound } from "./errorMiddlewares.js";
import { connectToServer } from "./mongodb.js";
import userRoutes from "./routes/userRoutes.js";


const app = express();
app.use(express.json());
app.disable("etag");
await connectToServer();

app.use("/images", express.static("images"));

app.get("/hello", (req, res) => res.json({ message: "hello" }));

// USER ROUTES
app.use('/users',userRoutes)


// HANDLE UNDEFINED ROUTES AND ERRORS
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
