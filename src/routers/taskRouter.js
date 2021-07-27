const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, user_id: req.user._id });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.get("/tasks", auth, async (req, res) => {
  try {
    // one method to get all task created by that user
    // const tasks = await Task.find({ user_id: req.user._id });

    //other method to get all task
    await req.user.populate("user_tasks").execPopulate();
    res.send(req.user.user_tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, user_id: req.user._id });
    if (!task) {
      res.status(400).send();
      return;
    }
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];

  const isValidUpdates = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdates) {
    return res.status(400).send();
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user_id: req.user.id,
    });
    updates.forEach((update) => (task[update] = req.body[update]));

    if (!task) {
      res.status(400).send();
      return;
    }
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });
    if (!task) {
      res.status(404).send();
      return;
    }
    res.send(task);
  } catch (error) {
    res.status(400).send();
  }
});

module.exports = router;
