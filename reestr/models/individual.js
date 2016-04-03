var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var IndividualSchema = new Schema({
	card_number: Number,
	name: String, surname: String, fathername: String,
	roles: [{"legal_entity_id": Schema.Types.ObjectId, "description": String}]
});

module.exports = mongoose.model('Individual', IndividualSchema);
