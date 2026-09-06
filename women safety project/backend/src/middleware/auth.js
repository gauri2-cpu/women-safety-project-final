/**
 * Authentication Middleware
 * Validates user sessions and tokens (optional JWT implementation)
 */

/**
 * Middleware to check if user session exists
 * For MVP, we'll use simple session validation
 */
function authenticateUser(req, res, next) {
  try {
    // Get userId from headers or cookies
    const userId = req.headers['x-user-id'] || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }

    // Attach userId to request object
    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
}

/**
 * Allow guest users (no authentication required)
 */
function allowGuestUser(req, res, next) {
  // Get userId from headers (can be guest-uuid or actual user ID)
  const userId = req.headers['x-user-id'] || req.body.userId;
  
  if (userId) {
    req.userId = userId;
  }
  
  next();
}

module.exports = {
  authenticateUser,
  allowGuestUser
};
