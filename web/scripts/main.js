/**
 * scripts/main.js
 */

'use strict';

$(document).ready(function() {
    var App = require('./app.js');
    var Auth = require('./auth.js');
    var People = require('./people.js');
    var Header = require('./header.js');
    var Projects = require('./projects.js');
    var Groups = require('./groups.js');

    // initialize parse
    Parse.initialize("JkYNfPBw2aPgcc7PeTGHMAU2XKvjzeqVIkyClVuo", "45OMU3ZS3o5c168lQxa0ilxQu4FdMVHT1NVTkORl");

    // initialize typekit
    (function(d) {
    var config = {
      kitId: 'aee6jgq',
      scriptTimeout: 3000
    },
    h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='//use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
    })(document);

    var app = new App();
    var auth = new Auth(app);
    var people = new People(app);
    var header = new Header(app);
    var projects = new Projects(app);
    var groups = new Groups(app);

    // Custom knockout extenders

    // Here's a custom Knockout binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
    // Could be stored in a separate utility library
    ko.bindingHandlers.fadeVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
        }
    }

    ko.bindingHandlers.slidePanelVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            // $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            if (ko.unwrap(value)) {
                $(element).addClass('open').css('transform', 'translate3d(0,0,0)').css('visibility', 'visible');
            } else {
                var viewportHeight = $(window).height();
                $(element).removeClass('open').css('transform', 'translate3d(0,' + viewportHeight + 'px,0)').css('visibility', 'hidden');
            }
        }
    };

    ko.bindingHandlers.shiftPanelVisible = {
        init: function(element, valueAccessor) {
            // Initially set the element to be instantly visible/hidden depending on the value
            var value = valueAccessor();
            // $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            // Whenever the value subsequently changes, slowly fade the element in or out
            var value = valueAccessor();
            if (ko.unwrap(value)) {
                $(element).addClass('open').css('transform', 'translate3d(0%,0,0)').css('visibility', 'visible');
            } else {
                var viewportHeight = $(window).height();
                $(element).removeClass('open').css('transform', 'translate3d(100%,0,0)').css('visibility', 'hidden');
            }
        }
    };

    app.initialize();
});

ko.bindingHandlers.isotope = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {},
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var $el = $(element);
        var value = ko.utils.unwrapObservable(valueAccessor());
        var $container = $(value.container);
        $container.isotope({
            itemSelector: value.itemSelector
        });
        $container.isotope('appended', $el);
    }
};


$.fn.serializeObject = function() {
   var o = {};
   var a = this.serializeArray();
   $.each(a, function() {
       if (o[this.name]) {
           if (!o[this.name].push) {
               o[this.name] = [o[this.name]];
           }
           o[this.name].push(this.value || '');
       } else {
           o[this.name] = this.value || '';
       }
   });
   return o;
};