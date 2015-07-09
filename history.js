function getHistory(){
	query = '';
	chrome.history.search({text: query}, function(array_of_history_item_results){

	var ul = document.getElementById('list');
		console.log(array_of_history_item_results);

		for(var i=0; i<array_of_history_item_results.length; i++){
			var history_item = array_of_history_item_results[i];

			var link = history_item.url;
			var time = millisecondsToDateTimeString(history_item.lastVisitTime);
			var name = history_item.title;
			var id = history_item.id;
			var link_text = time + '  -  ' + name + '  -  ' + id;

			var a = document.createElement('a');
			a.innerHTML = link_text;
			a.href = link;

		 	var li = document.createElement('li');
		 	li.appendChild(a);
		 	ul.appendChild(li);
		}		
	});
};

function millisecondsToDateTimeString(milliseconds){
	var date_time = new Date(milliseconds);
	return date_time.toLocaleDateString() + ' ' + date_time.toLocaleTimeString();

};

document.addEventListener('DOMContentLoaded', function() {
	console.log('Hello World');
	getHistory();
	console.log('done');
});

