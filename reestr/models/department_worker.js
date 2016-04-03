var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var DepartmentWorkerSchema = new Schema({
	name: String, surname: String, fathername: String,
	address: String, fired_out: Boolean
});

module.exports = mongoose.model('DepartmentWorker', DepartmentWorkerSchema);
