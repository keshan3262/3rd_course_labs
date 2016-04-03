var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var CertificateSchema = new Schema({
	legal_entity_id : Schema.Types.ObjectId,
	certified_date: Date
});

module.exports = mongoose.model('Certificate', CertificateSchema);
