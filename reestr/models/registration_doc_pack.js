var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var RegistrationDocPackSchema = new Schema({
	card_id: String,
	application: String,
	legal_entity_data: String,
	checked_by: Schema.Types.ObjectId,
	certificate_given: Schema.Types.ObjectId
});

module.exports = mongoose.model('RegistrationDocPack', RegistrationDocPackSchema);
