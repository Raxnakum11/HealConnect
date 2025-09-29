const Medicine = require('../models/Medicine');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all medicines for a doctor
// @route   GET /api/medicines
// @access  Private (Doctor only)
const getMedicines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const search = req.query.search || '';
  const type = req.query.type;
  const priority = req.query.priority;
  const expiring = req.query.expiring; // 'true' to get medicines expiring in 30 days
  
  // Build query
  const query = { doctorId: req.user.id, isActive: true };
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { batch: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Filter by priority
  if (priority) {
    query.priority = priority;
  }
  
  // Filter by expiring medicines
  if (expiring === 'true') {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    query.expiryDate = { $lte: thirtyDaysFromNow };
  }
  
  const medicines = await Medicine.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await Medicine.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: {
      medicines,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }
  });
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private (Doctor only)
const getMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }
  
  // Check if user owns this medicine
  if (medicine.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  res.status(200).json({
    success: true,
    data: { medicine }
  });
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Doctor only)
const createMedicine = asyncHandler(async (req, res) => {
  const {
    name,
    batch,
    quantity,
    size,
    unit,
    expiryDate,
    priority,
    type,
    cost,
    manufacturer
  } = req.body;
  
  // Check if medicine with same name and batch already exists for this doctor
  const existingMedicine = await Medicine.findOne({
    name,
    batch,
    doctorId: req.user.id,
    isActive: true
  });
  
  if (existingMedicine) {
    return res.status(400).json({
      success: false,
      message: 'Medicine with this name and batch already exists'
    });
  }
  
  const medicine = await Medicine.create({
    name,
    batch,
    quantity,
    size,
    unit,
    expiryDate,
    priority,
    type,
    cost,
    manufacturer,
    doctorId: req.user.id
  });
  
  res.status(201).json({
    success: true,
    message: 'Medicine created successfully',
    data: { medicine }
  });
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Doctor only)
const updateMedicine = asyncHandler(async (req, res) => {
  let medicine = await Medicine.findById(req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }
  
  // Check if user owns this medicine
  if (medicine.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Fields that can be updated
  const allowedFields = [
    'name', 'batch', 'quantity', 'size', 'unit', 'expiryDate',
    'priority', 'type', 'cost', 'manufacturer'
  ];
  
  const fieldsToUpdate = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate[field] = req.body[field];
    }
  });
  
  // Check if name and batch combination is being changed and not already taken
  if ((fieldsToUpdate.name && fieldsToUpdate.name !== medicine.name) || 
      (fieldsToUpdate.batch && fieldsToUpdate.batch !== medicine.batch)) {
    const existingMedicine = await Medicine.findOne({
      name: fieldsToUpdate.name || medicine.name,
      batch: fieldsToUpdate.batch || medicine.batch,
      doctorId: req.user.id,
      _id: { $ne: req.params.id },
      isActive: true
    });
    
    if (existingMedicine) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this name and batch already exists'
      });
    }
  }
  
  medicine = await Medicine.findByIdAndUpdate(
    req.params.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  );
  
  res.status(200).json({
    success: true,
    message: 'Medicine updated successfully',
    data: { medicine }
  });
});

// @desc    Delete medicine (soft delete)
// @route   DELETE /api/medicines/:id
// @access  Private (Doctor only)
const deleteMedicine = asyncHandler(async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }
  
  // Check if user owns this medicine
  if (medicine.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  // Soft delete
  medicine.isActive = false;
  await medicine.save();
  
  res.status(200).json({
    success: true,
    message: 'Medicine deleted successfully'
  });
});

// @desc    Update medicine quantity (for prescriptions)
// @route   PATCH /api/medicines/:id/quantity
// @access  Private (Doctor only)
const updateQuantity = asyncHandler(async (req, res) => {
  const { quantityUsed, operation } = req.body; // operation: 'subtract' or 'add'
  
  const medicine = await Medicine.findById(req.params.id);
  
  if (!medicine) {
    return res.status(404).json({
      success: false,
      message: 'Medicine not found'
    });
  }
  
  // Check if user owns this medicine
  if (medicine.doctorId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  if (operation === 'subtract') {
    if (medicine.quantity < quantityUsed) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient quantity available'
      });
    }
    medicine.quantity -= quantityUsed;
  } else if (operation === 'add') {
    medicine.quantity += quantityUsed;
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid operation. Use "subtract" or "add"'
    });
  }
  
  await medicine.save();
  
  res.status(200).json({
    success: true,
    message: 'Medicine quantity updated successfully',
    data: { medicine }
  });
});

// @desc    Get medicine statistics for doctor
// @route   GET /api/medicines/stats
// @access  Private (Doctor only)
const getMedicineStats = asyncHandler(async (req, res) => {
  const doctorId = req.user.id;
  
  // Total medicines
  const totalMedicines = await Medicine.countDocuments({ 
    doctorId, 
    isActive: true 
  });
  
  // Low stock medicines (quantity < 10)
  const lowStockMedicines = await Medicine.countDocuments({
    doctorId,
    isActive: true,
    quantity: { $lt: 10 }
  });
  
  // Expiring medicines (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const expiringMedicines = await Medicine.countDocuments({
    doctorId,
    isActive: true,
    expiryDate: { $lte: thirtyDaysFromNow }
  });
  
  // Medicines by type
  const typeStats = await Medicine.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  
  // Medicines by priority
  const priorityStats = await Medicine.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);
  
  // Total inventory value
  const inventoryValue = await Medicine.aggregate([
    { $match: { doctorId: doctorId, isActive: true } },
    { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$cost'] } } } }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      totalMedicines,
      lowStockMedicines,
      expiringMedicines,
      typeStats,
      priorityStats,
      inventoryValue: inventoryValue[0]?.total || 0
    }
  });
});

// @desc    Get expiring medicines
// @route   GET /api/medicines/expiring
// @access  Private (Doctor only)
const getExpiringMedicines = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const expiringMedicines = await Medicine.find({
    doctorId: req.user.id,
    isActive: true,
    expiryDate: { $lte: futureDate }
  }).sort({ expiryDate: 1 });
  
  res.status(200).json({
    success: true,
    data: { medicines: expiringMedicines }
  });
});

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  updateQuantity,
  getMedicineStats,
  getExpiringMedicines
};