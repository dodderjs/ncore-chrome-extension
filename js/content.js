(function () {
	var movies = {
		list: {},

		generateHtml: function (data) {
			return html;
		},

		fetchTorrentHtml : function (html) {
			var item = $(html),
				typeDOM = item.find('.box_alap_img > a'),
				coverDOM = item.find('.infobar img'),
				itemTextDOM = item.find('.torrent_txt > a, .torrent_txt2 > a')
				item_id = itemTextDOM.attr('onclick').toString().match(/torrent\((.*?)\)/)[1],
				infolink = item.find('.siterank .infolink');

			this.list[item_id] = {
				title: itemTextDOM.text().replace(/\./g, ' '),
				altTitle: item.find('.siterank').find('span[title]').text(),
				type: {
					id: typeDOM.attr('href').match(/\/torrents.php\?tipus=(.*)$/)[1],
					icon: typeDOM.find('img').attr('src'),
					title: typeDOM.find('img').attr('alt')
				},
				coverUrl: coverDOM.length ? coverDOM.attr('onmouseover').toString().match(/'(.*?)'/)[1] : '',
				uploaded: Date.parse(item.find('.box_feltoltve2, box_feltoltve').html().replace('<br>', ' ')),
				size: (function (meret) {
						var result = +meret[1];
							switch (meret[2]) {
								case 'GB':
									result *= 1024 * 1024;
								break;
								case 'MB':
									result *= 1024;
								break;
							}
						return result;
					})(item.find('.box_meret2, box_meret').text().match(/(\d+.?\d*) (\w+)/)),
				downloads: item.find('.box_d2, box_d').text(),
				seed: item.find('.box_s2 a, box_s a').text(),
				leech: item.find('.box_l2 a, box_l a').text(),
				imdb_id: infolink.length && /(.*)\/(tt\d+)\//.test(infolink.attr('href')) ? infolink.attr('href').match(/(.*)\/(tt\d+)\//)[2] : null,
				imdb_rank: infolink.length && /\d+\.?\d?/.test(infolink.attr('href')) ?  +infolink.text().match(/\d+\.?\d?/)[0] : 0
			}
			return this.list[item_id];
		},
		fetchHTML: function (html) {
			return _.map(html.find('.box_torrent'), $.proxy(this.fetchTorrentHtml, this));
		},

		dataByImdb: function () {
			return _.groupBy(this.list, function (data, key) {
				console.log('groupby: ', arguments)

				return data.imdb_id ? data.imdb_id : data.key
			});
		}
	}

	$.get('https://ncore.cc/torrents.php?oldal=2', function(data) {
		console.log('by torrent:\n ', movies.fetchHTML($(data).find('#main_tartalom')));
		console.log('by imdb:\n ', movies.dataByImdb())
	});

})();

