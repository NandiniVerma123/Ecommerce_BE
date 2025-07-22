const Coupon = require("../models/coupon"); // You should have a Coupon model

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, minOrderValue, maxDiscount, validFrom, validTo, usageLimit } = req.body;
        const { userId, role } = req.query;

        if (!userId || !role) {
            return res.status(400).json({ success: false, message: "User ID and role are required." });
        }

        if (role !== "admin" && role !== "vendor") {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const coupon = new Coupon({
            code: code.trim(),
            discountType,
            discountValue,
            minOrderValue,
            maxDiscount,
            validFrom,
            validTo,
            usageLimit,
            createdBy: userId,
            createdRole: role,
        });

        await coupon.save();
        return res.status(201).json({ success: true, message: "Coupon created successfully.", coupon });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Edit a coupon by ID
const editCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, role } = req.query;

        if (!userId || !role) {
            return res.status(400).json({ success: false, message: "User ID and role are required." });
        }

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found." });
        }

        const isOwner = coupon.createdBy?.toString() === userId;

        if (role !== "admin" && !isOwner) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        return res.status(200).json({ success: true, message: "Coupon updated successfully.", coupon: updatedCoupon });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//Check how many times or a user has used a coupon

const getCouponUsage = async (req, res) => {
    try {
        const { couponCode } = req.query;

        const coupon = await Coupon.findOne({ code: couponCode }).populate("usedBy", "name email");

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        return res.status(200).json({
            success: true,
            coupon: {
                code: coupon.code,
                usedCount: coupon.usedBy.length,
                usedBy: coupon.usedBy,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Create or update a coupon
const upsertCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, validFrom, expiresAt, usageLimit, maxDiscount } = req.body;
    const { role, userId } = req.user; // Assumes auth middleware sets this

    let coupon = await Coupon.findOne({ code });

    if (coupon) {
      // Update existing
      if (coupon.createdBy.toString() !== userId && role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to edit this coupon" });
      }

      Object.assign(coupon, {
        discountType,
        discountValue,
        minOrderAmount,
        validFrom,
        expiresAt,
        usageLimit,
        maxDiscount
      });

      await coupon.save();
      return res.status(200).json({ message: "Coupon updated", coupon });
    }

    // Create new
    coupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      validFrom,
      expiresAt,
      usageLimit,
      maxDiscount,
      createdBy: userId,
      createdRole: role
    });

    await coupon.save();
    return res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(500).json({ message: "Error processing coupon", error: err.message });
  }
};



module.exports = {
    createCoupon,
    editCoupon,
    getCouponUsage,
    upsertCoupon
};
