var request = window.superagent;

NavState = {Main: 0, View: 1, Edit: 2, OnlyMessage: 3, Create: 4};

class Body extends React.Component {
	constructor() {
		super();
		this.state = {
			message: null,
			institutions: [],
			state: NavState.Main,
			requestProcessed: false
		};
		this.search = this.search.bind(this);
		this.goToView = this.goToView.bind(this);
		this.goToEdit = this.goToEdit.bind(this);
		this.goToDelete = this.goToDelete.bind(this);
		this.goToCreate = this.goToCreate.bind(this);
		this.goToMessage = this.goToMessage.bind(this);
		this.changeDeleteState = this.changeDeleteState.bind(this);
		this.changeSearchState = this.changeSearchState.bind(this);
		this.resetState = this.resetState.bind(this);
		this.goToCancel = this.goToCancel.bind(this);
		this.finishEdit = this.finishEdit.bind(this);
	}
	resetState(event) {
		this.setState(
			{
				message: null,
				institutions: [],
				state: NavState.Main,
				requestProcessed: false
			}
		);
	}
	finishEdit(event, objNewData) {
		event.preventDefault();
		if (this.state.state == NavState.Edit) {
			objNewData._id = this.state.id;
			request.put("/legal_entity_json/").set('Cookie', null).send(objNewData).end(this.goToMessage);
		}
		else {
			request.post("/legal_entity_json/").set('Cookie, null').send(objNewData).end(this.goToMessage);
		}
	}
	changeSearchState(err, res) {
		if (err || !res.ok) {
			console.log(err);
			alert("Не вдалося обробити запит");
		}
		else {
			var newState = {
				message: null,
				institutions: [],
				requestProcessed: true
			};
			if ("message" in res.body)
				newState.message = res.body.message;
			else
				newState.institutions = res.body;
			this.setState(newState);
		}
	}
	search(filterAsObj, event) {
		event.preventDefault();
		var ctr1 = 0;
		for (var p1 in filterAsObj)
			ctr1++;
		if (ctr1 == 0)
			return;
		if (filterAsObj.certified_date != null) {
			var x1 = filterAsObj.certified_date.split('.');
			if (x1.length != 3) {
				this.setState({institutions: [], message: "Неправильний формат дати. Правильний: ДД.ММ.РРРР", requestProcessed: true});
				return;
			}
			else {
				var valid = true;
				for (var i = 0; i < 3; i++)
					valid &= !(isNaN(x1[i] * 0));
				if (!valid) {
					this.setState({institutions: [], message: "Неправильний формат дати. Правильний: ДД.ММ.РРРР", requestProcessed: true});
					return;
				}
			}
		}
		var str = "/legal_entity_json/";
		if ("_id" in filterAsObj)
			str += filterAsObj._id;
		else {
			for (var key1 in filterAsObj) {
				if (key1 == "certificate") {
					var g1 = filterAsObj[key1].split(" ");
					str += "certificate_series=" + g1[0] + "&";
					str += "certificate_number=" + g1[1] + "&";
				}
				else
					str += key1 + "=" + filterAsObj[key1] + "&";
			}
			str = str.substring(0, str.length - 1);
		}
		request.get(str).set('Cookie', null).end(this.changeSearchState);
	}
	goToCancel(event) {
		if (confirm("Увага! Зміни не будуть збережені! Продовжити?")) {
			this.resetState(event);
		}
	}
	goToView(event) {
		this.search({_id: event.target.id}, event);
		this.setState({id: event.target.id, state: NavState.View});
	}
	goToEdit(event) {
		this.search({_id: this.state.id}, event);
		this.setState({state: NavState.Edit});
	}
	goToDelete(event) {
		if (confirm("Видалити запис про фінансову установу?")) {
			event.preventDefault();
			request.del("/legal_entity_json/").set('Cookie', null).send({
				"_id": this.state.id
			}).end(this.changeDeleteState);
		}
	}
	changeDeleteState(err, res) {
		if (err || !res.ok) {
			console.log(err);
			alert("Не вдалося обробити запит");
		}
		else {
			this.setState({state: NavState.OnlyMessage, message: res.body.message, institutions: []});
		}
	}
	goToMessage(err, result) {
		if (err || !result.ok) {
			console.log(err);
			alert("Не вдалося обробити запит");
		}
		else
			this.setState({state: NavState.OnlyMessage, message: result.body.message, institutions: []});
	}
	goToCreate(event) {
		this.setState({state: NavState.Create, institutions: [], id: null});
	}
	render() {
		var grenade = this;
		var message = this.state.message;
		return (
		<div>
			<nav className="navbar navbar-default">
				<div className="container-fluid">
					<div className="navbar-header">
						<button className="btn navbar-brand btn-link" onClick={grenade.resetState}>Головна</button>
					</div>
					<div className="nav navbar-nav">
						<button className="btn navbar-brand btn-link" onClick={grenade.resetState}>Фінансові установи</button>
					</div>
				</div>
			</nav>
			{
				[grenade.state.state].map(function(item1) {
					switch (grenade.state.state) {
						case NavState.Main: {
							return (<MainPageElement msg1={null} stateController={grenade} data={grenade.state.institutions} requestProcessed={grenade.state.requestProcessed} message={grenade.state.message}/>);
							break;
						}
						case NavState.View: {
							return (<EntityView stateController={grenade} data={grenade.state.institutions[0]} />);
							break;
						}
						case NavState.Create: case NavState.Edit: {
							return (<EntityEdit stateController={grenade} data={(item1 == NavState.Edit) ? grenade.state.institutions[0] : null} />);
							break;
						}
						default: {
							return (
								<div className="container">
									<div className="row">
										<div className="text-center col-md-12">
											<h2 className="text-center">{message}</h2>
										</div>
									</div>
									<hr/>
								</div>
							);
							break;
						}
					}
				})
			}
			<div className="container">
				<div className="row">
					<div className="text-center col-md-6 col-md-offset-3">
						<p>
							Copyright &copy; 2016 &middot; All Rights Reserved &middot;
							<button className="btn btn-link" onClick={grenade.resetState}>Державний реєстр фінансових установ</button>
						</p>
					</div>
				</div>
				<hr/>
			</div>
		</div>
		);
	}
}

ReactDOM.render(<Body />, document.getElementById('mount-point'));
