const Joi = require('joi');

module.exports = listingSchema = Joi.object({
    title: Joi.string()
        .required(),

    description: Joi.string()
        .required(),

    image: Joi.string()
        .allow("", null),
    
    price: joi.number()
        .required().min(0),

    country: joi.string()
        .required(),

    location: joi.string()
        .required(),

    
})
