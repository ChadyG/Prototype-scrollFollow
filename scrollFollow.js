 /**
 * Prototype scrollFollow
 * Modified from jquery.scrollFollow.js
 * Copyright (c) 2008 Net Perspective (http://kitchen.net-perspective.com/)
 * Licensed under the MIT License (http://www.opensource.org/licenses/mit-license.php)
 * 
 * @author R.A. Ray
 *
 * @projectDescription	jQuery plugin for allowing an element to animate down as the user scrolls the page.
 * 
 * @version 0.4.0
 * 
 * @requires jquery.js (tested with 1.2.6)
 * @requires ui.core.js (tested with 1.5.2)
 * 
 * @optional jquery.cookie.js (http://www.stilbuero.de/2006/09/17/cookie-plugin-for-jquery/)
 * @optional jquery.easing.js (http://gsgd.co.uk/sandbox/jquery/easing/ - tested with 1.3)
 * 
 * @param speed		int - Duration of animation (in milliseconds)
 * 								default: 500
 * @param offset			int - Number of pixels box should remain from top of viewport
 * 								default: 0
 * @param easing		string - Any one of the easing options from the easing plugin - Requires jQuery Easing Plugin < http://gsgd.co.uk/sandbox/jquery/easing/ >
 * 								default: 'linear'
 * @param container	string - ID of the containing div
 * 								default: box's immediate parent
 * @param killSwitch	string - ID of the On/Off toggle element
 * 								default: 'killSwitch'
 * @param onText		string - killSwitch text to be displayed if sliding is enabled
 * 								default: 'Turn Slide Off'
 * @param offText		string - killSwitch text to be displayed if sliding is disabled
 * 								default: 'Turn Slide On'
 * @param relativeTo	string - Scroll animation can be relative to either the 'top' or 'bottom' of the viewport
 * 								default: 'top'
 * @param delay			int - Time between the end of the scroll and the beginning of the animation in milliseconds
 * 								default: 0
 */

var ScrollFollow = {
scrollFollow: function ( obj, options )
	{
		//alert (obj);
		options = options || {};
		options.relativeTo = options.relativeTo || 'top';
		options.speed = options.speed || 0.5;
		options.offset = options.offset || 0;
		options.container = options.container || $(obj.parentNode).readAttribute( 'id' );
		options.killSwitch = options.killSwitch || 'killSwitch';
		options.onText = options.onText || 'Turn Slide Off';
		options.offText = options.offText || 'Turn Slide On';
		options.delay = options.delay || 0;
		
		switch (options.easing) {
			case 'sinoidal':
				options.easing = Effect.Transitions.sinoidal
				break;
			case 'reverse':
				options.easing = Effect.Transitions.reverse
				break;
			case 'flicker':
				options.easing = Effect.Transitions.flicker
				break;
			case 'wobble':
				options.easing = Effect.Transitions.wobble
				break;
			case 'pulse':
				options.easing = Effect.Transitions.pulse
				break;
			case 'spring':
				options.easing = Effect.Transitions.spring
				break;
			default:
				options.easing = Effect.Transitions.linear
				break;
		}
		
		scrollFollow( obj, options );
		
		return obj;
	}
}

Element.addMethods(ScrollFollow);

function killSwitchON(box,options)
{
	box.scrollActive = true;
	$( options.killSwitch ).update( options.onText );
	$( options.killSwitch ).stopObserving('click');
	$( options.killSwitch ).observe('click', 
		function ()
		{
			killSwitchOFF(box,options);
		});
	ani(box,options);
}
function killSwitchOFF(box,options)
{
	box.scrollActive = false;
	$( options.killSwitch ).update( options.offText );
	$( options.killSwitch ).stopObserving('click');
	$( options.killSwitch ).observe('click', 
		function ()
		{
			killSwitchON(box,options);
		});
}