(function () {
	var data = {},
		dataBYimdb = {},
		bookmarks={};

var movieTpl = _.template(
	'<ul class="movie-list">'+
		'<% _.map(data, function(d) { %>'+					
			'<li>'+
				'<div class="movie" data-tid="<%- d.tid %>">'+
					'<figure>'+
						'<img src="<%- d.coverUrl %>" width="150" />'+
					'</figure>'+
					'<div class="movie-details">'+
						'<h4 title="<%- d.title %>"><%- d.altTitle || d.title %></h4>'+
						'<ul class="torrent-spec">' +
							'<li>Uploaded: <%- d.lastupload %></li>'+
							'<li>Rank: <%- d.rank %></li>'+
							'<li>Torrents: <%- _.size(d.torrents) %></li>'+	
							'<li>Torrents types: <%- _.pluck(d.torrents, "type.title").join(", ") %></li>'+	
						'</ul>'+
					'</div>'+
				'</div>'+
			'</li>'+
		'<% }); %>' +
	'</ul>'
);

var movieDetailsTpl = _.template(
	'<div class="movieDetails">'+
		'<figure>'+
			'<img src="<%- data.coverUrl %>" width="150" />'+
		'</figure>'+
		'<div class="movie-info">'+
			'<h2 title="<%- data.title %>"><%- data.altTitle || data.title %></h2>'+
			'<ul class="spec">' +
				'<li>Uploaded: <%- data.lastupload %></li>'+
				'<li>Rank: <%- data.rank %></li>'+
			'</ul>'+
			'<table class="torrents">'+
				'<th>Name</th>'+
				'<th>Size</th>'+
				'<th>Downloads</th>'+
				'<th>Seed</th>'+
				'<th>Leech</th>'+
				'<th>Uploaded</th>'+
				'<th>Type</th>'+
			'<% _.map(_.sortByOrder(data.torrents, "uploaded", false), function(t) { %>'+
				'<tr class="torrent" data-torrent-id="<%- t.id %>" data-torrent-type="<%- t.type.id %>" onclick="konyvjelzo(<%- t.id %>)">' +
					'<td><%- t.title || t.altTitle %></td>'+
					'<td><%- t.size / 1024 / 1024 %></td>'+
					'<td><%- t.downloads %></td>'+
					'<td><%- t.seed %></td>'+
					'<td><%- t.leech %></td>'+
					'<td><%- new Date(t.uploaded).getFullYear() %>-<%- new Date(t.uploaded).getMonth() %>-<%- new Date(t.uploaded).getDate() %></td>'+
					'<td><%- t.type.title %></td>'+
				'</tr>'+
			'<% }); %>' +
			'</table>'+
		'</div>'+
	'</div>'
);

chrome.extension.onConnect.addListener(function(port) {
	console.log('port onConnect - ', port);

	port.postMessage("Hi BackGround");

	//on port disconnect
	port.onDisconnect.addListener(function(port) {
		console.log('port onDisconnect - ', port);
	});

	//Message from devtools
	port.onMessage.addListener(function (msg) {
		console.log('port onMessage - ', msg);
	});

	//Send tab info to devtools as a handshake
	chrome.tabs.getSelected(null, function(tab) {
		console.log('port tab getSelected - ', MSG_TYPE, tab);
		port.postMessage("Hi BackGround");
	});
});

chrome.extension.sendMessage({ type: 'ncore_bg_call', name: 'updateIcon', args: []});

/**
 * on message from content script we forward it to devtools panels
 */
chrome.extension.onMessage.addListener(function (msg, sender) {
	console.log('extension onMessage - ', msg, sender);
});

	_.map($('#main_tartalom .box_torrent'), 
		function (e) {
			var item = $(e),
				typeDOM = item.find('.box_alap_img > a'),
				coverDOM = item.find('.infobar img'),
				itemTextDOM = item.find('.torrent_txt > a, .torrent_txt2 > a')
				item_id = itemTextDOM.attr('onclick').toString().match(/torrent\((.*?)\)/)[1],
				infolink = item.find('.siterank .infolink');

			data[item_id] = {
				title: itemTextDOM.text().replace(/\./g, ' '),
				altTitle: item.find('.siterank').find('span[title]').text(),
				type: {
					id: typeDOM.attr('href').match(/\/torrents.php\?tipus=(.*)$/)[1],
					icon: typeDOM.find('img').attr('src'),
					title: typeDOM.find('img').attr('alt')
				},
				coverUrl: coverDOM.length ? coverDOM.attr('onmouseover').toString().match(/'(.*?)'/)[1] : '',
				uploaded: Date.parse(item.find('.box_feltoltve2, box_feltoltve').html().replace('<br>', ' ')),
				size: (function (meret) {
						var result = +meret[1];
							switch (meret[2]) {
								case 'GB':
									result *= 1024 * 1024;
								break;
								case 'MB':
									result *= 1024;
								break;
							}
						return result;
					})(item.find('.box_meret2, box_meret').text().match(/(\d+.?\d*) (\w+)/)),
				downloads: item.find('.box_d2, box_d').text(),
				seed: item.find('.box_s2 a, box_s a').text(),
				leech: item.find('.box_l2 a, box_l a').text(),
				imdb: {
					id: infolink.length && /(.*)\/(tt\d+)\//.test(infolink.attr('href')) ? infolink.attr('href').match(/(.*)\/(tt\d+)\//)[2] : null,
					rank: infolink.length && /\d+\.?\d?/.test(infolink.attr('href')) ?  +infolink.text().match(/\d+\.?\d?/)[0] : 0
				}
			}


			var index = data[item_id].imdb.id || item_id;


			if (!dataBYimdb[index]) {
				dataBYimdb[index] = {
					tid: data[item_id].imdb.id || null,
					title: data[item_id].title,
					altTitle: data[item_id].altTitle,
					coverUrl: data[item_id].coverUrl,
					rank: data[item_id].imdb.rank,
					lastupload: new Date(data[item_id].uploaded),
					torrents: {}
				}
			}

			dataBYimdb[index].torrents[item_id] = {
					id: item_id,
					title: data[item_id].title,
					altTitle: data[item_id].altTitle,
					type: data[item_id].type,
					uploaded: data[item_id].uploaded,
					size: data[item_id].size,
					downloads: data[item_id].downloads,
					seed: data[item_id].seed,
					leech: data[item_id].leech
			}
			if (dataBYimdb[index].lastupload.getTime() < data[item_id].uploaded) {
				dataBYimdb[index].lastupload = new Date(data[item_id].uploaded);
			}
	}
);
	console.log(data, dataBYimdb)

	//get bookmarks
$.get("ajax.php?action=bookmark_add&addlist=1",function(data){
	var b = data.match(/\'\w+\', \'\d+\'/g);

	if (b.length) {
		_.map(b, function (item) {
			var a = item.replace(/\'/g, '').split(', ');
			console.log(bookmarks, a, item)
			bookmarks[+a[1]] = a[0];
		});
	}
});

$('#main_tartalom .lista_all')
	.html(movieTpl({ 'data' : _.sortByOrder(dataBYimdb, 'lastupload', false) }))
	.on('click', '.movie', function (e) {
		console.log(dataBYimdb[$(e.target).closest('.movie').attr('data-tid')])
		$('#MovieDetails').html(movieDetailsTpl({'data': dataBYimdb[$(e.target).closest('.movie').attr('data-tid')]})).show();
	});


$('html')
	.attr('id', 'WithExtension')
	.on('keyup', function (e) {
		if (e.which === 27) {
			$('#MovieDetails').hide();
		}
	})
	.append('<div id="MovieDetails"></div>')
	.on('click', '.torrent', function (e) {
		var target = $(e.currentTarget),
			tid = target.attr('data-torrent-id'),
			ttype = target.attr('data-torrent-type');
		console.log(tid, ttype)
	});

console.log(auto_pager)
auto_pager.load = function () { console.log('loader nah'); }
auto_pager.init(
	$('#pager_bottom .active_link').next().attr('href').replace(/oldal=\d/, 'oldal='+(auto_pager.currPage+1)+''));


/*
_.map($('#main_tartalom .box_torrent'), 
	function (e) {
		var elem = $(e).addClass('cover_check_big'),
			icon = elem.find('.box_alap_img > a'),
			cover = $('<div>').insertBefore(icon).addClass('ncore_cover'),
			coverimg = elem.find('.infobar img'),
			url = coverimg.length ? coverimg.attr('onmouseover').toString().match(/'(.*?)'/)[1] : '',
			link = elem.find('.torrent_txt > a'),
			id = link.attr('onclick').toString().match(/torrent\((.*?)\)/)[1];
			
			elem.find('.torrent_txt > a')
					.text(function (i,s){
						return s.replace(/\./g, ' ');
					});

			elem.find('.torrent_konyvjelzo2')
					.detach()
					.appendTo(elem.find('.box_nagy,.box_nagy2'));

			// Find cover
			if(elem.find('.infobar').length > 0) {
				link.attr('onclick', '')
				elem.attr('torrent-id', id);
				coverimg.remove();

				// Create image
				var img = $('<img>').attr('src', url).appendTo(cover);

			}
	
	}
);

$('.box_torrent_all div[style="clear:both;"]').remove();*/

function fetchData () {

}


})();