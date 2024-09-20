import config, { errorsDictionary } from "../../config.js";

const errorsHandler = (error, req, res, next) => {
    let customErr = errorsDictionary[0];
    for (const key in errorsDictionary) {
        if (errorsDictionary[key].code === error.type.code) customErr = errorsDictionary[key];
    }
    return res.status(customErr.status).send({ payload: '', error: customErr.message })
}


export default errorsHandler;