import express from "express";
import { errorHandler, notFound } from "./errorMiddlewares.js";
import { connectToServer } from "./mongodb.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";


const app = express();

app.disable("etag");
app.use(express.json({ limit: "50mb" }));
await connectToServer();

app.use("/images", express.static("images"));

app.get("/hello", (req, res) => res.json({ message: "hello" }));

// USER ROUTES
app.use('/users',userRoutes)
// SESSION ROUTES
app.use('/sessions',sessionRoutes)

// HANDLE UNDEFINED ROUTES AND ERRORS
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
