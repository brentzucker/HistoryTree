//Gets History Items
function getHistory(query, start_time) {
    
    chrome.history.search({text: query, startTime: start_time, maxResults: 10000}, function(history_items) {
        
        //Place in DOM
        historyItemsToDOM(history_items);

        //Gets visits
        getVisits(history_items, start_time);
    });
}

//Get Visit Items
function getVisits(array_of_history_item_results, start_time){
    
    //Build urls array
    var urls = [];
    var url_array = [];
    for (var i = array_of_history_item_results.length - 1; i >= 0; i--) {

        var history_item = array_of_history_item_results[i];

        if (typeof history_item !== 'undefined') {
        	url_array[history_item.id] = history_item.url; 
            urls.push(history_item.url);
        }
    }

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
                treeNodes(all_visited_items, url_array);
            }
        });
    }
    recurse(0);
};

function visitNode(visit_item, urls) {

    //Copy VisitItem attributes
    this.id = visit_item.id;
    this.url = urls[visit_item.id];
    this.visitId = visit_item.visitId;
    this.visitTime = visit_item.visitTime;
    this.referringVisitId = visit_item.referringVisitId;
    this.transition = visit_item.transition;

    this.children = [];

    this.addChild = function(new_child) {
        this.children.push(new_child);
    }
}

//Check children & childrens children (Recursively?)
//Pseudo
function searchChildren(parentNode, childNode) {
	
	for(var i=0; i<parentNode.children.length; i++) {
		//check referring id
		if (isParent(parentNode.visitId, childNode.referringVisitId)) {
			parentNode.addChild(childNode);
			childNode = undefined;
		}

		// //If the child node has not been matched to a parent
		// if (childNode !== undefined) {
		// 	searchChildren(parentNode.children[i], childNode);
		// }
	}
}

//Pseudo
function isParent(visitId, referringVisitId) {
	return visitId === referringVisitId
}

function visitItemsToVisitNodes(visit_item_list, url_array) {

	var visitNodes_list = [];

    for (var j = 0; j < visit_item_list.length; j++) {

        var visit_item = visit_item_list[j],
        	helper_node = new visitNode(visit_item, url_array);

        visitNodes_list.push(helper_node);
    }
    return visitNodes_list;
}

//Tree of visit items
function treeNodes(all_visited_items, url_array) {
    console.log('All visited items');
    console.log(all_visited_items);

    var visitNodes_list = visitItemsToVisitNodes(all_visited_items, url_array),
    	num_of_root_visit_nodes = (getRootVisitNodes(visitNodes_list)).length;

    console.log("num of root visit nodes " + num_of_root_visit_nodes);

    for (var z = 0; z < num_of_root_visit_nodes; z++) {
	//while (visitNodes_list.length != num_of_root_visit_nodes) {

		//Outer (i) is parent trying to find child
    	for (var i = 0; i < visitNodes_list.length; i++) {

    		//Inner (j) is child
  			for (var j = 0; j < visitNodes_list.length; j++) {

  				//Skip if inner node (j) is root node
  				if (visitNodes_list[j] && visitNodes_list[j].referringVisitId !== 0) {

  					//If this is true the inner node (j) is the child of outer node (i)
	  				if((visitNodes_list[j] && visitNodes_list[i]) && visitNodes_list[j].referringVisitId == visitNodes_list[i].visitId) {
	  					
	  					visitNodes_list[i].addChild(visitNodes_list[j]);
	  					visitNodes_list[j] = undefined;
	  					
	  					console.log('splice');
	  					visitNodes_list.splice(j, 1);
	  				} 
	  				//Check if the inner node (j) is the child of any of the outer node's (i) children
	  				else if (visitNodes_list[i] && visitNodes_list[j]) {
	  					//searchChildren(visitNodes_list[i], visitNodes_list[j]);
	  				}
  				}
  				else {
  					console.log('skip');
  				}
  			}
    	}
    }

    console.log('Visit Nodes List');
    console.log(visitNodes_list);

    //Remove all Roots from all_visited_items
    //A visited_item is a root if its refferingId = 0
}

function getRootVisitNodes(visitNodes_list) {

	var root_visitNodes = [];
	for (var i = 0; i < visitNodes_list.length; i++) {

		if(visitNodes_list[i].referringVisitId == 0) {
			root_visitNodes.push(visitNodes_list[i]);
		}
	}

	return root_visitNodes;
}

function getHistoryItems(url, start_time) {
	
	var all_visited_items = [];
	var visitNodes_list = [];
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

							//all_visited_items.push(visit_item);
							visitNodes_list.push( new visitNode(visit_item) );
						}
					}
				}
			});
		}

		console.log('All visited items');
		console.log(all_visited_items);

		console.log('Visit Nodes List');
		console.log(visitNodes_list);

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

	$('#header').on('click', function() {
		chrome.tabs.create({url: 'history.html'});
	});
	
	var url = '';
    var start_time = (new Date('2015-07-19')).getTime();

    getHistory(url, start_time);

});