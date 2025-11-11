import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction, RequestHandler } from "express";

type RuleMap = Record<string, ValidationChain[]>;

export function buildUpdateValidator(opts: {
  allowed: string[];
  rules: RuleMap;
  forbidExtras?: boolean;
}): RequestHandler[] { 
  const { allowed, rules, forbidExtras = true } = opts;

  const chains: ValidationChain[] = Object.values(rules).flat();

  const forbidUnknown = body().custom((_, { req }) => {
    if (!forbidExtras) return true;
    const extras = Object.keys(req.body || {}).filter(k => !allowed.includes(k));
    if (extras.length) throw new Error(`Campos no permitidos: ${extras.join(", ")}`);
    return true;
  });

  
  return [
    ...(chains as unknown as RequestHandler[]),
    forbidUnknown as unknown as RequestHandler,
    handleValidationErrors,
  ];
}


export const handleValidationErrors: RequestHandler = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const details = result.array({ onlyFirstError: true }).map(e => ({
    field: ("path" in e && e.path) ? e.path : "_error",
    message: String(e.msg),
  }));
  return res.status(400).json({ error: "ValidationError", details });
};

export const rules = {
  name: (): ValidationChain[] => [
    body("name").optional().isString().withMessage("Debe ser texto")
      .isLength({ min: 1, max: 80 }).withMessage("Debe tener entre 1 y 80 caracteres"),
  ],
  email: (): ValidationChain[] => [
    body("email").optional().isEmail().withMessage("Email inválido").normalizeEmail(),
  ],
  address: (): ValidationChain[] => [
    body("address")
      .optional()
      .custom((val) => {
        if (typeof val === "string") return true;      
        if (Array.isArray(val)) {
          for (const a of val) {
            if (!a) return false;
            if (typeof a.street !== "string" || a.street.length < 1) return false;
            if (typeof a.city !== "string" || a.city.length < 1) return false;
            if (typeof a.postalCode !== "string" || a.postalCode.length < 1) return false;
            if (typeof a.country !== "string" || a.country.length < 2) return false;
          }
          return true;
        }
        return false;
      })
      .withMessage("address debe ser string o un arreglo válido"),
  ],
};
