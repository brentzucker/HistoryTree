//Gets History Items
function getHistory(query){
	chrome.history.search({text: query, startTime: 1436208042000, maxResults: 10000}, function(history_items){
		
		//Place in DOM
		historyItemsToDOM(history_items);

		//Gets visits
	 	var start_time = 1436208042000;
	 	getVisits(history_items, start_time);
	});
};

//Get Visit Items
function getVisits(array_of_history_item_results, start_time){
	
	//Build urls array
	var urls = [];
	for (var i = array_of_history_item_results.length - 1; i >= 0; i--) {

		var history_item = array_of_history_item_results[i];

		if (typeof history_item !== 'undefined') {
			urls.push(history_item.url);
		}
	};

	var all_visited_items = [];

	//Function to recurse for each url
	function recurse(idx) {
		chrome.history.getVisits({ url:urls[idx] }, function(visit_items){

			for (var j = 0; j < visit_items.length; j++) {

				var visit_item = visit_items[j];

				if (typeof visit_item !== 'undefined') {

					//Visits after start_time
					if (start_time > visit_item.visitTime) {
						all_visited_items.push(visit_item);
					}

				}
			}

			//There's more to recurse
			if (idx + 1 < urls.length) {
				recurse(idx + 1);
			} 

			//ALL DONE! all_visited_items is complete
			else {
				console.log(all_visited_items);
			}
		});
	}
	recurse(0);
};

/* Helper functions
 *
 */

function historyItemToString(history_item){
	var link = history_item.url;
	var time = millisecondsToDateTimeString(history_item.lastVisitTime);
	var name = history_item.title;
	var id = history_item.id;
	var link_text = time + '  -  ' + link + '  -  ' + id;
	return link_text;
};

function historyItemsToDOM(history_items) {
	var ul = document.getElementById('list');

	for (var i=0; i<history_items.length; i++) {

		var history_item = history_items[i];
		var link_text = historyItemToString(history_item);
		var a = buildLink(link_text, history_item.url);

	 	var li = document.createElement('li');
	 	li.appendChild(a);
	 	ul.appendChild(li);
	}
}

function buildLink(link_text, url){
	var a = document.createElement('a');
	a.innerHTML = link_text;
	a.href = url;
	a.target = '_blank';
	return a;
};

function millisecondsToDateTimeString(milliseconds){
	var date_time = new Date(milliseconds);
	return date_time.toLocaleDateString() + ' ' + date_time.toLocaleTimeString();

};

/* "Main method"
 *
 */

document.addEventListener('DOMContentLoaded', function() {
	
	var url = '';
	var start_time = (new Date('2015-07-07')).getTime();

	getHistory(url);

	// getHistoryItems(url, start_time);


	//getVisits(url);

	console.log('done');
});