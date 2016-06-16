function copyWithout(list, index) {
	var result = [];
	for (var i = 0; i < list.length; i++)
		if (i != index)
			result.push(list[i]);
	return result;
}

function notStrictEqualIndexOf(array, value) {
	return array.reduce(function(previousValue, currentValue, index, array) {return ((previousValue == -1) && (currentValue == value)) ? index : previousValue}, -1);
}

class OneLicenseEdit extends React.Component {
	constructor() {
		super();
	}
	render() {
		var elementId = this.props.id;
		var grenade = this;
		var mainEl = this.props.mainElement;
		return (
			<tr style={{"backgroundColor": "rgba(255, 255, 255, 0.33)"}}>
				<td>
					<div className="row">
					{
						licenseProps.map(function(item) {
							return (
								<div className={"col-md-" + ((item.field == "service_name") ? 5 : item.colspan * 2)}>
									<input type="text" className="form-control" id={elementId + "." + item.field} key={elementId + "." + item.field} placeholder={item.label}></input>
								</div>
							);
						})
					}
						<div className="col-md-1">
							<button type="button" className="btn btn-link" id={elementId + ".remove"} onClick={mainEl.removeLicenseEntry}>
								<span className="glyphicon glyphicon-minus"></span>
							</button>
						</div>
					</div>
				</td>
			</tr>
		)
	}
}

class LicensesEdit extends React.Component {
	constructor() {
		super();
	}
	render() {
		var grenade = this;
		var mainEl = this.props.mainElement;
		var licIds = mainEl.state.licensesFieldIds;
		var ctr = -1;
		return (
			<table className="table table-hover">
				<tbody>
					<tr>
						<td>
						<h3>
							Ліцензії
							<button type="button" className="btn btn-link" onClick={mainEl.addLicenseEntry}>
								<span className="glyphicon glyphicon-plus"></span>
							</button>
						</h3>
						</td>
					</tr>
					{
						licIds.map(function(id1) {
							ctr++;
							return (
								<OneLicenseEdit parent={grenade} id={id1} key={id1} mainElement={mainEl}/>
							);
						})
					}
				</tbody>
			</table>
		)
	}
}

class AffiliatesEdit extends React.Component {
	constructor() {
		super();
	}
	render() {
		var grenade = this;
		var mainEl = this.props.mainElement;
		var affIds = mainEl.state.affiliatesFieldIds;
		var ctr = -1;
		return (
		<table className="table table-hover">
			<tbody>
				<tr>
					<td>
						<h3>
							Відокремлені підрозділи
							<button type="button" className="btn btn-link" onClick={mainEl.addAffiliateEntry}>
								<span className="glyphicon glyphicon-plus"></span>
							</button>
						</h3>
					</td>
				</tr>
				{
					affIds.map(function(id1) {
						ctr++;
						return (
							<tr style={{"backgroundColor": "rgba(255, 255, 255, 0.33)"}}>
								<td>
									<div className="row">
										<div className="col-md-9">
											<input type="text" className="form-control" id={"a" + id1} key={"a" + id1} placeholder={"Повна назва"}></input>
										</div>
										<div className="col-md-1">
											<button type="button" className="btn btn-link" id={"a" + id1 + ".remove"} key={"a" + id1 + ".remove"} onClick={mainEl.removeAffiliateEntry}>
												<span className="glyphicon glyphicon-minus"></span>
											</button>
										</div>
									</div>
								</td>
							</tr>
						);
					})
				}
			</tbody>
		</table>
		);
	}
}

