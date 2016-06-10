var LegalEntity = require("./legal_entity");
var Individual = require("./individual");

var simpleProps = ["entity_name", "entity_type", "edrpou", "certificate_series", "certificate_number",
					"certified_date", "address", "phone", "email", "licenses", "service_type"];
var regexProps = ["entity_name", "entity_type", "address", "service_type", "manager_full_name"];

var tokenizeSecondPart = function(secondPart) {
	var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	if (secondPart.length == 0) {
		return {};
	}
	if (secondPart.indexOf('=') == -1) {
		if (!checkForHexRegExp.test(secondPart)) {
			throw new Error("The filter is invalid");
		}
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
		if (secondPart.substring(i1 + 1)[0] == "&") {
			throw new Error("");
		}
		var left = tokenizeSecondPart(secondPart.substring(0, i1));
		var right = tokenizeSecondPart(secondPart.substring(i1 + 1));
		if (("_id" in left) && ("_id" in right)) {
			throw new Error("The filter is invalid");
		}
		for (var key1 in right) {
			left[key1] = right[key1];
		}
		return left;
	}
};

module.exports.postLegalEntity = function(req, res) {
	if (req.body.certified_date) {
		var g1 = req.body.certified_date.split('.');
		if (g1.length != 3)
			res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
		req.body.certified_date = new Date(g1[2], g1[1], g1[0]);
	}
	else {
		var k1 = new Date();
		req.body.certified_date = new Date(k1.getFullYear(), k1.getMonth() + 1, k1.getDate());
	}
	Individual.find({full_name: req.body.manager_full_name}, function(err, objs) {
		if (err) {
			res.send(err);
		}
		else {
			var newObjs = objs;
			var anyway = function(req, objs) {
				var en1 = new LegalEntity();
				en1.manager = objs[0]._id;
				en1.affiliates = [];
				var affNames = [];
				for (var i = 0; (req.body.affiliates != null) && (i < req.body.affiliates.length); i++)
					affNames.push(req.body.affiliates[i]);
				var checkForExistence = function(req, names, en1) {
					if (names.length == 0) {
						for (var i = 0; i < simpleProps.length; i++)
							en1[simpleProps[i]] = req.body[simpleProps[i]];
						for (var i = 0; (req.body.licenses != null) && (i < req.body.licenses.length); i++) {
							var l1 = req.body.licenses[i];
							var g1 = l1.start_date.split('.');
							if (g1.length != 3)
								res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
							en1.licenses[i].start_date = new Date(g1[2], g1[1], g1[0]);
							if (l1.due_date == null)
								continue;
							var g2 = l1.due_date.split('.');
							if (g2.length != 3)
								res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
							en1.licenses[i].due_date = new Date(g2[2], g2[1], g2[0]);
						}
						en1.save(function(err) {
							if (err) {
								res.send(err);
							}
							else {
								res.json({message: "Дані про нову фінансову установу успішно збережені"});
							}
						});
					}
					else {
						console.log("\n");
						console.log(names);
						console.log(en1.affiliates);
						var name1 = names.pop();
						LegalEntity.find({"entity_name": name1}, function(err, objs2) {
							if (err) {
								res.send(err);
								return;
							}
							if (objs2.length == 0) {
								res.json({message: "Установа \"" + name1 + "\" не була знайдена в Реєстрі"});
							}
							else {
								en1.affiliates.push(objs2[0]._id);
								checkForExistence(req, names, en1);
							}
						});
					}
				}
				checkForExistence(req, affNames, en1);
			};
			if (objs.length == 0) {
				var ind1 = new Individual();
				ind1.full_name = req.body.manager_full_name;
				ind1.save(function(err) {
					if (err) {
						res.send(err);
					}
					else {
						newObjs = [ind1];
						anyway(req, newObjs);
					}
				});
			}
			else {
				anyway(req, newObjs);
			}
		}
	});
};

module.exports.getLegalEntity = function(req, res) {
	var filter = tokenizeSecondPart(req.params.filter1);
	if (filter.certified_date) {
		var g1 = filter.certified_date.split('.');
		if (g1.length != 3)
			res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
		filter.certified_date = new Date(g1[2], g1[1], g1[0]);
	}
	for (var key1 in filter)
		if (regexProps.indexOf(key1) != -1)
			filter[key1] = {$regex: filter[key1], $options: "i"};
	var anyway = function() {
		LegalEntity.find(filter, function(err, objs) {
			if (err)
				res.send(err);
			var answer = [], newObjs = [];
			for (var i = 0; i < objs.length; i++) {
				newObjs.push(objs[i]);
			}
			var makeAnswer = function(newObjs2) {
				if (newObjs2.length == 0) {
					res.json(answer);
				}
				else {
					var obj = newObjs2.pop();
					var newObj = {};
					for (var i = 0; i < simpleProps.length; i++)
						newObj[simpleProps[i]] = obj[simpleProps[i]];
					var date1 = newObj.certified_date;
					newObj.certified_date = date1.getDate() + '.' + date1.getMonth() + '.' + date1.getFullYear();
					newObj._id = obj._id;
					Individual.findById(obj.manager, function(err, obj2) {
						if (err) {
							res.send(err);
						}
						else {
							newObj.manager_full_name = obj2.full_name;
							var affiliateIds = [];
							for (var i = 0; i < obj.affiliates.length; i++) {
								affiliateIds.push(obj.affiliates[i]);
							}
							var affiliates = [];
							var getAffiliates = function(objIds) {
								if (objIds.length == 0) {
									newObj.affiliates = affiliates;
									answer.push(newObj);
									makeAnswer(newObjs2);
								}
								else {
									LegalEntity.findById(objIds.pop(), function(err, obj3) {
										if (err) {
											res.send(err);
										}
										else {
											affiliates.push(obj3);
											getAffiliates(objIds);
										}
									});
								}
							}
							getAffiliates(affiliateIds);
						}
					});
				}
			};
			makeAnswer(newObjs);
		})
	};
	if (filter.manager_full_name == null)
		anyway();
	else {
		Individual.find({full_name: filter.manager_full_name}, function(err, objs) {
			if (err)
				res.send(err);
			else {
				delete filter.manager_full_name;
				if (objs.length == 0) {
					res.json([]);
				}
				else {
					filter.manager = objs[0]._id;
					anyway();
				}
			}
		})
	}
};

