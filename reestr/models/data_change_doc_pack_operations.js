var Certificate = require("./certificate");
var LegalEntity = require("./legal_entity");
var DepartmentWorker = require("./department_worker");
var DataChangeDocPack = require("./data_change_doc_pack");
var OdessaMethods = require("./odessa_methods");

//req input: {"changes_info": String, "valid": Boolean, "entity_name": String,
            //"name": String, "surname": String, "fathername": String, "address": String}
module.exports.postDataChangeDocPack = function(req, res) {
    var ifMoreOne = function(req, res, objs) {
        throw new Error("Oy-vey, there are legal entities with the same name " + req.body.legal_entity_name);
    }
    var ifOne = function(req, res, objs) {
        var ifMoreOne2 = function(req, res, objs) {
            throw new Error("Oy-vey, there are several certificates for one legal entity!");
        };
        var ifOne2 = function(req, res, objs2) {
            var ifMoreOne3 = function(req, res, objs3) {
                throw new Error("Oy-vey, there are two identical department workers!");
            }
            var ifOne3 = function(req, res, objs3) {
                var pack1 = new DataChangeDocPack();
                pack1.certificate_id = objs2[0]._id;
                pack1.changes_info = req.body.changes_info;
                pack1.checked_by_id = objs3[0]._id;
                pack1.valid = req.body.valid;
                pack1.save(function(err) {
                    if (err)
                        res.send(err);
                    else
                        res.json({message: "Data changes document packet created!"});
                });
            }
            OdessaMethods.odessaCheckForClone(DepartmentWorker, ["name", "surname", "fathername", "address"],
                                req, res, ifMoreOne3, ifOne3, ifNone3);
        };
        var ifNone2 = function(req, res) {
            throw new Error("Oy-vey, no certificate entry was found but it must be!");
        };
        req.body.legal_entity_id = objs[0]._id;
        OdessaMethods.odessaCheckForClone(Certificate, ["legal_entity_id"], req, res, ifMoreOne2, ifOne2, ifNone2);
    };
    var ifNone = function(req, res, objs) {
        res.json({message: "Please insert into the database data about such legal entity."});
    };
    OdessaMethods.odessaCheckForClone(LegalEntity, ["entity_name"], req, res, ifMoreOne, ifOne, ifNone);
};
module.exports.createGetDataChangeDocPackFunc = function(filterVarsList) {
    return function(req, res) {
        var finalFunc = function(err, objs) {
            if (err)
                res.send(err);
            else {
                var answer = [];
                for (var i = 0; i < objs.length; i++) {
                    var topush = {};
                    topush.changes_info = objs[i].changes_info;
                    topush.valid = objs[i].valid;
                    var ifExists = function(req, res, obj1) {
                        var ifExists2 = function(req, res, obj2) {
                            var ifExists3 = function(req, res, obj3) {
                                topush.legal_entity_name = obj2.name;
                                topush.checked_by_name = obj3.name;
                                topush.checked_by_surname = obj3.surname;
                                topush.checked_by_fathername = obj3.fathername;
                                answer.push(topush);
                            };
                            var ifDoesNot3 = function(req, res) {
                                throw new Error("Oy-vey, no department worker entry was found but it must be!");
                            };
                            OdessaMethods.odessaByIdActions(DepartmentWorker, objs[i].checked_by_id, req, res, ifExists3, ifDoesNot3);
                        };
                        var ifDoesNot2 = function(req, res) {
                            throw new Error("Oy-vey,  no legal entity entry was found but it must be!");
                        };
                        OdessaMethods.odessaByIdActions(LegalEntity, obj1.legal_entity_id, req, res, ifExists2, ifDoesNot2);
                    };
                    var ifDoesNot = function(req, res) {
                        throw new Error("Oy-vey,  no certificate entry was found but it must be!");
                    };
                    OdessaMethods.odessaByIdActions(Certificate, objs[i].certificate_id, req, res, ifExists, ifDoesNot);
                    //OdessaMethods.odessaFilter(LegalEntity, ["legal_entity_name"], req, res, finalFunc, false);
                }
                //Oy-vey, too much time will be wasted!
                while (answer.length != objs.length) {}
                res.json(answer);
            }
        };
        OdessaMethods.odessaFilter(DataChangeDocPack, filterVarsList, req, res, finalFunc, false);
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
