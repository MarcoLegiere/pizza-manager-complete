const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
    
    next();
  };
};

// Schemas de validação
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email deve ter um formato válido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  customer: Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required().messages({
      'string.pattern.base': 'Telefone deve ter o formato (11) 99999-9999',
      'any.required': 'Telefone é obrigatório'
    }),
    email: Joi.string().email().allow('').messages({
      'string.email': 'Email deve ter um formato válido'
    }),
    address: Joi.string().min(10).required().messages({
      'string.min': 'Endereço deve ter pelo menos 10 caracteres',
      'any.required': 'Endereço é obrigatório'
    }),
    neighborhood: Joi.string().allow(''),
    city: Joi.string().allow(''),
    zip_code: Joi.string().allow('')
  }),

  product: Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    category_id: Joi.string().uuid().required().messages({
      'string.uuid': 'ID da categoria deve ser um UUID válido',
      'any.required': 'Categoria é obrigatória'
    }),
    price: Joi.number().positive().required().messages({
      'number.positive': 'Preço deve ser um valor positivo',
      'any.required': 'Preço é obrigatório'
    })
  }),

  order: Joi.object({
    customer_id: Joi.string().uuid().required().messages({
      'string.uuid': 'ID do cliente deve ser um UUID válido',
      'any.required': 'Cliente é obrigatório'
    }),
    payment_method: Joi.string().valid('pix', 'debit_card', 'credit_card', 'cash').required().messages({
      'any.only': 'Método de pagamento deve ser: pix, debit_card, credit_card ou cash',
      'any.required': 'Método de pagamento é obrigatório'
    }),
    delivery_fee: Joi.number().min(0).default(0),
    delivery_address: Joi.string().min(10).required().messages({
      'string.min': 'Endereço de entrega deve ter pelo menos 10 caracteres',
      'any.required': 'Endereço de entrega é obrigatório'
    }),
    notes: Joi.string().allow(''),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    ).min(1).required().messages({
      'array.min': 'Pedido deve ter pelo menos 1 item'
    })
  })
};

module.exports = { validate, schemas };

