class StatsView extends React.Component {
	constructor() {
		super();
	}
	componentDidMount() {
		var data1 = this.props.data;
		console.log("Data in properties: " + data1);
		var pie1Data = [], pie2Data = [], graph1Data = [];
		for (var key1 in data1.serviceTypeStats)
			pie1Data.push({key: key1, value: data1.serviceTypeStats[key1]});
		for (var key2 in data1.entityTypeStats)
			pie2Data.push({key: key2, value: data1.entityTypeStats[key2]});
		var dict1 = data1.certifiedDateStats.yearly.data;
		for (var i = data1.certifiedDateStats.yearly.minYear; i <= (new Date()).getFullYear(); i++)
			graph1Data.push({key: i, value: (i in dict1) ? dict1[i] : 0});
		console.log("pie1Data: " + pie1Data);
		console.log("pie2Data: " + pie2Data);
		console.log("graph1Data" + graph1Data);
		d3.select("#total").append("p").text("Усього " + data1.entitiesCount + " фінансових установ та " + data1.affiliatesCount + " відокремлених підрозділів");
		for (var i = 0; i < pie1Data.length; i++)
			d3.select("#service").append("tr").html("<td>" + pie1Data[i].key + "</td><td>" + pie1Data[i].value + "</td>");
		for (var i = 0; i < pie2Data.length; i++)
			d3.select("#entity_type").append("tr").html("<td>" + pie2Data[i].key + "</td><td>" + pie2Data[i].value + "</td>");
		for (var i = 0; i < graph1Data.length; i++)
			d3.select("#certified_date").append("tr").html("<td>" + graph1Data[i].key + "</td><td>" + graph1Data[i].value + "</td>");
	}
	render() {
		return (
			<div className="container">
			<table className="table">
				<tbody>
					<tr>
						<td id="total"></td>
					</tr>
					<tr>
						<td>
							<h2 className="text-center">Кількість фінансових установ за видом послуги</h2>
							<table className="table">
								<tbody id="service"></tbody>
							</table>
						</td>
					</tr>
					<tr>
						<td>
							<h2 className="text-center">Кількість фінансових установ за роком сертифікації</h2>
							<table className="table">
								<tbody id="certified_date"></tbody>
							</table>
						</td>
					</tr>
					<tr>
						<td>
							<h2 className="text-center">Кількість фінансових установ за їхнім типом</h2>
							<table className="table">
								<tbody id="entity_type"></tbody>
							</table>
						</td>
					</tr>
				</tbody>
			</table>
			</div>
		);
	}
}
