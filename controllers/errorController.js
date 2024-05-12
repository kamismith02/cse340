const errorController = {};

// Controller function to trigger intentional error
errorController.triggerError = (req, res, next) => {
    try {
        // Trigger an intentional error (e.g., calling a non-existent function)
        nonExistentFunction();
    } catch (error) {
        // Pass the error to the error handling middleware
        next(error);
    }
};

module.exports = errorController;