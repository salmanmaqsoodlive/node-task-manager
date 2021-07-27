const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is on port ", port);
});
