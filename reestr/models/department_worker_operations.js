var DepartmentWorker = require("./department_worker");
var OdessaMethods = require("./odessa_methods");

//name: String, surname: String, fathername: String,
//address: String, fired_out: Boolean

var props = ["name", "surname", "fathername", "address", "fired_out"];

module.exports.postDepartmentWorker = function(req, res) {
    var ifMoreOne = function(req, res, objs) {
        throw new Error("Oy-vey, there are two identical department workers!");
    }
    var ifOne = function(req, res, objs) {
        res.json({message: "Such department worker already exists!"})
    };
    var ifNone = function(req, res, objs) {
        var w1 = new DepartmentWorker();
        for (var i = 0; i < props.length; i++)
            w1[props[i]] = req.body[props[i]];
    };
    OdessaMethods.odessaCheckForClone(DepartmentWorker, ["name", "surname", "fathername", "address"], req, res, ifMoreOne, ifOne, ifNone);
};
module.exports.createGetDepartmentWorker = function(filterVarsList) {
    return function(req, res) {
        var finalFunc = function(err, objs) {
            if (err)
                res.send(err);
            else
                res.json(objs);
        };
        OdessaMethods.odessaFilter(DepartmentWorker, filterVarsList, req, res, finalFunc, false);
    };
};
module.exports.putByIdDepartmentWorker = function() {
    var ifExists = function(req, res, obj1) {
        for (var i = 0; i < props.length; i++)
            if (req.body[props[i]] != null)
                obj1[props[i]] = req.body[props[i]];
        obj1.save(function(err) {
            if (err)
                res.send(err);
            else
                res.json({message: "Department worker updated!"});
            });
    };
    var ifDoesNot = function(req, res) {
        res.json({message: "No such department worker was found"});
    };
    OdessaMethods.odessaByIdActions(DepartmentWorker, req.body._id, req, res, ifExists, ifDoesNot);
};
module.exports.createDeleteDepartmentWorkerFunc = function(filterVarsList) {
    return function(req, res) {
        var ifNone = function(req, res) {
            res.json({message: "There were already no such objects."});
        };
        var ifOne = function(req, res, objs) {
            DepartmentWorker.remove(filter, function(err2, objs2) {
                if (err2)
                    res.send(err2);
                else
                    res.json({message: "Successfully deleted"});
            });
        };
        OdessaMethods.odessaCheckForClone(DepartmentWorker, filterVarsList, req, res, ifOne, ifOne, ifNone);
    };
};
