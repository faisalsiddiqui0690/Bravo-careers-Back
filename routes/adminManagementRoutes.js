const express = require('express');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const { RBAC, Role, Permission } = require('../utils/rbac');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middleware to verify JWT and check permissions
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Middleware to check if user is SUPER_ADMIN
const requireSuperAdmin = async (req, res, next) => {
  try {
    const user = await AdminUser.findByPk(req.user.id);
    if (!user || !user.isActive || user.role !== Role.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Super admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all admin users (SUPER_ADMIN only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await AdminUser.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    const adminsWithPermissions = admins.map(admin => ({
      ...admin.toJSON(),
      permissions: RBAC.getRolePermissions(admin.role)
    }));

    res.json({
      success: true,
      data: adminsWithPermissions
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new admin user (SUPER_ADMIN only)
router.post('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and role are required'
      });
    }

    // Validate role
    if (!RBAC.validateRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check if email already exists
    const existingAdmin = await AdminUser.findByEmail(email);
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Check if trying to create another SUPER_ADMIN (only allow if it's the first one)
    if (role === Role.SUPER_ADMIN) {
      const existingSuperAdminCount = await AdminUser.count({ where: { role: Role.SUPER_ADMIN } });
      if (existingSuperAdminCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Only one super admin is allowed'
        });
      }
    }

    // Create new admin
    const newAdmin = await AdminUser.create({
      email,
      password,
      firstName: firstName || null,
      lastName: lastName || null,
      role,
      isActive: true
    });

    // Return admin without password
    const adminResponse = newAdmin.toJSON();
    delete adminResponse.password;

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: adminResponse
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Update admin user (SUPER_ADMIN only)
router.put('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, isActive } = req.body;

    // Find admin to update
    const admin = await AdminUser.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Prevent self-deactivation or role change
    if (admin.id === req.adminUser.id) {
      if (isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account'
        });
      }
      if (role && role !== admin.role) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }
    }

    // Validate role if provided
    if (role && !RBAC.validateRole(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    // Check if trying to update to SUPER_ADMIN
    if (role === Role.SUPER_ADMIN && admin.role !== Role.SUPER_ADMIN) {
      const existingSuperAdminCount = await AdminUser.count({ where: { role: Role.SUPER_ADMIN } });
      if (existingSuperAdminCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Only one super admin is allowed'
        });
      }
    }

    // Check email uniqueness if email is being changed
    if (email && email !== admin.email) {
      const existingAdmin = await AdminUser.findByEmail(email);
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update admin
    const updateData = {};
    if (email) updateData.email = email;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    await admin.update(updateData);

    // Return updated admin without password
    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.json({
      success: true,
      message: 'Admin user updated successfully',
      data: adminResponse
    });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// Reset admin password (SUPER_ADMIN only)
router.put('/:id/reset-password', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    // Find admin
    const admin = await AdminUser.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Update password
    await admin.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete admin user (SUPER_ADMIN only)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Find admin to delete
    const admin = await AdminUser.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    // Prevent self-deletion
    if (admin.id === req.adminUser.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Don't allow deletion of SUPER_ADMIN
    if (admin.role === Role.SUPER_ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete super admin account'
      });
    }

    // Soft delete by deactivating
    await admin.update({ isActive: false });

    res.json({
      success: true,
      message: 'Admin user deactivated successfully'
    });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
