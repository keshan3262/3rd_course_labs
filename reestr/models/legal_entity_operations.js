                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             var LegalEntity = require("./legal_entity");
var OdessaMethods = require("./odessa_methods");
var Individual = require("./individual");

/*
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
*/
var props = ["entity_name", "address", "statutory_capital", "record_creation_time", "removal_query_time", "services"];

//req input: {"changes_info": String, "valid": Boolean, "entity_name": String,
            //"name": String, "surname": String, "fathername": String, "address": String}
module.exports.postLegalEntity = function(req, res) {
    var ifMoreOne = function(req, res, objs) {
        throw new Error("Oy-vey, there are legal entities with the same name " + req.body.legal_entity_name);
    }
    var ifOne = function(req, res, objs) {
        res.json("Such legal entity already exists.");
    };
    var ifNone = function(req, res) {
        var ifMoreOne2 = function(req, res, objs2) {
            throw new Error("Oy-vey, there are several individuals with the same card number!");
        };
        var ifOne2 = function(req, res, objs2) {
            var accounterIsIndividual = ("accounter_surname" in req.body);
            var ifMoreOne3 = function(req, res, objs3) {
                throw new Error("Oy-vey, there are several identical " +
                                (accounterIsIndividual ? " individuals!" : " legal_entities!"));
            };
            var ifOne3 = function(req, res, objs3) {
                var en1 = new LegalEntity();
                for (var i = 0; i < props.length; i++)
                    en1[props[i]] = req.body[props[i]];
                en1.manager = objs2[0]._id;
                en1.accounter = objs3[0]._id;
                en1.affiliates = [];
                for (var i = 0; i < req.body.affiliates.length; i++) {
                    var ifMoreOne4 = function(req, res, objs4) {
                        throw new Error("Oy-vey, there are legal entities with the same name " + req.body.affiliates[i].entity_name);
                    };
                    var ifOne4 = function(req, res, objs4) {
                        en1.affiliates.push(objs4[0]._id);
                    };
                    var ifNone4 = function(req, res) {
                        throw new Error("Oy-vey, no entry for legal entity was found but it must be!");
                    };
                    class1.find({"entity_name": req.body.affiliates[i]}, function(err, objs4) {
                        if (err)
                            res.send(err);
                        else if (objs4.length > 1)
                            ifMoreOne4(req, res, objs4);
                        else if (objs4.length == 1)
                            ifOne4(req, res, objs4);
                        else
                            ifNone4(req, res);
                    });
                }
                while (en1.affiliates.length != req.body.affiliates.length) {}
                en1.save(function(err) {
                    if (err)
                        res.send(err);
                    else
                        res.json({message: "Legal entity saved!"};)
                });
            };
            var ifNone3 = function(req, res) {
                throw new Error("Oy-vey, no entry for " +
                                (accounterIsIndividual ? "individual" : "legal_entity") +
                                " was found but it must be!");
            };
            var class1, keyParameters, filter = {};
            if (accounterIsIndividual) {
                keyParameters = ["name", "surname", "fathername"];
                class1 = Individual;
                for (var i = 0; i < keyParameters.length; i++)
                    filter[keyParameters[i]] = req.body["accounter_" + keyParameters[i]];
            }
            else {
                vars keyParameters = ["entity_name"];
                class1 = LegalEntity;
                for (var i = 0; i < keyParameters.length; i++)
                    filter[keyParameters[i]] = req.body["accounter_" + keyParameters[i]];
            }
            class1.find(filter, function(err, objs3) {
                if (err)
                    res.send(err);
                else if (objs3.length > 1)
                    ifMoreOne3(req, res, objs3);
                else if (objs3.length == 1)
                    ifOne3(req, res, objs3);
                else
                    ifNone3(req, res);
            });
        };
        var ifNone2 = function(req, res) {
            throw new Error("Oy-vey, no entry for individual (manager) was found but it must be!");
        };
        var keyParameters = ["name", "surname", "fathername"];
        var filter = {};
        for (var i = 0; i < keyParameters.length; i++)
            filter[keyParameters[i]] = req.body["manager_" + keyParameters[i]];
        Individual.find(filter, function(err, objs2) {
            if (err)
                res.send(err);
            else if (objs2.length > 1)
                ifMoreOne2(req, res, objs2);
            else if (objs2.length == 1)
                ifOne2(req, res, objs2);
            else
                ifNone2(req, res);
        });
    };
    OdessaMethods.odessaCheckForClone(LegalEntity, ["entity_name"], req, res, ifMoreOne, ifOne, ifNone);
};
module.exports.createGetLegalEntityFunc = function(filterVarsList) {
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
                    var ifExists = function(req, res, obj1) {
                        var anyway = function(req, res, obj2, accounterIsIndividual) {
                            topush.affiliates = [];
                            for (var j = 0; j < objs[i].affiliates.length; j++) {
                                var ifExists3 = function(req, res, obj3) {
                                    topush.affiliates.push(obj3.entity_name);
                                };
                                var ifDoesNot3 = function(req, res) {
                                    throw new Error("Oy-vey, no legal entity for affiliate entry found but it must be!");
                                };
                                OdessaMethods.odessaByIdActions(LegalEntity, objs[i].affiliates[j]._id,
                                                                req, res, ifExists3, ifDoesNot3);
                            }
                            while (topush.affiliates.length != objs[i].affiliates.length) {};
                            topush.manager = {name: obj1.name, surname: obj1.surname, fathername: obj1.fathername};
                            topush.accounter = (accounterIsIndividual) ?
                                                {name: obj2.name, surname: obj2.surname, fathername: obj2.fathername} :
                                                {entity_name: obj2.entity_name};
                            answer.push(topush);
                        };
                        var ifExists2 = function(req, res, obj2) {
                            anyway(req, res, obj2, true);
                        };
                        var ifDoesNot2 = function(req, res) {
                            var ifExists3 = function(req, res, obj3) {
                                anyway(req, res, obj3, false);
                            };
                            var ifDoesNot3 = function(req, res) {
                                throw new Error("Oy-vey, accounter doesn't exist!");
                            };
                            OdessaMethods.odessaByIdActions(LegalEntity, objs[i].accounter,
                                                            req, res, ifExists3, ifDoesNot3);
                        };
                        OdessaMethods.odessaByIdActions(Individual, objs[i].accounter,
                                                        req, res, ifExists2, ifDoesNot2);
                    };
                    var ifDoesNot = function(req, res, obj1) {
                        throw new Error("Oy-vey, no individual entry was found but it must be!");
                    };
                    OdessaMethods.odessaByIdActions(Individual, objs[i].manager,
                                                    req, res, ifExists, ifDoesNot);
                    //answer.push(topush);
                }
                //Oy-vey, too much time will be wasted!
                while (answer.length != objs.length) {}
                res.json(answer);
            }
        };
        OdessaMethods.odessaFilter(LegalEntity, filterVarsList, req, res, finalFunc, false);
    };
};
module.exports.putByIdDataChangeDocPack = function() {
    var ifExists = function(req, res, obj1) {
        if (req.body.changes_info != null)
            obj1.changes_info = req.body.changes_info;
        if (req.body.valid != null)
            obj1.valid = req.body.valid;
        if (req.body.name != null) {
            var ifMoreOne = function(req, res, objs) {
                throw new Error("Oy-vey, there are two identical department workers!");
            };
            var ifOne = function(req, res, objs) {
                obj1.checked_by_id = objs[0]._id;
                obj1.save(function(err) {
                    if (err)
                        res.send(err);
                    else
                        res.json({message: "Data change documents pack updated!"});
                })
            };
            OdessaMethods.odessaCheckForClone(DepartmentWorker, ["name", "surname", "fathername", "address"],
                                                req, res, ifMoreOne, ifOne, ifNone);
        }
        else
            obj1.save(function(err) {
                if (err)
                    res.send(err);
                else
                    res.json({message: "Data change documents pack updated!"});
                });
    };
    var ifDoesNot = function(req, res) {
        res.json({message: "No such data change document packet was found"});
    };
    OdessaMethods.odessaByIdActions(DataChangeDocPack, req.body._id, req, res, ifExists, ifDoesNot);
};
module.exports.createDeleteDataChangeDocumentPackFunc = function(filterVarsList) {
    return function(req, res) {
        var ifNone = function(req, res) {
            res.json({message: "There were already no such objects."});
        };
        var ifOne = function(req, res, objs) {
            DataChangeDocPack.remove(filter, function(err2, objs2) {
                if (err2)
                    res.send(err2);
                else
                    res.json({message: "Successfully deleted"});
            });
        };
        OdessaMethods.odessaCheckForClone(DataChangeDocPack, filterVarsList, req, res, ifOne, ifOne, ifNone);
    };
};
