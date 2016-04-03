var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var DataChangeDocPackSchema = new Schema({
	certificate_id: Schema.Types.ObjectId,
	changes_info: String,
	checked_by_id: Schema.Types.ObjectId,
	valid: Boolean
});

module.exports = mongoose.model('DataChangeDocPack', DataChangeDocPackSchema);
