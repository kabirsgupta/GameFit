$('a.scrollto').click(function(e){
	$('html,body').scrollTo(this.hash, this.hash, {
		gap:{
			y:-50
		},animation: {
			easing: 'easeInOutCubic', duration: 1600
		}
	});
	e.preventDefault();
});