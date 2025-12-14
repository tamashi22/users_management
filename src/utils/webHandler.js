/**
 * Wraps controller for web routes
 * On success: redirects to successUrl
 * On error: return error message in the view
 */
const webHandler = (controller, successUrl, errorView) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = () => res.redirect(successUrl);

    await controller(req, res, (err) => {
      res.json = originalJson;

      if (err) {
        return res.status(err.statusCode || 500).render(errorView, {
          error: err.message,
          errors: null,
          ...req.body,
        });
      }
    });
  };
};

module.exports = { webHandler };
