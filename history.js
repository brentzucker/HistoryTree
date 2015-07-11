function getHistory(url){
	query = url;
	chrome.history.search({text: query}, function(array_of_history_item_results){

		var ul = document.getElementById('list');

		for(var i=0; i<array_of_history_item_results.length; i++){
			var history_item = array_of_history_item_results[i];

			var link_text = historyItemToString(history_item);

			var a = buildLink(link_text, history_item.url);

		 	var li = document.createElement('li');
		 	li.appendChild(a);
		 	ul.appendChild(li);

		 	//Gets visits 
		 	getVisits(history_item.url);
		}
		//How can I return from here?
		return array_of_history_item_results;	
	});
};

function getVisits(url_input){
	var ul = document.getElementById('list');

	chrome.history.getVisits({url:url_input}, function(array_of_visit_item_results){

		for(var j=0; j<array_of_visit_item_results.length; j++){
			visit_item = array_of_visit_item_results[j];
			//console.log(visit_item);

			for (var property in visit_item){
				if(visit_item.hasOwnProperty(property)){

					var output_string = property + ' : ' + visit_item[property];

					var li = document.createElement('li');
					li.appendChild(document.createTextNode(output_string));
					ul.appendChild(li);
				}
			}			
		}
	});
};

function visitNode(visit_item) {

	//Copy VisitItem attributes
	this.id = visit_item.id;
	this.visitId = visit_item.visitId;
	this.visitTime = visit_item.visitTime;
	this.referringVisitId = visit_item.referringVisitId;
	this.transition = visit_item.transition;

	this.children = [];

	this.addChild = function(new_child) {
		this.children.push(new_child)
	};
}

function getHistoryItems(url, start_time) {
	
	var all_visited_items = [];
	chrome.history.search({text: url, startTime : start_time}, function(history_items) {
		
		//loop through all history items, get each array for visited items
		for (var i = 0; i < history_items.length; i++) {

			var url_to_retrieve = history_items[i].url;

			chrome.history.getVisits({ url : url_to_retrieve }, function(visit_items) {

				for (var j = 0; j < visit_items.length; j++) {
					
					visit_item = visit_items[j]

					//If the visit occurred after the given start date and is defined
					if (visit_item !== undefined) {

						if (start_time < visit_item.visitTime) {

							all_visited_items.push(visit_item);
						}
					}
				}
			});
		}

		console.log('All visited items');
		console.log(all_visited_items);

		//Tree of visit items

		treeNodes_list = [];

		for (var item in all_visited_items) {

			console.log(item);
		}

		for (var j = 0; j < all_visited_items.length; j++) {

			var visit_item = all_visited_items[j];
			var helper_node = new visitNode(visit_item);

			treeNodes_list.push(helper_node);

			console.log(treeNodes_list);
		}

		console.log('Tree Nodes List');
		console.log(treeNodes_list);

		//Remove all Roots from all_visited_items
		//A visited_item is a root if its refferingId = 0
	});
}

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

	//var array_of_history_items = getHistory(url);

	getHistoryItems(url, start_time);


	//getVisits(url);

	console.log('done');
});