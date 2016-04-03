var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var LegalEntitySchema = new Schema({
	entity_name: String,
	address: String,
	statutory_capital: Number,
	manager: Schema.Types.ObjectId,
	accounter: Schema.Types.ObjectId,
	record_creation_time: Date,
	removal_query_time: Date,
	services: [{
		service_name : String,
		providing_rules: String
  	}],
	affiliates: [Schema.Types.ObjectId]
});

module.exports = mongoose.model('LegalEntity', LegalEntitySchema);
