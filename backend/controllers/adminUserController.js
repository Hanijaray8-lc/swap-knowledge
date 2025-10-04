const AdminUser = require('../models/AdminUser');

const getAllAdminUsers = async (req, res) => {
  try {
    const admins = await AdminUser.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminUserById = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const registerAdminUser = async (req, res) => {
  try {
    const newUser = new AdminUser(req.body);
    await newUser.save();
    res.status(201).json({ message: 'Admin user registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStaffBySubject = async (req, res) => {
  try {
    const subject = req.params.subject;

    const staffList = await AdminUser.find({
      department: { $regex: new RegExp(`^${subject}$`, 'i') },
    });

    res.status(200).json(staffList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff by subject' });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await AdminUser.distinct('department');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

module.exports = {
  getAllAdminUsers,
  getAdminUserById,
  registerAdminUser,
  getStaffBySubject,
  getAllSubjects
};
