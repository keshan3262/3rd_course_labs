var LegalEntityOperations = require('./models/legal_entity_operations');
var LegalEntity = require('./models/legal_entity');

module.exports = function (app) {
    //api ---------------------------------------------------------------------

	//home page
    app.get('/', function(req, res) {
		//res.sendFile(__dirname + '/public/background.html');
		res.sendFile('/home/keshan/odessa/reestr/public/background.html');
    });

	//only in get method parameters are not in req.body
	//json server: add new
    app.post('/legal_entity_json', LegalEntityOperations.postLegalEntity);
	//json server: get by filter
	app.get('/legal_entity_json/:filter1', LegalEntityOperations.getLegalEntity);
	//json server: edit by id
	app.put('/legal_entity_json', LegalEntityOperations.putByIdLegalEntity);
	//json server: delete by filter
	app.delete('/legal_entity_json', LegalEntityOperations.deleteLegalEntity);
};