class EntityEdit extends React.Component {
	constructor() {
		super();
		this.state = {
			nextLicFieldId: 0,
			nextAffFieldId: 0,
			affiliatesFieldIds: [],
			licensesFieldIds: [],
		};
		this.addAffiliateEntry = this.addAffiliateEntry.bind(this);
		this.addLicenseEntry = this.addLicenseEntry.bind(this);
		this.finishEdit = this.finishEdit.bind(this);
		this.removeLicenseEntry = this.removeLicenseEntry.bind(this);
		this.removeAffiliateEntry = this.removeAffiliateEntry.bind(this);
	}
	componentWillMount() {
		var grenade = this;
		if (this.props.data != null) {
			var affiliates = this.props.data.affiliates;
			var licenses = this.props.data.licenses;
			var affCtr = 0;
			var licCtr = 0;
			for (var i = 0; i < affiliates.length; i++) {
				grenade.state.affiliatesFieldIds.push(affCtr);
				affCtr++;
			}
			grenade.setState({nextAffFieldId: affCtr});
			for (var i = 0; i < licenses.length; i++) {
				grenade.setState.licensesFieldIds.push(licCtr);
				licCtr++;
			}
			grenade.setState({nextLicFieldId: licCtr});
		}
	}
	componentDidMount() {
		if (this.props.data != null)
			for (var key1 in this.props.data) {
				var valueToSubmit = this.props.data[key1];
				var grenade = this;
				if (key1 == 'affiliates') {
					var ids = this.state.affiliatesFieldIds;
					for (var i = 0; i < ids.length; i++)
						document.getElementById("a" + ids[i]).value = this.props.data.affiliates[i].entity_name;
				}
			 	else if (key1 == 'licenses') {
					var ids = this.state.licensesFieldIds;
					for (var i = 0; i < ids.length; i++)
						for (var j = 0; j < licenseProps.length; j++)
							document.getElementById(ids[i] + "." + licenseProps[i].field).value = this.props.data.licenses[i][licenseProps[i]];
				}
				else if (key1 != '_id') {
					document.getElementById(key1).value = valueToSubmit;
				}
				var arg = {};
				arg[key1] = valueToSubmit;
				this.setState(arg);
			}
	}
	removeLicenseEntry(event) {
		var id = event.target.id.split(".")[0];
		var oldLicIds = this.state.licensesFieldIds;
		var ind = notStrictEqualIndexOf(oldLicIds, id);
		var newLicIds = copyWithout(oldLicIds, ind);
		this.setState({licensesFieldIds: newLicIds});
	}
	removeAffiliateEntry(event) {
		var id = event.target.id.split(".")[0].substr(1);
		var oldAffIds = this.state.affiliatesFieldIds;
		var ind = notStrictEqualIndexOf(oldAffIds, id);
		var newAffIds = copyWithout(oldAffIds, ind);
		this.setState({affiliatesFieldIds: newAffIds});
	}
	finishEdit(event) {
		var newData = {};
		for (var i = 0; i < simpleProps.length; i++) {
			var value1 = document.getElementById(simpleProps[i].field).value;
			if ((value1 == "") && (simpleProps[i].field != "phone") && (simpleProps[i].field != "email"))
				continue;
			else
				newData[simpleProps[i].field] = value1;
		}
		var newLicenses = [];
		for (var i = 0; i < this.state.licensesFieldIds.length; i++) {
			var license1 = {};
			for (var j = 0; j < licenseProps.length; j++) {
				var value1 = document.getElementById(this.state.licensesFieldIds[i] + "." + licenseProps[j].field).value;
				license1[licenseProps[j]] = (value1 == "") ? null : value1;
			}
			newLicenses.push(license1);
		}
		newData.licenses = newLicenses;
		var newAffiliates = [];
		for (var i = 0; i < this.state.affiliatesFieldIds.length; i++)
			newAffiliates.push(document.getElementById("a" + this.state.affiliatesFieldIds[i]).value);
		newData.affiliates = newAffiliates;
		this.props.stateController.finishEdit(event, newData);
	}
	addAffiliateEntry(event) {
		var newAffIds = this.state.affiliatesFieldIds.map(function(x) {return x;});
		newAffIds.push(this.state.nextAffFieldId);
		this.setState({nextAffFieldId: this.state.nextAffFieldId + 1, affiliatesFieldIds: newAffIds});
	}
	addLicenseEntry(event) {
		var newLicIds = this.state.licensesFieldIds.map(function(x) {return x;});
		newLicIds.push(this.state.nextLicFieldId);
		this.setState({nextLicFieldId: this.state.nextLicFieldId + 1, licensesFieldIds: newLicIds});
	}
	render() {
		var stateCtrl1 = this.props.stateController;
		var grenade = this;
		return (
			<div className="container">
				<h1 className="text-center">Редагування інформації про фінансову установу</h1>
				<div className="row" hidden={grenade.props.message == null}>
					<div className="col-md-12">
						<div className="alert alert-danger">
							{grenade.props.message}
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<table className="table table-hover table-bordered" style={{"backgroundColor": "rgba(255, 255, 255, 0.33)"}}>
							<tbody>
								{
									simpleProps.map(function(item1) {
										return (
											<tr>
												<td>
													<div className="row">
														<div className="col-md-3 col-sm-5">
															{item1.label}
															{((item1.field != 'phone') && (item1.field != 'email')) ? (<sup><span style={{color: "red"}}>{"*"}</span></sup>) : ""}
														</div>
														<div className="col-md-8 col-sm-6">
															<input type="text" className="form-control" id={item1.field} key={item1.field} placeholder={item1.label}>
															</input>
														</div>
													</div>
												</td>
											</tr>
										)
									})
								}
							</tbody>
						</table>
						<span>
							<sup><span style={{color: "red"}}>{"*"}</span></sup>
							{" - обов'язкові для заповнення поля"}
						</span>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<LicensesEdit mainElement={grenade}/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
						<AffiliatesEdit mainElement={grenade}/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-4 col-sm-6">
						<div className="btn-group">
							<button className="btn btn-warning" onClick={grenade.finishEdit}>Зберегти</button>
							<button className="btn btn-warning" onClick={stateCtrl1.goToCancel}>Скасувати</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
