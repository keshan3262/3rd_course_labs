class SearchWidget extends React.Component {
	constructor() {
		super();
		this.state = {filter: {}};
		this.textChanged = this.textChanged.bind(this);
		this.search = this.search.bind(this);
	}
	textChanged(event) {
		if (event.target.value == "")
			delete this.state.filter[event.target.id];
		else
			this.state.filter[event.target.id] = event.target.value;
	}
	search(event) {
		this.props.stateController.search(this.state.filter, event);
	}
	render() {
		var data1 = this.props.data;
		var msg1 = this.props.message;
		var stateCtrl1 = this.props.stateController;
		var grenade = this;
		var requestProcessed = this.props.requestProcessed;
		return (
			<div>
				<form role="form">
					{
						searchFields.map(function(item) {
							var spanCtr = 0;
							return (
								<div className="row">
								{
									item.map(function(subitem) {
										if ("button" in subitem)
											return (
												<div className={"col-md" + (12 - spanCtr)}>
													<button className="btn btn-success" onClick={grenade.search}>
														{subitem.button}
													</button>
												</div>
											);
										else {
											spanCtr += subitem.colspan;
											return (
												<div className={"col-md-" + subitem.colspan}>
													<input type="text" className="form-control" placeholder={subitem.label} id={subitem.field} onChange={grenade.textChanged}></input>
												</div>
											);
										}
									})
								}
								</div>
							);
						})
					}
				</form>
				<hr/>
				<div className="row" hidden={(msg1 == null)}>
					<div className="col-md-12">
						<div className="alert alert-danger">
							{msg1}
						</div>
					</div>
				</div>
				<ObjectsDataWrapper data={data1} stateController={stateCtrl1} noneString="Жодної установи за Вашим запитом не знайдено" requestProcessed={requestProcessed}/>
			</div>
		)
	}
}

class MainPageElement extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		var msg1 = this.props.message;
		var stateCtrl1 = this.props.stateController;
		var grenade = this;
		var requestProcessed = this.props.requestProcessed;
		return (
			<div>
				<div className="container">
					<div className="row">
						<div className="text-center col-md-12">
							<h1 className="text-center">Фінансові установи</h1>
						</div>
					</div>
					<hr/>
				</div>
				<div className="container">
					<div className="row">
						<div className="col-md-12">
							<a className="btn btn-primary btn-block" role="button" onClick={stateCtrl1.goToCreate}>Додати фінансову установу</a>
						</div>
					</div>
					<hr/>
					<SearchWidget data={data1} message={msg1} stateController={stateCtrl1} requestProcessed={requestProcessed}/>
				</div>
			</div>
		)
	}
}
