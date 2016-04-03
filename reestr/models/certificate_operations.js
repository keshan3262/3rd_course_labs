var Certificate = require("./certificate");
var LegalEntity = require("./legal_entity");
var OdessaMethods = require("./odessa_methods");

//req input: {"entity_name": String, ["certified_date": Date]}
module.exports.postCertificate = function(req, res) {
    var ifMoreOne = function(req, res, objs) {
        throw new Error("Oy-vey, there are legal entities with the same name " + req.body.legal_entity_name);
    }
    var ifOne = function(req, res, objs) {
        var ifMoreOne2 = function(req, res, objs) {
            throw new Error("Oy-vey, there are several certificates for one legal entity!");
        };
        var ifOne2 = function(req, res, objs) {res.json({message: "Such certificate already exists!"});}
        var ifNone2 = function(req, res) {
            var obj1 = new Certificate();
            obj1.legal_entity_id = objs[0]._id;
            obj1.certified_date = (req.body.certified_date == null) ? new Date() : req.body.certified_date;
            obj1.save(function(err) {
                if (err)
                    res.send(err);
                else
                    res.json({message: "Certificate created!"});
            });
        };
        req.body.legal_entity_id = objs[0]._id;
        OdessaMethods.odessaCheckForClone(Certificate, ["legal_entity_id"], req, res, ifMoreOne2, ifOne2, ifNone2);
    };
    var ifNone = function(req, res, objs) {
        res.json({message: "Please insert into the database data about such legal entity."});
    };
    OdessaMethods.odessaCheckForClone(LegalEntity, ["entity_name"], req, res, ifMoreOne, ifOne, ifNone);
};

//output: array of {certified_date: Date, legal_entity_name: String}
module.exports.createGetCertificateFunc = function(filterVarsList) {
    return function(req, res) {
        var finalFunc = function(err, objs) {
            if (err)
                res.send(err);
            else {
                var answer = [];
                for (var i = 0; i < objs.length; i++) {
                    var topush = {};
                    topush.certified_date = objs[i].certified_date;
                    var ifExists = function(req, res, obj1) {
                        topush.legal_entity_name = obj1.name;
                        answer.push(topush);
                    };
                    var ifDoesNot = function(req, res) {
                        throw new Error("Oy-vey, legal entity was deleted but certificate was not!");
                    };
                    OdessaMethods.odessaByIdActions(LegalEntity, objs[i].legal_entity_id, req, res, ifExists, ifDoesNot);
                }
                //Oy-vey, too much time will be wasted!
                while (answer.length != objs.length) {}
                res.json(answer);
            }
        };
        OdessaMethods.odessaFilter(Certificate, filterVarsList, req, res, finalFunc, false);
    };
};

//req input: {"_id": ObjectId, "legal_entity_name": String, certified_date: Date}
module.exports.putByIdCertificate = function() {
    var ifExists = function(req, res, obj1) {
        var ifMoreOne = function(req, res, objs) {
            throw new Error("Oy-vey, there are legal entities with the same name " + req.body.legal_entity_name);
        };
        var ifOne = function(req, res, objs) {
            obj1.legal_entity_id = objs[0]._id;
            if (req.body.certified_date != null)
                obj1.certified_date = req.body.certified_date;
            obj1.save(function(err) {
                if (err)
                    res.send(err);
                else
                    res.json({message: "Certificate updated!"});
            });
        };
        var ifNone = function(req, res) {
            res.json({message: "No such legal entity was found"});
        };
        if (req.body.legal_entity_name != null)
            OdessaMethods.odessaCheckForClone(LegalEntity, ["entity_name"], req, res, ifMoreOne, ifOne, ifNone);
        else {
            if (req.body.certified_date != null)
                obj1.certified_date = req.body.certified_date;
            obj1.save(function(err) {
                if (err)
                    res.send(err);
                else
                    res.json({ message: Certificate + ' updated!' });
            });
        }
    };
    var ifDoesNot = function(req, res) {
        res.json({message: "No such certificate was found"});
    };
    OdessaMethods.odessaByIdActions(Certificate, req.body._id, req, res, ifExists, ifDoesNot);
};

module.exports.createDeleteCertificateFunc = function(filterVarsList) {
    return function(req, res) {
        var ifNone = function(req, res) {
            res.json({message: "There were already no such objects."});
        };
        var ifOne = function(req, res, objs) {
            Certificate.remove(filter, function(err2, objs2) {
                if (err2)
                    res.send(err2);
                else
                    res.json({message: "Successfully deleted"});
            });
        };
        OdessaMethods.odessaCheckForClone(Certificate, filterVarsList, req, res, ifOne, ifOne, ifNone);
    };
};