module.exports.putByIdLegalEntity = function(req, res) {
	if (req.body.certified_date) {
		var g1 = req.body.certified_date.split('.');
		if (g1.length != 3)
			res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
		req.body.certified_date = new Date(g1[2], g1[1], g1[0]);
	}
	LegalEntity.findById(req.body._id, function(err, obj) {
		if (err) {
			res.send(err);
		}
		if (obj == null) {
			res.json({"message": "Така фінансова установа не була знайдена"});
		}
		else {
			var anyway = function(managerId) {
				obj.manager = managerId;
				var affiliatesIds = [];
				var affiliatesNames = [];
				if (req.body.affiliates != null) {
					for (var i = 0; i < req.body.affiliates.length; i++) {
						affiliatesNames.push(req.body.affiliates[i]);
					}
					var getAffiliatesIds = function(objNames) {
						if (objNames.length == 0) {
							obj.affiliates = affiliatesIds;
							for (var i = 0; i < simpleProps.length; i++) {
								if (simpleProps[i] in req.body) {
									obj[simpleProps[i]] = req.body[simpleProps[i]];
								}
							}
							obj.save(function(err) {
								if (err) {
									res.send(err);
								}
								else {
									res.json({message: "Успішно оновлені дані про фінансову установу"});
								}
							});
						}
						else {
							LegalEntity.find({"entity_name": objNames.pop()}, function(err, objs3) {
								affiliatesIds.push({"_id": objs3[0]._id});
								getAffiliatesIds(objNames);
							});
						}
					};
					getAffiliatesIds(affiliatesNames);
				}
				else {
					for (var i = 0; i < simpleProps.length; i++) {
						if (req.body[simpleProps[i]] != null) {
							obj[simpleProps[i]] = req.body[simpleProps[i]];
						}
					}
					obj.save(function(err) {
						if (err) {
							res.send(err);
						}
						else {
							res.json({message: "Успішно оновлені дані про фінансову установу"});
						}
					});
				}
			};
			if (req.body.manager_full_name == null) {
				anyway(obj.manager);
			}
			else {
				Individual.find({"full_name": req.body.manager_full_name}, function(err, objs) {
					if (err) {
						res.send(err);
					}
					else if (objs.length == 0) {
						var ind1 = new Individual();
						ind1.full_name = req.body.manager_full_name;
						ind1.save(function(err) {
							if (err) {
								res.send(err);
							}
							else {
								anyway(ind1._id);
							}
						});
					}
					else {
						anyway(objs[0]._id);
					}
				});
			}
		}
	});
};

module.exports.deleteLegalEntity = function(req, res) {
	if (req.body.certified_date) {
		var g1 = req.body.certified_date.split('.');
		if (g1.length != 3)
			res.send({"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР"});
		req.body.certified_date = new Date(g1[2], g1[1], g1[0]);
	}
	//for (var key1 in req.body)
	//	if (regexProps.indexOf(key1) != -1)
	//		req.body[key1] = {$regex: req.body[key1], $options: "i"};
	console.log(req.body);
	var anyway = function() {
		LegalEntity.find(req.body, function(err, objs) {
			if (err)
				res.send(err);
			if (objs.length == 0)
				res.json({"message": "Такі фінансові установи вже були видалені"});
			else {
				var ids = [];
				for (var i = 0; i < objs.length; i++) {
					ids.push(objs[i]._id);
				}
				var level0Remove = function(ids) {
					var level1Remove = function(ids2, finalFunc2) {
						if (ids2.length == 0) {
							finalFunc2();
						}
						else {
							LegalEntity.remove({"_id": ids2.pop()}, function(err, objs3) {
								if (err) {
									res.send(err);
								}
								else {
									level1Remove(ids2);
								}
							});
						}
					};
					if (ids.length == 0) {
						res.json({"message": "Успішно видалено"});
					}
					else {
						var objId = ids.pop();
						LegalEntity.find({_id: objId}, function(err, objs2) {
							if (err)
								res.send(err);
							else
								LegalEntity.remove({"_id": objId}, function(err, result1) {
								if (err) {
									res.send(err);
								}
								else {
									level1Remove(objs2[0].affiliates, function() {
										level0Remove(ids);
									});
								}
							});
						});

					}
				}
				level0Remove(ids);
			}
		})
	};
	if (req.body.manager_full_name == null)
		anyway();
	else {
		Individual.find({full_name: req.body.manager_full_name}, function(err, objs) {
			if (err)
				res.send(err);
			else {
				delete req.body.manager_full_name;
				if (objs.length == 0)
					res.json([]);
				else {
					req.body.manager = objs[0]._id;
					anyway();
				}
			}
		})
	}
};
