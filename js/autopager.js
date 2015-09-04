var auto_pager = {

	progress : false,
	currPage : null,
	maxPage : null,
	counter : 0,

	init : function() {

		$(document).scroll(function() {
			auto_pager.scroll();
		});
		
		if(auto_pager.currPage == null) {
			if($('#pager_bottom').children().length < 2) {
				auto_pager.currPage = 1;
				auto_pager.maxPage = 1;
			} else {
				auto_pager.currPage = parseInt($('#pager_bottom .active_link').next().attr('href').match(/\d+/g)) - 1;
				auto_pager.maxPage = parseInt($('#pager_bottom a').last().attr('href').match(/\d+/g));
			}
		}
	},

	scroll : function() {

		var bottomHeight = $(document).height() - $('body').scrollTop() - $(window).height();

		if(
			bottomHeight < 300 &&
			!auto_pager.progress &&
			auto_pager.currPage < auto_pager.maxPage
		) {
			auto_pager.progress = true;
			auto_pager.load();
		}

	},

	load : function() {
		console.log('Autopager load')
	},

	destroy : function() {
		$(document).unbind('scroll');
	}
};