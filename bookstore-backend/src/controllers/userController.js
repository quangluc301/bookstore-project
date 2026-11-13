const { getUsers, createUser, updateUser, setUserActive, deleteUser } = require('../services/userService');

async function listUsers(req, res, next) {
  try {
    const users = await getUsers({ search: req.query.search, role: req.query.role });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
}

async function addUser(req, res, next) {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function editUser(req, res, next) {
  try {
    const user = await updateUser(req.params.id, req.body, req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function changeUserStatus(req, res, next) {
  try {
    const user = await setUserActive(req.params.id, req.body.is_active, req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

async function removeUser(req, res, next) {
  try {
    const user = await deleteUser(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, addUser, editUser, changeUserStatus, removeUser };