function scrollFollow( box, options )
{ 
	// Convert box into a jQuery object
	box = $( box );
	
	// 'box' is the object to be animated
	var position = box.getStyle( 'position' );
	
	//FUNCTION ANI
	
	// For user-initiated stopping of the slide
	box.scrollActive = true;
	
	// I don't feel like messing with this right now -Chad
	//if ( $.cookie != undefined )
	//{
	//	if( $.cookie( 'scrollFollowSetting' + box.attr( 'id' ) ) == 'false' )
	//	{
	//		var isActive = false;
	//		
	//		$( options.killSwitch ).update(options.offText )
	//			.observe('click', 
	//				function ()
	//				{
	//					killSwitchON(box,options);
	//				});
	//	}
	//	else
	//	{
	$( options.killSwitch ).update( options.onText ).observe('click', 
		function ()
		{
			killSwitchOFF(box, options);
		});
	//	}
	//}
			
	// If no parent ID was specified, and the immediate parent does not have an ID
	// options.container will be undefined. So we need to figure out the parent element.
	if ( options.container == '')
	{
		box.cont = $(box.parentNode);
	}
	else
	{
		box.cont = $( '#' + options.container );
	}
	
	// Finds the default positioning of the box.
	// FIXME: something is wrong with Opera here
	//		returns a value for top that is inconsistent at dom:loaded from afterwards
	layout = box.getLayout();
	box.initialOffsetTop = box.cumulativeOffset()['top'];//parseInt( box.getLayout().get('top') );
	box.initialTop = parseInt( box.getStyle( 'top' ) ) || 0;
	
	// Hack to fix different treatment of boxes positioned 'absolute' and 'relative'
	if ( box.getStyle( 'position' ) == 'relative' )
	{
		box.paddingAdjustment = parseInt( box.cont.getStyle( 'paddingTop' ) ) + parseInt( box.cont.getStyle( 'paddingBottom' ) );
	}
	else
	{
		box.paddingAdjustment = 0;
	}
	
	// Animate the box when the page is scrolled
	Event.observe(window, 'scroll', function ()
		{
			// Sets up the delay of the animation
			box.scrollFollow.interval = setTimeout( function(){ ani(box, options);} , options.delay );
			
			// To check against right before setting the animation
			box.lastScroll = new Date().getTime();
		}
	);
	
	// Animate the box when the page is resized
	Event.observe(window, 'resize', function ()
		{
			// Sets up the delay of the animation
			box.scrollFollow.interval = setTimeout( function(){ ani(box, options);} , options.delay );
			
			// To check against right before setting the animation
			box.lastScroll = new Date().getTime();
		}
	);

	// Run an initial animation on page load
	box.lastScroll = 0;
	
	ani(box, options);
}
function ani(box, options)
{		
	// The script runs on every scroll which really means many times during a scroll.
	// We don't want multiple slides to queue up.
	//box.queue( [ ] );

	// A bunch of values we need to determine where to animate to
	var viewportHeight = parseInt( document.viewport.getHeight() );
	var pageScroll =  parseInt( document.viewport.getScrollOffsets()['top'] );
	var parentTop =  parseInt( $(box.parentNode).getLayout().get('top') );
	var parentHeight = parseInt( $(box.parentNode).offsetHeight );
	var boxHeight = parseInt( box.offsetHeight + ( parseInt( box.getStyle( 'marginTop' ) ) || 0 ) + ( parseInt( box.getStyle( 'marginBottom' ) ) || 0 ) );
	var aniTop;
	
	// Make sure the user wants the animation to happen
	if ( box.scrollActive ) //isActive )
	{
		// If the box should animate relative to the top of the window
		if ( options.relativeTo == 'top' )
		{
			// Don't animate until the top of the window is close enough to the top of the box
			if ( box.initialOffsetTop >= ( pageScroll + options.offset ) )
			{
				aniTop = box.initialTop;
			}
			else
			{
				aniTop = Math.min( ( Math.max( ( -parentTop ), ( pageScroll - box.initialOffsetTop + box.initialTop ) ) + options.offset ), ( parentHeight - boxHeight - box.paddingAdjustment ) );
			}
		}
		// If the box should animate relative to the bottom of the window
		else if ( options.relativeTo == 'bottom' )
		{
			// Don't animate until the bottom of the window is close enough to the bottom of the box
			if ( ( box.initialOffsetTop + boxHeight ) >= ( pageScroll + options.offset + viewportHeight ) )
			{
				aniTop = box.initialTop;
			}
			else
			{
				aniTop = Math.min( ( pageScroll + viewportHeight - boxHeight - options.offset ), ( parentHeight - boxHeight ) );
			}
		}
		
		// Checks to see if the relevant scroll was the last one
		// "-20" is to account for inaccuracy in the timeout
		if ( ( new Date().getTime() - box.lastScroll ) >= ( options.delay - 20 ) )
		{
			//box.animate(
			//	{
			//		top: aniTop
			//	}, options.speed, options.easing
			//);
			//new Effect.Tween(box, box.readAttribute('top'), aniTop, 'top');
			//console.debug("moving to " + aniTop)
			new Effect.Move(box, {
				x: 0, y: aniTop, mode:'absolute', // CSS Properties
				duration: options.speed, // Core Effect properties
				transition: options.easing
			});
		}
	}
}




