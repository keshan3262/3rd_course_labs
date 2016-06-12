var LegalEntity = require("./legal_entity");
var Individual = require("./individual");

var simpleProps = ["entity_name", "entity_type", "edrpou", "certificate_series", "certificate_number",
					"certified_date", "address", "phone", "email", "licenses", "service_type"];
var regexProps = ["entity_name", "entity_type", "address", "service_type", "manager_full_name"];

var invalidDateFormatMsg = {"message": "Неправильний формат дати. Правильний: ДД.ММ.РРРР", error: true};

var parseDate = function(str) {
	var g1 = str.split('.');
	if (g1.length != 3)
		return null;
	for (var i = 0; i < 3; i++)
		if (isNaN(g1[i] * 0))
			return null;
	var mbResult = new Date(g1[2], g1[1] - 1, g1[0]);
	if ((mbResult.getDate() != g1[0]) || (mbResult.getMonth() != g1[1] - 1) || (mbResult.getFullYear() != g1[2]))
		return null;
	return mbResult;
}

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
		var d1 = parseDate(req.body.certified_date);
		if (d1 == null)
			res.json(invalidDateFormatMsg);
		else
			req.body.certified_date = d1;
	}
	else {
		var k1 = new Date();
		req.body.certified_date = new Date(k1.getFullYear(), k1.getMonth(), k1.getDate());
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
								res.json(invalidDateFormatMsg);
							en1.licenses[i].start_date = new Date(g1[2], g1[1], g1[0]);
							if (l1.due_date == null)
								continue;
							var g2 = l1.due_date.split('.');
							if (g2.length != 3)
								res.json(invalidDateFormatMsg);
							en1.licenses[i].due_date = new Date(g2[2], g2[1], g2[0]);
						}
						en1.save(function(err) {
							if (err) {
								var text = "Невідома помилка збереження інформації";
								if (("errmsg" in err) && (err.errmsg.indexOf("duplicate") != -1)) {
									if (err.errmsg.indexOf("name") != -1)
										text = "Фінансова установа з такою назвою вже існує";
									else
										text = "Фінансова установа з таким кодом за ЄДРПОУ вже існує";
								}
								if ("errors" in err)
									text = "Не всі обов\'язкові поля заповнені або деякі поля заповнені неправильно";
								res.json({message: text, error: true});
							}
							else {
								res.json({message: "Дані про нову фінансову установу успішно збережені"});
							}
						});
					}
					else {
						var name1 = names.pop();
						LegalEntity.find({"entity_name": name1}, function(err, objs2) {
							if (err) {
								res.send(err);
								return;
							}
							if (objs2.length == 0) {
								res.json({message: "Установа \"" + name1 + "\" не була знайдена в Реєстрі", error: true});
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
						res.json({message: (req.body.manager_full_name == null) ? "Необхідно вказати ім\'я керівника" : "Невідома помилка збереження", error: true});
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
	for (var key1 in filter)
		if (regexProps.indexOf(key1) != -1)
			filter[key1] = {$regex: filter[key1], $options: "i"};
	if (filter.certified_date) {
		var d1 = parseDate(filter.certified_date);
		if (d1 == null)
			res.json(invalidDateFormatMsg);
		else
			filter.certified_date = d1;
	}
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
					for (var i = 0; i < simpleProps.length; i++) {
						if (simpleProps[i] == 'licenses') {
							newObj.licenses = [];
							for (var j = 0; j < obj.licenses.length; j++) {
								var lic1 = {};
								var startDate = obj.licenses[j].start_date;
								var dueDate = obj.licenses[j].due_date;
								lic1.start_date = startDate.getDate() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getFullYear();
								lic1.due_date = (dueDate == null) ? null : (dueDate.getDate() + '.' + (dueDate.getMonth() + 1) + '.' + dueDate.getFullYear());
								lic1.license_number = obj.licenses[j].license_number;
								lic1.service_name = obj.licenses[j].service_name;
								newObj.licenses.push(lic1);
							}
						}
						else
							newObj[simpleProps[i]] = obj[simpleProps[i]];
					}
					var date1 = newObj.certified_date;
					newObj.certified_date = date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear();
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
											res.json(err);
										}
										else {
											var obj4 = {};
											for (var i = 0; i < simpleProps.length; i++) {
												if (simpleProps[i] == 'licenses') {
													for (var j = 0; j < obj3.licenses.length; j++) {
														var lic1 = {};
														var startDate = obj3.licenses[j].start_date;
														var dueDate = obj3.licenses[j].due_date;
														lic1.start_date = startDate.getDate() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getFullYear();
														lic1.due_date = (dueDate == null) ? null : (dueDate.getDate() + '.' + (dueDate.getMonth() + 1) + '.' + dueDate.getFullYear());
														lic1.license_number = obj3.licenses[j].license_number;
														lic1.service_name = obj3.licenses[j].service_name;
														obj4.licenses.push(lic1);
													}
												}
												else
													obj4[simpleProps[i]] = obj3[simpleProps[i]];
											}
											var date1 = obj3.certified_date;
											obj4.certified_date = date1.getDate() + '.' + (date1.getMonth() + 1) + '.' + date1.getFullYear();
											Individual.findById(obj3.manager, function(err, obj5) {
												if (err)
													res.send(err);
												else {
													obj4.manager_full_name = obj5.full_name;
													affiliates.push(obj4);
													getAffiliates(objIds);
												}
											});
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
		var d1 = parseDate(req.body.certified_date);
		if (d1 == null)
			res.json(invalidDateFormatMsg);
		else
			req.body.certified_date = d1;
	}
	LegalEntity.findById(req.body._id, function(err, obj) {
		if (err) {
			res.json(err);
		}
		if (obj == null) {
			res.json({"message": "Така фінансова установа не була знайдена", error: true});
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
								if (req.body[simpleProps[i]] != null) {
									if (simpleProps[i] != 'licenses')
										obj[simpleProps[i]] = req.body[simpleProps[i]];
									else {
										obj.licenses = [];
										for (var j = 0; j < req.body.licenses.length; j++) {
											var lic1 = {};
											lic1.start_date = parseDate(req.body.licenses[j].start_date);
											if (lic1.start_date == null)
												res.json(invalidDateFormatMsg);
											if (req.body.licenses[j].due_date == null)
												lic1.due_date = null;
											else {
												lic1.due_date = parseDate(req.body.licenses[j].due_date);
												if (lic1.due_date == null)
													res.json(invalidDateFormatMsg);
											}
											lic1.service_name = req.body.licenses[j].service_name;
											lic1.license_number = req.body.licenses[j].license_number;
											obj.licenses.push(lic1);
										}
									}
								}
							}
							obj.save(function(err) {
								if (err) {
									res.json(err);
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
							if (simpleProps[i] != 'licenses')
								obj[simpleProps[i]] = req.body[simpleProps[i]];
							else {
								obj.licenses = [];
								for (var j = 0; j < req.body.licenses.length; j++) {
									var lic1 = {};
									lic1.start_date = parseDate(req.body.licenses[j].start_date);
									if (lic1.start_date == null)
										res.json(invalidDateFormatMsg);
									if (req.body.licenses[j].due_date == null)
										lic1.due_date = null;
									else {
										lic1.due_date = parseDate(req.body.licenses[j].due_date);
										if (lic1.due_date == null)
											res.json(invalidDateFormatMsg);
									}
									lic1.service_name = req.body.licenses[j].service_name;
									lic1.license_number = req.body.licenses[j].license_number;
									obj.licenses.push(lic1);
								}
							}
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
		var d1 = parseDate(req.body.certified_date);
		if (d1 == null)
			res.json(invalidDateFormatMsg);
		else
			req.body.certified_date = d1;
	}
	console.log(req.body);
	var anyway = function() {
		LegalEntity.find(req.body, function(err, objs) {
			if (err)
				res.send(err);
			if (objs.length == 0)
				res.json({message: "Такі фінансові установи вже були видалені або ще не були створені"});
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
