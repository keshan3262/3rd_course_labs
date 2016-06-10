var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var IndividualSchema = new Schema({
	full_name: {type: String, unique: true, required: true}
});

module.exports = mongoose.model('Individual', IndividualSchema);
