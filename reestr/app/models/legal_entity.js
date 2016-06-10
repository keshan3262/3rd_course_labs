var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var LegalEntitySchema = new Schema({
	entity_name:		{type: String, unique: true, required: 'Необхідно вказати назву фінансової установи'},
	entity_type:		{type: String, required: 'Необхідно вказати тип фінансової установи'},
	edrpou:				{type: Number, unique: true, required: 'Необхідно вказати код ЄДРПОУ установи'},
	service_type:		{type: String, required: 'Необхідно вказати тип фінансової послуги'},
	certificate_series: {type: String, required: 'Необхідно вказати серію та номер сертифіката'},
	certificate_number: {type: String, required: 'Необхідно вказати серію та номер сертифіката'},
	certified_date:		{type: Date},
	address:			{type: String, required: 'Необхідно вказати адресу фінансової установи'},
	phone:				String,
	email:				String,
	manager:			{type: Schema.Types.ObjectId, required: 'Необхідно вказати ПІБ керівника'},
	affiliates:			{type: [Schema.Types.ObjectId], default: []},
	licenses:			{
							type: [{
								license_number: String,
								service_name: String,
								start_date: Date,
								due_date: Date}],
							default: []
						}
});

module.exports = mongoose.model('LegalEntity', LegalEntitySchema);
