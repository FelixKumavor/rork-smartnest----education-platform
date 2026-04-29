const checkApproval = (req, res, next) => {
  console.log('Admin Check Triggered');
  if (!req.user?.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Account pending admin approval.'
    });
  }
  next();
};

module.exports = checkApproval;
