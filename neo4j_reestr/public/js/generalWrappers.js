const searchFields = [
	[
		{label: "Повне найменування", field: "entity_name", colspan: 6},
		{label: "Тип установи", field: "entity_type", colspan: 3},
		{label: "Вид послуги", field: "service_type", colspan: 3},
	],
	[
		{label: "Код за ЄДРПОУ", field: "edrpou", colspan: 2},
		{label: "ПІБ керівника", field: "manager_full_name", colspan: 4},
		{label: "Серія та номер сертифіката", field: "certificate", colspan: 3},
		{label: "Дата сертифікації", field: "certified_date", colspan: 2},
		{button: "Пошук", colspan: 2}
	]
];

var sum = 0;
for (var i = 0; i < searchFields.length; i++)
	for (var j = 0; j < searchFields[i].length; j++)
		sum += searchFields[i][j].colspan;

class OneObjDataWrapper extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		var stateCtrl1 = this.props.stateController;
		return (
			<tr>
				{
					searchFields.map(function(item) {
						return (
							item.map(function(subitem) {
								if (!("button" in subitem))
									return (
										<td colSpan={Math.round(subitem.colspan / sum * 12)} key={data1._id + "." + subitem.field}>
										{
											(subitem.field == 'certificate') ? (data1.certificate_series + ' ' + data1.certificate_number) : data1[subitem.field]
										}
										</td>
									);
							})
						)
					})
				}
				<td>
					<a className="btn btn-default" role="button" id={data1._id} onClick={stateCtrl1.goToView}>
						Переглянути
					</a>
				</td>
			</tr>
		);
	}
}

class ObjectsDataWrapper extends React.Component {
	constructor() {
		super();
	}
	render() {
		var data1 = this.props.data;
		var stateCtrl1 = this.props.stateController;
		var noneString = this.props.noneString;
		var requestProcessed = this.props.requestProcessed;
		var simple = this.props.simple;
		return (
			<table className="table table-striped table-responsive">
				<tbody>
					<tr rowSpan="2">
					{
						searchFields.map(function(item) {
							if ((item.field != "manager_full_name") || (simple != undefined))
								return (
									item.map(function(subitem) {
										return (<td colSpan={Math.round(subitem.colspan / sum * 12)} key={subitem.label}>{subitem.label}</td>)
									})
								)
						})
					}
					</tr>
					<tr hidden={(data1.length != 0) || !requestProcessed}>
						<td colSpan="12" style={{textAlign: "center"}}>{noneString}</td>
					</tr>
					{
						data1.map(function(i1) {
							return (
								<OneObjDataWrapper key={i1._id + "Wrapper"} stateController={stateCtrl1} data={i1} />
							);
						})
					}
				</tbody>
			</table>
		)
	}
}
