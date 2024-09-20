import config from "../config.js";

export const handlePolicies = policies => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ origin: config.SERVER, payload: 'Usuario no autenticado' });
        if (policies.includes(req.user.rol)) return next();
        res.status(403).send({ origin: config.SERVER, payload: 'No tiene permisos para acceder al recurso' });
    }
}

export const verifyRequiredBody = (requiredFields) => {
    return (req, res, next) => {
        const allOk = requiredFields.every(field =>
            req.body.hasOwnProperty(field) && req.body[field] !== '' && req.body[field] !== null && req.body[field] !== undefined);
        if (!allOk) {
            logger.error(`Faltan parámetros obligatorios o se enviaron vacíos, se requiere: ${requiredFields}`)
            throw new CustomError(errorsDictionary.FEW_PARAMETERS)
        };
        //return res.status(400).send({origin: config.SERVER, payload: 'Faltan propiedades', requiredFields});
        next();
    };
};