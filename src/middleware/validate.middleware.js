export const validate = (schema, property = "query") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/"/g, ""));
      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req[property] = value;
    next();
  };
};
