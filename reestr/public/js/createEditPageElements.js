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
		var data1 = this.props.data;
		return (
			<tr>
			{
				licenseProps.map(function(item) {
					return (
						<td colSpan={item.colspan}>
							<input type="text" className="form-control" id={elementId + "." + item.field} placeholder={item.label} onChange={mainEl.licenseValueChanged} value={(data1 != null) ? data1[item.field] : ""}></input>
						</td>
					);
				})
			}
				<td>
					<button type="button" className="btn btn-link" id={elementId + ".remove"} onClick={mainEl.removeLicenseEntry}>
						<span className="glyphicon glyphicon-minus"></span>
					</button>
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
		var lic1 = mainEl.state.licenses;
		var licIds = mainEl.state.licensesFieldIds;
		var ctr = -1;
		return (
			<table className="table">
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
						lic1.map(function(i1) {
							ctr++;
							return (
								<OneLicenseEdit parent={grenade} id={licIds[ctr]} mainElement={mainEl} data={i1}/>
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
		var aff1 = mainEl.state.affiliates;
		var affIds = mainEl.state.affiliatesFieldIds;
		var ctr = -1;
		return (
		<table className="table">
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
					aff1.map(function(i1) {
						ctr++;
						return (
							<tr>
								<td>
									<input type="text" className="form-control" id={"a" + affIds[ctr]} placeholder={"Повна назва"} onChange={mainEl.affiliateValueChanged} value={(i1 == null) ? "" : i1}></input>
								</td>
								<td>
									<button type="button" className="btn btn-link" id={"a" + affIds[ctr] + ".remove"} onClick={mainEl.removeAffiliateEntry}>
										<span className="glyphicon glyphicon-minus"></span>
									</button>
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
			licenses: [],
			affiliates: []
		};
		for (var i = 0; i < simpleProps.length; i++)
			this.state[simpleProps[i].field] = null;
		this.simplePropChanged = this.simplePropChanged.bind(this);
		this.addAffiliateEntry = this.addAffiliateEntry.bind(this);
		this.addLicenseEntry = this.addLicenseEntry.bind(this);
		this.licenseValueChanged = this.licenseValueChanged.bind(this);
		this.affiliateValueChanged = this.affiliateValueChanged.bind(this);
		this.finishEdit = this.finishEdit.bind(this);
		this.removeLicenseEntry = this.removeLicenseEntry.bind(this);
		this.removeAffiliateEntry = this.removeAffiliateEntry.bind(this);
	}
	componentWillMount() {
		if (this.props.data != null)
			for (var key1 in this.props.data) {
				var valueToSubmit = this.props.data[key1];
				if (key1 == 'affiliates')
					valueToSubmit = this.props.data[key1].map(function(item1) {
						this.setState({nextAffFieldId: this.state.nextAffFieldId + 1});
						return item1.entity_name;
					});
				if (key1 == 'licenses')
					this.props.data[key1].map(function(item1) {this.setState({nextLicFieldId: this.state.nextLicFieldId + 1})});
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
		var oldLicenses = this.state.licenses;
		var newLicenses = copyWithout(oldLicenses, ind);
		this.setState({licensesFieldIds: newLicIds, licenses: newLicenses});
	}
	removeAffiliateEntry(event) {
		var id = event.target.id.split(".")[0].substr(1);
		var oldAffIds = this.state.affiliatesFieldIds;
		var ind = notStrictEqualIndexOf(oldAffIds, id);
		var newAffIds = copyWithout(oldAffIds, ind);
		var oldAffiliates = this.state.affiliates;
		var newAffiliates = copyWithout(oldAffiliates, ind);
		this.setState({affiliatesFieldIds: newAffIds, affiliates: newAffiliates});
	}
	finishEdit(event) {
		var licenses = this.state.licenses;
		var newLicenses = [];
		licenses.map(function(item) {if (item != null) newLicenses.push(item)});
		var affiliates = this.state.affiliates;
		var newAffiliates = [];
		affiliates.map(function(item) {if (item != null) newAffiliates.push(item)});
		this.setState({licenses: newLicenses, affiliates: newAffiliates});
		var newData = {};
		var forbiddenKeys = ["nextLicFieldId", "nextAffFieldId", "affiliatesFieldIds", "licensesFieldIds"];
		for (var key1 in this.state)
			if (forbiddenKeys.indexOf(key1) == -1) {
				if ((this.state[key1] == null) && (key1 != 'phone') && (key1 != 'email'))
					continue;
				else
					newData[key1] = this.state[key1];
			}
		this.props.stateController.finishEdit(event, newData);
	}
	simplePropChanged(event) {
		var newData = {};
		newData[event.target.id] = (event.target.value == "") ? null : event.target.value;
		this.setState(newData);
	}
	addAffiliateEntry(event) {
		var newAffIds = this.state.affiliatesFieldIds.map(function(x) {return x;});
		newAffIds.push(this.state.nextAffFieldId);
		var newAffiliates = this.state.affiliates.map(function(x) {return x;});
		newAffiliates.push(null);
		this.setState({nextAffFieldId: this.state.nextAffFieldId + 1, affiliatesFieldIds: newAffIds, affiliates: newAffiliates});
	}
	addLicenseEntry(event) {
		var newLicIds = this.state.licensesFieldIds.map(function(x) {return x;});
		newLicIds.push(this.state.nextLicFieldId);
		var newLicenses = this.state.licenses.map(function(x) {return x;});
		newLicenses.push(null);
		this.setState({nextLicFieldId: this.state.nextLicFieldId + 1, licensesFieldIds: newLicIds, licenses: newLicenses});
	}
	licenseValueChanged(event) {
		var args1 = event.target.id.split(".");
		var ind = notStrictEqualIndexOf(this.state.licensesFieldIds, args1[0]);
		var oldLicenses = this.state.licenses;
		var newLicenses = oldLicenses.map(function(x) {return x;});
		if (newLicenses[ind] == null)
			newLicenses[ind] = {};
		newLicenses[ind][args1[1]] = (event.target.value == "") ? null : event.target.value;
		this.setState({licenses: newLicenses});
	}
	affiliateValueChanged(event) {
		var args1 = event.target.id.substr(1);
		var ind = notStrictEqualIndexOf(this.state.affiliatesFieldIds, args1);
		var oldAffiliates = this.state.affiliates;
		var newAffiliates = oldAffiliates.map(function(x) {return x;});
		newAffiliates[ind] = (event.target.value == "") ? null : event.target.value;
		this.setState({affiliates: newAffiliates});
	}
	render() {
		var data1 = this.state;
		var stateCtrl1 = this.props.stateController;
		var grenade = this;
		return (
			<div className="container">
				<h1 className="text-center">Редагування інформації про фінансову установу</h1>
				<div className="row">
					<div className="col-md-12">
							<table className="table table-striped table-bordered">
								<tbody>
									{
										simpleProps.map(function(item1) {
											return (
												<tr>
													<td>
														<div className="row">
															<div className="col-md-3 col-sm-5">
																{item1.label}
															</div>
															<div className="col-md-8 col-sm-6">
																<input type="text" className="form-control" id={item1.field} placeholder={item1.label} onChange={grenade.simplePropChanged} value={((data1 != null) && (data1[item1.field] != null)) ? data1[item1.field] : ""}>
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
