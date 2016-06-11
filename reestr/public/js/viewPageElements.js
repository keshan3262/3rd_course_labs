const simpleProps = [
	{field: "entity_name", label: "Повне найменування"},
	{field: "entity_type", label: "Тип установи"},
	{field: "edrpou", label: "Код за ЄДРПОУ"},
    {field: "certificate_series", label: "Серія сертифіката"},
    {field: "certificate_number", label: "Номер сертифіката"},
    {field: "certified_date", label: "Дата сертифікації"},
    {field: "address", label: "Адреса"},
    {field: "phone", label: "Телефон"},
    {field: "email", label: "Адреса електронної пошти"},
	{field: "service_type", label: "Вид послуги"},
	{field: "manager_full_name", label: "ПІБ керівника"}
];

const licenseProps = [
	{field: "start_date", label: "Дата початку дії", colspan: 1},
    {field: "license_number", label: "Номер ліцензії", colspan: 1},
    {field: "service_name", label: "Ліцензована діяльність", colspan: 3},
    {field: "due_date", label: "Дата кінця дії", colspan: 1}
];

class OneLicenseView extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		return (
			<tr>
			{
				licenseProps.map(function(item) {
					var value1 = data1[item.field];
					if (item.field == "due_date") {
						if (value1 == null)
							return <td>-</td>;
						else
							return (
								<td>{value1}</td>
							)
					}
					else
						return (
							<td>{value1}</td>
						)
				})
			}
			</tr>
		)
	}
}

class LicensesView extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		return (
			<table className="table table-striped">
				<tbody>
					<tr>
					{
						licenseProps.map(function(item) {
							return (
								<td>{item.label}</td>
							)
						})
					}
					</tr>
					<tr hidden={data1.length != 0}>
						<td colSpan="4" style={{textAlign: "center"}}>Нема ліцензій</td>
					</tr>
					{
						data1.map(function(i1) {
							return (
								<OneLicenseView key={i1._id + "Wrapper"} data={i1} />
							);
						})
					}
				</tbody>
			</table>
		)
	}
}

class EntityView extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		var stateCtrl1 = this.props.stateController;
		return (
			<div className="container">
				<h1 className="text-center">Інформація про фінансову установу</h1>
				<table>
					<tbody>
						<tr><td>
							<table className="table table-striped">
								<tbody>
									{
										simpleProps.map(function(item1) {
											return (
												<tr>
													<td>{item1.label}</td>
													<td>{data1[item1.field]}</td>
												</tr>
											)
										})
									}
								</tbody>
							</table>
						</td></tr>
						<tr><td><h3>Ліцензії</h3></td></tr>
						<tr><td>
							<LicensesView data={data1.licenses} />
						</td></tr>
						<tr><td><h3>Відокремлені підрозділи</h3></td></tr>
						<tr><td>
							<ObjectsDataWrapper data={data1.affiliates} stateController={stateCtrl1} noneString="Нема відокремлених підрозділів" requestProcessed={true} simple={true}/>
						</td></tr>
						<tr>
							<td>
								<div class="btn-group">
									<button className="btn btn-warning" onClick={stateCtrl1.goToEdit}>Редагувати</button>
									<button className="btn btn-danger" onClick={stateCtrl1.goToDelete}>Видалити</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}
}
