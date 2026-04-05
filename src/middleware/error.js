
const errorHandler = async (err, req, res, next) => {
	if(err) {
		console.error(err.stack);
		res.status(500).send('Something broke!');
	} else {
		next();
	}
};

module.exports = {
    errorHandler
}