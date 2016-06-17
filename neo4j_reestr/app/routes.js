var LegalEntityOperations = require('./legal_entity_operations');

module.exports = function (app, session) {
    //api ---------------------------------------------------------------------

	//home page
    app.get('/', function(req, res) {
		res.sendFile('/home/keshan/odessa/neo4j_reestr/public/background.html');
    });

	//only in get method parameters are not in req.body
	//json server: add new
    app.post('/legal_entity_json', function(req, res) {LegalEntityOperations.postLegalEntity(req, res, session);});
	//json server: get by filter
	app.get('/legal_entity_json/:filter1', function(req, res) {LegalEntityOperations.getLegalEntity(req, res, session);});
	//json server: edit by id
	app.put('/legal_entity_json', function(req, res) {LegalEntityOperations.putByIdLegalEntity(req, res, session);});
	//json server: delete by filter
	app.delete('/legal_entity_json', function(req, res) {LegalEntityOperations.deleteLegalEntity(req, res, session);});
	//statistics
	app.get('/statistics', function(req, res) {LegalEntityOperations.getStats(req, res, session);})
};
