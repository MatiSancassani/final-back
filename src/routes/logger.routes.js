import express from "express";

const router = express.Router();

router.get('/loggerTest', async (req, res) => {
    req.logger.debug("Test endpoint LoggerTest");
    req.logger.http("info http");
    req.logger.info("Information");
    req.logger.warning("Alert");
    req.logger.error("Error");
    req.logger.fatal("Fatal error");

    res.send({ status: "success", message: "Logs" });

});

export default router;