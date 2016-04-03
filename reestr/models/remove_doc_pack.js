var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var RemoveDocPackSchema = new Schema({
	application: String,
	message_in_massmedia: String,
	certificate: Schema.Types.ObjectId,
	checked_by: Schema.Types.ObjectId,
	removal_date: Date
});

module.exports = mongoose.model('RemoveDocPack', RemoveDocPackSchema);
