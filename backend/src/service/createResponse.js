module.exports = function({ body = {}, statusCode = 200 }) {
	const response = {
		statusCode,
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		body: JSON.stringify(body),
	};
	return response;
};
