var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var odessaMethods = require("./odessa_methods");

var routes = require('./routes/index');
var users = require('./routes/users');

var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost/reestr');

//var Affiliate =				require("./models/affiliate");
var Certificate =			require("./models/certificate");
var DataChangeDocPack =		require("./models/data_change_doc_pack");
var DepartmentWorker =		require("./models/department_worker");
var Individual = 			require("./models/individual");
var LegalEntity =			require("./models/legal_entity");
var License =				require("./models/license");
var RegistrationDocPack =	require("./models/registration_doc_pack");
var RemoveDocPack =			require("./models/remove_doc_pack");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var routesConfig = [
	/*{
        address: '/affiliate', class1: Affiliate, nick: "Affiliate",
		parameters: [
            "affiliate_name",
            "address",
            {"name": "parent_entity_id", "class": LegalEntity, "values": ["name"]}
        ],
        keys: ["affiliate_name"]
    },*/
	{
        address: '/certificate', class1: Certificate, nick: "Certificate",
		parameters: [
            {"name": "legal_entity_id", "class": LegalEntity, "values": ["name"]},
            "certified_date"
        ],
        keys: ["legal_entity_id"]
    },
	{
        address: '/data_change_doc_pack', class1: DataChangeDocPack,
        nick: "Data change documents pack",
		parameters: [
            {"name": "certificate_id", "class": Certificate, "values": []},
            "changes_info",
            {"name": "checked_by_id", "class": DepartmentWorker,
                "values": ["name", "surname", "fathername"]
            }
        ],
        keys: null
    },
	{
        address: '/department_worker', class1: DepartmentWorker, nick: "Department worker",
		parameters: ["name", "surname", "fathername", "address"],
        keys: ["name", "surname", "fathername"]
    },
	{
        address: '/individual', class1: Individual, nick: "Individual",
		parameters: [
            "card_number", "name", "surname", "fathername",
            {"name": "roles", "class": "array", "values": [
                    {"name": "legal_entity_id", "class": LegalEntity, "values": ["name"]},
                    "description"
                ]
            }
        ],
        keys: ["name", "surname", "fathername"]
    },
	{
        address: '/legal_entity', class1: LegalEntity, nick: "Legal entity",
		parameters: [
            "name", "address", "statutory_capital",
            {"name": "manager", "class": Individual, "values": ["surname", "name", "fathername"]},
            {"name": "certificate_id", "class": Certificate, "values": []},
            {"name": "accounter", "class": Individual, "values": ["name", "surname", "fathername"]},
            "record_creation_time", "removal_query_time",
            {"name": "services", "class": "array", "values": ["service_name"]},
            {"name": "affiliates", "class": "array", "values": [
                    {"name": "legal_entity_id", "class": LegalEntity, "values": ["name"]}
                ]
            }
        ],
        keys: ["name"]
    },
    {
        address: '/license', class1: License, nick: "License",
        parameters: [
            "license_number", "purpose", "issue_date",
            {"name": "owner", "class": LegalEntity, values: ["name"]}
        ],
        keys: null
    },
    {
        address: '/registration_doc_pack', class1: RegistrationDocPack,
        nick: "Registration document packet",
        parameters: [
            "card_id", "application", "legal_entity_data",
            {"name": "checked_by", "class": DepartmentWorker,
                "values": ["name", "surname", "fathername"]
            },
            {"name": "certificate_given", "class": Certificate, "values": ["notnull"]}
        ],
        keys: null
    },
    {
        address: '/remove_doc_pack', class1: RemoveDocPack,
        nick: "Removal document packet",
        parameters: [
            "application", "message_in_massmedia",
        	{"name": "certificate", "class": Certificate, "values": []},
        	{"name": "checked_by", "class": DepartmentWorker,
                values: ["name", "surname", "fathername"]
            },
        	"removal_date"
        ],
        keys: null
    }
];

for (var i = 0; i < routesConfig.length; i++)
	router.route(routesConfig[i].address)
		.post(createPost(routesConfig[i].class1, routesConfig[i].nick, routesConfig[i].parameters))
		.get(createGetAll(routesConfig[i].class1));

for (var i = 0; i < filtersAddresses.length; i++) {
	router.route(filtersAddresses[i].address)
		.get(createGetByFilter(filtersAddresses[i].class1, filtersAddresses[i].parameters))
		.put(createPutByFilter(filtersAddresses[i].class1, filtersAddresses[i].parameters,
			filtersAddresses[i].putp, filtersAddresses[i].nick))
		.delete(createDeleteByFilter(filtersAddresses[i].class1, filtersAddresses[i].parameters));
}

for (var i = 0; i < routesConfig.length; i++)
	router.route(routesConfig[i].address + "/:_id")
		.get(createGetById(routesConfig[i].class1, "_id"))
		.put(createPutById(routesConfig[i].class1, "_id", routesConfig[i].parameters, routesConfig[i].nick))
		.delete(createDeleteByFilter(routesConfig[i].class1, ["_id"]));

module.exports = app;
