function tokenizeSecondPart(secondPart) {
var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
    if (secondPart.length == 0)
        return {};
    if (secondPart.indexOf('=') == -1) {
        if (!checkForHexRegExp.test(secondPart))
            throw new Error("The filter is invalid");
        return {"_id": secondPart};
    }
    else if (secondPart.indexOf('&') == -1) {
        var i1 = secondPart.indexOf("=") + 1;
        var res = {};
        res[secondPart.substring(0, i1 - 1)] = secondPart.substring(i1);
        return res;
    }
    else {
        var i1 = secondPart.indexOf("&");
        if (secondPart.substring(i1 + 1)[0] == "&")
            throw new Error("");
        var left = tokenizeSecondPart(secondPart.substring(0, i1));
        var right = tokenizeSecondPart(secondPart.substring(i1 + 1));
        if (("_id" in left) && ("_id" in right))
            throw new Error("The filter is invalid");
        for (var key1 in right)
            left[key1] = right[key1];
        return left;
    }
};

function odessaFilter(class1, filterVarsList, req, res, finalFunc, dataInBody) {
    var filter = {};
    if (filterVarsList != null)
        for (var i = 0; i < filterVarsList.length; i++)
            filter[filterVarsList[i]] = (dataInBody) ? req.body[filterVarsList[i]] :
                                                        req.params[filterVarsList[i]];
    Certificate.find(filter, finalFunc);
};

function odessaCheckForClone(class1, keyParameters, req, res, ifMoreOne, ifOne, ifNone) {
    var filter = {};
    for (var i = 0; i < keyParameters.length; i++)
        filter[keyParameters[i]] = req.body[keyParameters[i]];
    class1.find(filter, function(err, objs) {
        if (err)
            res.send(err);
        else if (objs.length > 1)
            ifMoreOne(req, res, objs);
        else if (objs.length == 1)
            ifOne(req, res, objs);
        else
            ifNone(req, res);
    });
};

function odessaByIdActions(class1, _id, req, res, ifExists, ifDoesNot) {
    class1.findById(_id, function(err, obj1) {
        if (err)
            res.send(err);
        else if (obj1 != null)
            ifExists(req, res, obj1);
        else
            ifDoesNot(req, res);
    });
};
