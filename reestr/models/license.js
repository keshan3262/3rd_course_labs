var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var LicenseSchema = new Schema({
	license_number: Number,
	purpose: String,
	issue_date: Date,
	owner: Schema.Types.ObjectId
});

module.exports = mongoose.model('License', LicenseSchema);
