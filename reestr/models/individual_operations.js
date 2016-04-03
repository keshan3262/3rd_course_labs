var LegalEntity = require("./legal_entity");
var Individual = require("./individual");
var OdessaMethods = require("./odessa_methods");

/*var IndividualSchema = new Schema({
	card_number: Number,
	name: String, surname: String, fathername: String,
	roles: [{"legal_entity_id": Schema.Types.ObjectId, "description": String}]
});*/

var props = ["card_number", "name", "surname", "fathername"];

module.exports.postIndividual = function(req, res) {
	var ifMoreOne = function(req, res, objs) {
		throw new Error("Oy-vey, there are individuals with the same name card number" +
						req.body.card_number);
	}
	var ifOne = function(req, res, objs) {
		res.json({message: "Such person already exists"});
	};
	var ifNone = function(req, res) {
		var in1 = new Individual();
		for (var i = 0; i < props.length; i++)
			in1[props[i]] = req.body[props[i]];
		in1.roles = [];
		in1.save(function(err) {
			if (err)
				res.send(err);
			else
				res.json({message: "Individual created!"});
		});
	};
	OdessaMethods.odessaCheckForClone(Individual, ["card_number"], req, res, ifMoreOne, ifOne, ifNone);
};
module.exports.createGetIndividualFunc = function(filterVarsList) {
	return function(req, res) {
		var finalFunc = function(err, objs) {
			if (err)
				res.send(err);
			else {
				var answer = [];
				for (var i = 0; i < objs.length; i++) {
					var topush = {};
					for (var j = 0; j < props.length; j++)
						topush[props[j]] = objs[i][props[j]];
					topush.roles = [];
					for (var j = 0; j < objs[i].roles.length; j++) {
						var ifExists = function(req, res, obj1) {
							topush.roles.push({entity_name: obj1.entity_name,
												description: objs[i][roles[j]].description});
						};
						var ifDoesNot = function(req, res) {
							throw new Error("Oy-vey, no legal entity entry was found but it must be!");
						}
						OdessaMethods.odessaByIdActions(LegalEntity, objs[i].roles[j].legal_entity_id,
														req, res, ifExists, ifDoesNot);
					}
					while (topush.roles != objs[i].roles.length) {}
					answer.push(topush);
				}
				while (answer.length != objs.length) {}
				res.json(answer);
			}
		};
		OdessaMethods.odessaFilter(Individual, filterVarsList, req, res, finalFunc, false);
	};
};
module.exports.putByIdIndividual = function() {
	var ifExists = function(req, res, obj1) {
		for (var i = 0; i < props.length; i++)
			if (req.body[props[i]] != null)
				obj1[props[i]] = req.body[props[i]];
		if (req.body.roles != null) {
			var newRoles = [];
			for (var j = 0; j < req.body.roles.length; j++) {
				var ifMoreOne = function(req, res, objs) {
					throw new Error("Oy-vey, there are many legal entities with the same name!");
				};
				var ifOne = function(req, res, objs) {
					newRoles.push({legal_entity_id: objs[0]._id, description: objs[0].description});
				};
				var ifNone = function(req, res) {
					res.json({message: "No legal entity '" + req.body.roles[j] + "' was found"})
				}
				OdessaMethods.odessaCheckForClone(LegalEntity, ["entity_name"], ifMoreOne, ifOne, ifNone);
			}
			while (newRoles.length != req.body.roles.length) {}
			obj1.roles = newRoles;
			obj1.save(function(err) {
				if (err)
					res.send(err);
				else
					res.json({message: "Individual updated!"});
			});
		}
		else
			obj1.save(function(err) {
				if (err)
					res.send(err);
				else
					res.json({message: "Individual updated!"});
			});
	};
	var ifDoesNot = function(req, res) {
		res.json({message: "No such individual was found"});
	};
	OdessaMethods.odessaByIdActions(Individual, req.body._id, req, res, ifExists, ifDoesNot);
};
module.exports.createDeleteIndividualFunc = function(filterVarsList) {
	return function(req, res) {
		var ifNone = function(req, res) {
			res.json({message: "There were already no such objects."});
		};
		var ifOne = function(req, res, objs) {
			Individual.remove(filter, function(err2, objs2) {
				if (err2)
					res.send(err2);
				else
					res.json({message: "Successfully deleted"});
			});
		};
		OdessaMethods.odessaCheckForClone(Individual, filterVarsList, req, res, ifOne, ifOne, ifNone);
	};
};
