var arguiot = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active ) ;
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	var rebound = createCommonjsModule(function (module, exports) {
	/**
	 *  Copyright (c) 2013, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */
	(function (global, factory) {
		 module.exports = factory() ;
	}(commonjsGlobal, (function () {
	var _onFrame = void 0;
	if (typeof window !== 'undefined') {
	  _onFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
	}

	if (!_onFrame && typeof process !== 'undefined' && process.title === 'node') {
	  _onFrame = setImmediate;
	}

	_onFrame = _onFrame || function (callback) {
	  window.setTimeout(callback, 1000 / 60);
	};

	var _onFrame$1 = _onFrame;

	/* eslint-disable flowtype/no-weak-types */

	var concat = Array.prototype.concat;
	var slice = Array.prototype.slice;

	// Bind a function to a context object.
	function bind(func, context) {
	  for (var _len = arguments.length, outerArgs = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	    outerArgs[_key - 2] = arguments[_key];
	  }

	  return function () {
	    for (var _len2 = arguments.length, innerArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      innerArgs[_key2] = arguments[_key2];
	    }

	    func.apply(context, concat.call(outerArgs, slice.call(innerArgs)));
	  };
	}

	// Add all the properties in the source to the target.
	function extend(target, source) {
	  for (var key in source) {
	    if (source.hasOwnProperty(key)) {
	      target[key] = source[key];
	    }
	  }
	}

	// Cross browser/node timer functions.
	function onFrame(func) {
	  return _onFrame$1(func);
	}

	// Lop off the first occurence of the reference in the Array.
	function removeFirst(array, item) {
	  var idx = array.indexOf(item);
	  idx !== -1 && array.splice(idx, 1);
	}

	var colorCache = {};
	/**
	 * Converts a hex-formatted color string to its rgb-formatted equivalent. Handy
	 * when performing color tweening animations
	 * @public
	 * @param colorString A hex-formatted color string
	 * @return An rgb-formatted color string
	 */
	function hexToRGB(colorString) {
	  if (colorCache[colorString]) {
	    return colorCache[colorString];
	  }
	  var normalizedColor = colorString.replace('#', '');
	  if (normalizedColor.length === 3) {
	    normalizedColor = normalizedColor[0] + normalizedColor[0] + normalizedColor[1] + normalizedColor[1] + normalizedColor[2] + normalizedColor[2];
	  }
	  var parts = normalizedColor.match(/.{2}/g);
	  if (!parts || parts.length < 3) {
	    throw new Error('Expected a color string of format #rrggbb');
	  }

	  var ret = {
	    r: parseInt(parts[0], 16),
	    g: parseInt(parts[1], 16),
	    b: parseInt(parts[2], 16)
	  };

	  colorCache[colorString] = ret;
	  return ret;
	}

	/**
	 * Converts a rgb-formatted color string to its hex-formatted equivalent. Handy
	 * when performing color tweening animations
	 * @public
	 * @param colorString An rgb-formatted color string
	 * @return A hex-formatted color string
	 */
	function rgbToHex(rNum, gNum, bNum) {
	  var r = rNum.toString(16);
	  var g = gNum.toString(16);
	  var b = bNum.toString(16);
	  r = r.length < 2 ? '0' + r : r;
	  g = g.length < 2 ? '0' + g : g;
	  b = b.length < 2 ? '0' + b : b;
	  return '#' + r + g + b;
	}

	var util = Object.freeze({
		bind: bind,
		extend: extend,
		onFrame: onFrame,
		removeFirst: removeFirst,
		hexToRGB: hexToRGB,
		rgbToHex: rgbToHex
	});

	/**
	 * This helper function does a linear interpolation of a value from
	 * one range to another. This can be very useful for converting the
	 * motion of a Spring to a range of UI property values. For example a
	 * spring moving from position 0 to 1 could be interpolated to move a
	 * view from pixel 300 to 350 and scale it from 0.5 to 1. The current
	 * position of the `Spring` just needs to be run through this method
	 * taking its input range in the _from_ parameters with the property
	 * animation range in the _to_ parameters.
	 * @public
	 */
	function mapValueInRange(value, fromLow, fromHigh, toLow, toHigh) {
	  var fromRangeSize = fromHigh - fromLow;
	  var toRangeSize = toHigh - toLow;
	  var valueScale = (value - fromLow) / fromRangeSize;
	  return toLow + valueScale * toRangeSize;
	}

	/**
	 * Interpolate two hex colors in a 0 - 1 range or optionally provide a
	 * custom range with fromLow,fromHight. The output will be in hex by default
	 * unless asRGB is true in which case it will be returned as an rgb string.
	 *
	 * @public
	 * @param asRGB Whether to return an rgb-style string
	 * @return A string in hex color format unless asRGB is true, in which case a string in rgb format
	 */
	function interpolateColor(val, startColorStr, endColorStr) {
	  var fromLow = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
	  var fromHigh = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
	  var asRGB = arguments[5];

	  var startColor = hexToRGB(startColorStr);
	  var endColor = hexToRGB(endColorStr);
	  var r = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.r, endColor.r));
	  var g = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.g, endColor.g));
	  var b = Math.floor(mapValueInRange(val, fromLow, fromHigh, startColor.b, endColor.b));
	  if (asRGB) {
	    return 'rgb(' + r + ',' + g + ',' + b + ')';
	  } else {
	    return rgbToHex(r, g, b);
	  }
	}

	function degreesToRadians(deg) {
	  return deg * Math.PI / 180;
	}

	function radiansToDegrees(rad) {
	  return rad * 180 / Math.PI;
	}

	var MathUtil = Object.freeze({
		mapValueInRange: mapValueInRange,
		interpolateColor: interpolateColor,
		degreesToRadians: degreesToRadians,
		radiansToDegrees: radiansToDegrees
	});

	// Math for converting from
	// [Origami](http://facebook.github.io/origami/) to
	// [Rebound](http://facebook.github.io/rebound).
	// You mostly don't need to worry about this, just use
	// SpringConfig.fromOrigamiTensionAndFriction(v, v);

	function tensionFromOrigamiValue(oValue) {
	  return (oValue - 30.0) * 3.62 + 194.0;
	}

	function origamiValueFromTension(tension) {
	  return (tension - 194.0) / 3.62 + 30.0;
	}

	function frictionFromOrigamiValue(oValue) {
	  return (oValue - 8.0) * 3.0 + 25.0;
	}

	function origamiFromFriction(friction) {
	  return (friction - 25.0) / 3.0 + 8.0;
	}

	var OrigamiValueConverter = Object.freeze({
		tensionFromOrigamiValue: tensionFromOrigamiValue,
		origamiValueFromTension: origamiValueFromTension,
		frictionFromOrigamiValue: frictionFromOrigamiValue,
		origamiFromFriction: origamiFromFriction
	});

	var classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};









	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	/**
	 * Plays each frame of the SpringSystem on animation
	 * timing loop. This is the default type of looper for a new spring system
	 * as it is the most common when developing UI.
	 * @public
	 */
	/**
	 *  Copyright (c) 2013, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	var AnimationLooper = function () {
	  function AnimationLooper() {
	    classCallCheck(this, AnimationLooper);
	    this.springSystem = null;
	  }

	  AnimationLooper.prototype.run = function run() {
	    var springSystem = getSpringSystem.call(this);

	    onFrame(function () {
	      springSystem.loop(Date.now());
	    });
	  };

	  return AnimationLooper;
	}();

	/**
	 * Resolves the SpringSystem to a resting state in a
	 * tight and blocking loop. This is useful for synchronously generating
	 * pre-recorded animations that can then be played on a timing loop later.
	 * Sometimes this lead to better performance to pre-record a single spring
	 * curve and use it to drive many animations; however, it can make dynamic
	 * response to user input a bit trickier to implement.
	 * @public
	 */
	var SimulationLooper = function () {
	  function SimulationLooper(timestep) {
	    classCallCheck(this, SimulationLooper);
	    this.springSystem = null;
	    this.time = 0;
	    this.running = false;

	    this.timestep = timestep || 16.667;
	  }

	  SimulationLooper.prototype.run = function run() {
	    var springSystem = getSpringSystem.call(this);

	    if (this.running) {
	      return;
	    }
	    this.running = true;
	    while (!springSystem.getIsIdle()) {
	      springSystem.loop(this.time += this.timestep);
	    }
	    this.running = false;
	  };

	  return SimulationLooper;
	}();

	/**
	 * Resolves the SpringSystem one step at a
	 * time controlled by an outside loop. This is useful for testing and
	 * verifying the behavior of a SpringSystem or if you want to control your own
	 * timing loop for some reason e.g. slowing down or speeding up the
	 * simulation.
	 * @public
	 */
	var SteppingSimulationLooper = function () {
	  function SteppingSimulationLooper() {
	    classCallCheck(this, SteppingSimulationLooper);
	    this.springSystem = null;
	    this.time = 0;
	    this.running = false;
	  }

	  SteppingSimulationLooper.prototype.run = function run() {}
	  // this.run is NOOP'd here to allow control from the outside using
	  // this.step.


	  // Perform one step toward resolving the SpringSystem.
	  ;

	  SteppingSimulationLooper.prototype.step = function step(timestep) {
	    var springSystem = getSpringSystem.call(this);
	    springSystem.loop(this.time += timestep);
	  };

	  return SteppingSimulationLooper;
	}();

	function getSpringSystem() {
	  if (this.springSystem == null) {
	    throw new Error('cannot run looper without a springSystem');
	  }
	  return this.springSystem;
	}



	var Loopers = Object.freeze({
		AnimationLooper: AnimationLooper,
		SimulationLooper: SimulationLooper,
		SteppingSimulationLooper: SteppingSimulationLooper
	});

	/**
	 * Provides math for converting from Origami PopAnimation
	 * config values to regular Origami tension and friction values. If you are
	 * trying to replicate prototypes made with PopAnimation patches in Origami,
	 * then you should create your springs with
	 * SpringSystem.createSpringWithBouncinessAndSpeed, which uses this Math
	 * internally to create a spring to match the provided PopAnimation
	 * configuration from Origami.
	 */
	var BouncyConversion = function () {
	  function BouncyConversion(bounciness, speed) {
	    classCallCheck(this, BouncyConversion);

	    this.bounciness = bounciness;
	    this.speed = speed;

	    var b = this.normalize(bounciness / 1.7, 0, 20.0);
	    b = this.projectNormal(b, 0.0, 0.8);
	    var s = this.normalize(speed / 1.7, 0, 20.0);

	    this.bouncyTension = this.projectNormal(s, 0.5, 200);
	    this.bouncyFriction = this.quadraticOutInterpolation(b, this.b3Nobounce(this.bouncyTension), 0.01);
	  }

	  BouncyConversion.prototype.normalize = function normalize(value, startValue, endValue) {
	    return (value - startValue) / (endValue - startValue);
	  };

	  BouncyConversion.prototype.projectNormal = function projectNormal(n, start, end) {
	    return start + n * (end - start);
	  };

	  BouncyConversion.prototype.linearInterpolation = function linearInterpolation(t, start, end) {
	    return t * end + (1.0 - t) * start;
	  };

	  BouncyConversion.prototype.quadraticOutInterpolation = function quadraticOutInterpolation(t, start, end) {
	    return this.linearInterpolation(2 * t - t * t, start, end);
	  };

	  BouncyConversion.prototype.b3Friction1 = function b3Friction1(x) {
	    return 0.0007 * Math.pow(x, 3) - 0.031 * Math.pow(x, 2) + 0.64 * x + 1.28;
	  };

	  BouncyConversion.prototype.b3Friction2 = function b3Friction2(x) {
	    return 0.000044 * Math.pow(x, 3) - 0.006 * Math.pow(x, 2) + 0.36 * x + 2;
	  };

	  BouncyConversion.prototype.b3Friction3 = function b3Friction3(x) {
	    return 0.00000045 * Math.pow(x, 3) - 0.000332 * Math.pow(x, 2) + 0.1078 * x + 5.84;
	  };

	  BouncyConversion.prototype.b3Nobounce = function b3Nobounce(tension) {
	    var friction = 0;
	    if (tension <= 18) {
	      friction = this.b3Friction1(tension);
	    } else if (tension > 18 && tension <= 44) {
	      friction = this.b3Friction2(tension);
	    } else {
	      friction = this.b3Friction3(tension);
	    }
	    return friction;
	  };

	  return BouncyConversion;
	}();

	/**
	 * Maintains a set of tension and friction constants
	 * for a Spring. You can use fromOrigamiTensionAndFriction to convert
	 * values from the [Origami](http://facebook.github.io/origami/)
	 * design tool directly to Rebound spring constants.
	 * @public
	 */

	var SpringConfig = function () {

	  /**
	   * Convert an origami Spring tension and friction to Rebound spring
	   * constants. If you are prototyping a design with Origami, this
	   * makes it easy to make your springs behave exactly the same in
	   * Rebound.
	   * @public
	   */
	  SpringConfig.fromOrigamiTensionAndFriction = function fromOrigamiTensionAndFriction(tension, friction) {
	    return new SpringConfig(tensionFromOrigamiValue(tension), frictionFromOrigamiValue(friction));
	  };

	  /**
	   * Convert an origami PopAnimation Spring bounciness and speed to Rebound
	   * spring constants. If you are using PopAnimation patches in Origami, this
	   * utility will provide springs that match your prototype.
	   * @public
	   */


	  SpringConfig.fromBouncinessAndSpeed = function fromBouncinessAndSpeed(bounciness, speed) {
	    var bouncyConversion = new BouncyConversion(bounciness, speed);
	    return SpringConfig.fromOrigamiTensionAndFriction(bouncyConversion.bouncyTension, bouncyConversion.bouncyFriction);
	  };

	  /**
	   * Create a SpringConfig with no tension or a coasting spring with some
	   * amount of Friction so that it does not coast infininitely.
	   * @public
	   */


	  SpringConfig.coastingConfigWithOrigamiFriction = function coastingConfigWithOrigamiFriction(friction) {
	    return new SpringConfig(0, frictionFromOrigamiValue(friction));
	  };

	  function SpringConfig(tension, friction) {
	    classCallCheck(this, SpringConfig);

	    this.tension = tension;
	    this.friction = friction;
	  }

	  return SpringConfig;
	}();

	SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG = SpringConfig.fromOrigamiTensionAndFriction(40, 7);

	/**
	 * Consists of a position and velocity. A Spring uses
	 * this internally to keep track of its current and prior position and
	 * velocity values.
	 */
	var PhysicsState = function PhysicsState() {
	  classCallCheck(this, PhysicsState);
	  this.position = 0;
	  this.velocity = 0;
	};

	/**
	 * Provides a model of a classical spring acting to
	 * resolve a body to equilibrium. Springs have configurable
	 * tension which is a force multipler on the displacement of the
	 * spring from its rest point or `endValue` as defined by [Hooke's
	 * law](http://en.wikipedia.org/wiki/Hooke's_law). Springs also have
	 * configurable friction, which ensures that they do not oscillate
	 * infinitely. When a Spring is displaced by updating it's resting
	 * or `currentValue`, the SpringSystems that contain that Spring
	 * will automatically start looping to solve for equilibrium. As each
	 * timestep passes, `SpringListener` objects attached to the Spring
	 * will be notified of the updates providing a way to drive an
	 * animation off of the spring's resolution curve.
	 * @public
	 */

	var Spring = function () {
	  function Spring(springSystem) {
	    classCallCheck(this, Spring);
	    this.listeners = [];
	    this._startValue = 0;
	    this._currentState = new PhysicsState();
	    this._displacementFromRestThreshold = 0.001;
	    this._endValue = 0;
	    this._overshootClampingEnabled = false;
	    this._previousState = new PhysicsState();
	    this._restSpeedThreshold = 0.001;
	    this._tempState = new PhysicsState();
	    this._timeAccumulator = 0;
	    this._wasAtRest = true;

	    this._id = 's' + Spring._ID++;
	    this._springSystem = springSystem;
	  }

	  /**
	   * Remove a Spring from simulation and clear its listeners.
	   * @public
	   */


	  Spring.prototype.destroy = function destroy() {
	    this.listeners = [];
	    this._springSystem.deregisterSpring(this);
	  };

	  /**
	   * Get the id of the spring, which can be used to retrieve it from
	   * the SpringSystems it participates in later.
	   * @public
	   */


	  Spring.prototype.getId = function getId() {
	    return this._id;
	  };

	  /**
	   * Set the configuration values for this Spring. A SpringConfig
	   * contains the tension and friction values used to solve for the
	   * equilibrium of the Spring in the physics loop.
	   * @public
	   */


	  Spring.prototype.setSpringConfig = function setSpringConfig(springConfig) {
	    this._springConfig = springConfig;
	    return this;
	  };

	  /**
	   * Retrieve the SpringConfig used by this Spring.
	   * @public
	   */


	  Spring.prototype.getSpringConfig = function getSpringConfig() {
	    return this._springConfig;
	  };

	  /**
	   * Set the current position of this Spring. Listeners will be updated
	   * with this value immediately. If the rest or `endValue` is not
	   * updated to match this value, then the spring will be dispalced and
	   * the SpringSystem will start to loop to restore the spring to the
	   * `endValue`.
	   *
	   * A common pattern is to move a Spring around without animation by
	   * calling.
	   *
	   * ```
	   * spring.setCurrentValue(n).setAtRest();
	   * ```
	   *
	   * This moves the Spring to a new position `n`, sets the endValue
	   * to `n`, and removes any velocity from the `Spring`. By doing
	   * this you can allow the `SpringListener` to manage the position
	   * of UI elements attached to the spring even when moving without
	   * animation. For example, when dragging an element you can
	   * update the position of an attached view through a spring
	   * by calling `spring.setCurrentValue(x)`. When
	   * the gesture ends you can update the Springs
	   * velocity and endValue
	   * `spring.setVelocity(gestureEndVelocity).setEndValue(flingTarget)`
	   * to cause it to naturally animate the UI element to the resting
	   * position taking into account existing velocity. The codepaths for
	   * synchronous movement and spring driven animation can
	   * be unified using this technique.
	   * @public
	   */


	  Spring.prototype.setCurrentValue = function setCurrentValue(currentValue, skipSetAtRest) {
	    this._startValue = currentValue;
	    this._currentState.position = currentValue;
	    if (!skipSetAtRest) {
	      this.setAtRest();
	    }
	    this.notifyPositionUpdated(false, false);
	    return this;
	  };

	  /**
	   * Get the position that the most recent animation started at. This
	   * can be useful for determining the number off oscillations that
	   * have occurred.
	   * @public
	   */


	  Spring.prototype.getStartValue = function getStartValue() {
	    return this._startValue;
	  };

	  /**
	   * Retrieve the current value of the Spring.
	   * @public
	   */


	  Spring.prototype.getCurrentValue = function getCurrentValue() {
	    return this._currentState.position;
	  };

	  /**
	   * Get the absolute distance of the Spring from its resting endValue
	   * position.
	   * @public
	   */


	  Spring.prototype.getCurrentDisplacementDistance = function getCurrentDisplacementDistance() {
	    return this.getDisplacementDistanceForState(this._currentState);
	  };

	  /**
	   * Get the absolute distance of the Spring from a given state value
	   */


	  Spring.prototype.getDisplacementDistanceForState = function getDisplacementDistanceForState(state) {
	    return Math.abs(this._endValue - state.position);
	  };

	  /**
	   * Set the endValue or resting position of the spring. If this
	   * value is different than the current value, the SpringSystem will
	   * be notified and will begin running its solver loop to resolve
	   * the Spring to equilibrium. Any listeners that are registered
	   * for onSpringEndStateChange will also be notified of this update
	   * immediately.
	   * @public
	   */


	  Spring.prototype.setEndValue = function setEndValue(endValue) {
	    if (this._endValue === endValue && this.isAtRest()) {
	      return this;
	    }
	    this._startValue = this.getCurrentValue();
	    this._endValue = endValue;
	    this._springSystem.activateSpring(this.getId());
	    for (var i = 0, len = this.listeners.length; i < len; i++) {
	      var listener = this.listeners[i];
	      var onChange = listener.onSpringEndStateChange;
	      onChange && onChange(this);
	    }
	    return this;
	  };

	  /**
	   * Retrieve the endValue or resting position of this spring.
	   * @public
	   */


	  Spring.prototype.getEndValue = function getEndValue() {
	    return this._endValue;
	  };

	  /**
	   * Set the current velocity of the Spring, in pixels per second. As
	   * previously mentioned, this can be useful when you are performing
	   * a direct manipulation gesture. When a UI element is released you
	   * may call setVelocity on its animation Spring so that the Spring
	   * continues with the same velocity as the gesture ended with. The
	   * friction, tension, and displacement of the Spring will then
	   * govern its motion to return to rest on a natural feeling curve.
	   * @public
	   */


	  Spring.prototype.setVelocity = function setVelocity(velocity) {
	    if (velocity === this._currentState.velocity) {
	      return this;
	    }
	    this._currentState.velocity = velocity;
	    this._springSystem.activateSpring(this.getId());
	    return this;
	  };

	  /**
	   * Get the current velocity of the Spring, in pixels per second.
	   * @public
	   */


	  Spring.prototype.getVelocity = function getVelocity() {
	    return this._currentState.velocity;
	  };

	  /**
	   * Set a threshold value for the movement speed of the Spring below
	   * which it will be considered to be not moving or resting.
	   * @public
	   */


	  Spring.prototype.setRestSpeedThreshold = function setRestSpeedThreshold(restSpeedThreshold) {
	    this._restSpeedThreshold = restSpeedThreshold;
	    return this;
	  };

	  /**
	   * Retrieve the rest speed threshold for this Spring.
	   * @public
	   */


	  Spring.prototype.getRestSpeedThreshold = function getRestSpeedThreshold() {
	    return this._restSpeedThreshold;
	  };

	  /**
	   * Set a threshold value for displacement below which the Spring
	   * will be considered to be not displaced i.e. at its resting
	   * `endValue`.
	   * @public
	   */


	  Spring.prototype.setRestDisplacementThreshold = function setRestDisplacementThreshold(displacementFromRestThreshold) {
	    this._displacementFromRestThreshold = displacementFromRestThreshold;
	  };

	  /**
	   * Retrieve the rest displacement threshold for this spring.
	   * @public
	   */


	  Spring.prototype.getRestDisplacementThreshold = function getRestDisplacementThreshold() {
	    return this._displacementFromRestThreshold;
	  };

	  /**
	   * Enable overshoot clamping. This means that the Spring will stop
	   * immediately when it reaches its resting position regardless of
	   * any existing momentum it may have. This can be useful for certain
	   * types of animations that should not oscillate such as a scale
	   * down to 0 or alpha fade.
	   * @public
	   */


	  Spring.prototype.setOvershootClampingEnabled = function setOvershootClampingEnabled(enabled) {
	    this._overshootClampingEnabled = enabled;
	    return this;
	  };

	  /**
	   * Check if overshoot clamping is enabled for this spring.
	   * @public
	   */


	  Spring.prototype.isOvershootClampingEnabled = function isOvershootClampingEnabled() {
	    return this._overshootClampingEnabled;
	  };

	  /**
	   * Check if the Spring has gone past its end point by comparing
	   * the direction it was moving in when it started to the current
	   * position and end value.
	   * @public
	   */


	  Spring.prototype.isOvershooting = function isOvershooting() {
	    var start = this._startValue;
	    var end = this._endValue;
	    return this._springConfig.tension > 0 && (start < end && this.getCurrentValue() > end || start > end && this.getCurrentValue() < end);
	  };

	  /**
	   * The main solver method for the Spring. It takes
	   * the current time and delta since the last time step and performs
	   * an RK4 integration to get the new position and velocity state
	   * for the Spring based on the tension, friction, velocity, and
	   * displacement of the Spring.
	   * @public
	   */


	  Spring.prototype.advance = function advance(time, realDeltaTime) {
	    var isAtRest = this.isAtRest();

	    if (isAtRest && this._wasAtRest) {
	      return;
	    }

	    var adjustedDeltaTime = realDeltaTime;
	    if (realDeltaTime > Spring.MAX_DELTA_TIME_SEC) {
	      adjustedDeltaTime = Spring.MAX_DELTA_TIME_SEC;
	    }

	    this._timeAccumulator += adjustedDeltaTime;

	    var tension = this._springConfig.tension;
	    var friction = this._springConfig.friction;
	    var position = this._currentState.position;
	    var velocity = this._currentState.velocity;
	    var tempPosition = this._tempState.position;
	    var tempVelocity = this._tempState.velocity;
	    var aVelocity = void 0;
	    var aAcceleration = void 0;
	    var bVelocity = void 0;
	    var bAcceleration = void 0;
	    var cVelocity = void 0;
	    var cAcceleration = void 0;
	    var dVelocity = void 0;
	    var dAcceleration = void 0;
	    var dxdt = void 0;
	    var dvdt = void 0;

	    while (this._timeAccumulator >= Spring.SOLVER_TIMESTEP_SEC) {
	      this._timeAccumulator -= Spring.SOLVER_TIMESTEP_SEC;

	      if (this._timeAccumulator < Spring.SOLVER_TIMESTEP_SEC) {
	        this._previousState.position = position;
	        this._previousState.velocity = velocity;
	      }

	      aVelocity = velocity;
	      aAcceleration = tension * (this._endValue - tempPosition) - friction * velocity;

	      tempPosition = position + aVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
	      tempVelocity = velocity + aAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
	      bVelocity = tempVelocity;
	      bAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

	      tempPosition = position + bVelocity * Spring.SOLVER_TIMESTEP_SEC * 0.5;
	      tempVelocity = velocity + bAcceleration * Spring.SOLVER_TIMESTEP_SEC * 0.5;
	      cVelocity = tempVelocity;
	      cAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

	      tempPosition = position + cVelocity * Spring.SOLVER_TIMESTEP_SEC;
	      tempVelocity = velocity + cAcceleration * Spring.SOLVER_TIMESTEP_SEC;
	      dVelocity = tempVelocity;
	      dAcceleration = tension * (this._endValue - tempPosition) - friction * tempVelocity;

	      dxdt = 1.0 / 6.0 * (aVelocity + 2.0 * (bVelocity + cVelocity) + dVelocity);
	      dvdt = 1.0 / 6.0 * (aAcceleration + 2.0 * (bAcceleration + cAcceleration) + dAcceleration);

	      position += dxdt * Spring.SOLVER_TIMESTEP_SEC;
	      velocity += dvdt * Spring.SOLVER_TIMESTEP_SEC;
	    }

	    this._tempState.position = tempPosition;
	    this._tempState.velocity = tempVelocity;

	    this._currentState.position = position;
	    this._currentState.velocity = velocity;

	    if (this._timeAccumulator > 0) {
	      this._interpolate(this._timeAccumulator / Spring.SOLVER_TIMESTEP_SEC);
	    }

	    if (this.isAtRest() || this._overshootClampingEnabled && this.isOvershooting()) {
	      if (this._springConfig.tension > 0) {
	        this._startValue = this._endValue;
	        this._currentState.position = this._endValue;
	      } else {
	        this._endValue = this._currentState.position;
	        this._startValue = this._endValue;
	      }
	      this.setVelocity(0);
	      isAtRest = true;
	    }

	    var notifyActivate = false;
	    if (this._wasAtRest) {
	      this._wasAtRest = false;
	      notifyActivate = true;
	    }

	    var notifyAtRest = false;
	    if (isAtRest) {
	      this._wasAtRest = true;
	      notifyAtRest = true;
	    }

	    this.notifyPositionUpdated(notifyActivate, notifyAtRest);
	  };

	  Spring.prototype.notifyPositionUpdated = function notifyPositionUpdated(notifyActivate, notifyAtRest) {
	    for (var i = 0, len = this.listeners.length; i < len; i++) {
	      var listener = this.listeners[i];
	      if (notifyActivate && listener.onSpringActivate) {
	        listener.onSpringActivate(this);
	      }

	      if (listener.onSpringUpdate) {
	        listener.onSpringUpdate(this);
	      }

	      if (notifyAtRest && listener.onSpringAtRest) {
	        listener.onSpringAtRest(this);
	      }
	    }
	  };

	  /**
	   * Check if the SpringSystem should advance. Springs are advanced
	   * a final frame after they reach equilibrium to ensure that the
	   * currentValue is exactly the requested endValue regardless of the
	   * displacement threshold.
	   * @public
	   */


	  Spring.prototype.systemShouldAdvance = function systemShouldAdvance() {
	    return !this.isAtRest() || !this.wasAtRest();
	  };

	  Spring.prototype.wasAtRest = function wasAtRest() {
	    return this._wasAtRest;
	  };

	  /**
	   * Check if the Spring is atRest meaning that it's currentValue and
	   * endValue are the same and that it has no velocity. The previously
	   * described thresholds for speed and displacement define the bounds
	   * of this equivalence check. If the Spring has 0 tension, then it will
	   * be considered at rest whenever its absolute velocity drops below the
	   * restSpeedThreshold.
	   * @public
	   */


	  Spring.prototype.isAtRest = function isAtRest() {
	    return Math.abs(this._currentState.velocity) < this._restSpeedThreshold && (this.getDisplacementDistanceForState(this._currentState) <= this._displacementFromRestThreshold || this._springConfig.tension === 0);
	  };

	  /**
	   * Force the spring to be at rest at its current position. As
	   * described in the documentation for setCurrentValue, this method
	   * makes it easy to do synchronous non-animated updates to ui
	   * elements that are attached to springs via SpringListeners.
	   * @public
	   */


	  Spring.prototype.setAtRest = function setAtRest() {
	    this._endValue = this._currentState.position;
	    this._tempState.position = this._currentState.position;
	    this._currentState.velocity = 0;
	    return this;
	  };

	  Spring.prototype._interpolate = function _interpolate(alpha) {
	    this._currentState.position = this._currentState.position * alpha + this._previousState.position * (1 - alpha);
	    this._currentState.velocity = this._currentState.velocity * alpha + this._previousState.velocity * (1 - alpha);
	  };

	  Spring.prototype.getListeners = function getListeners() {
	    return this.listeners;
	  };

	  Spring.prototype.addListener = function addListener(newListener) {
	    this.listeners.push(newListener);
	    return this;
	  };

	  Spring.prototype.removeListener = function removeListener(listenerToRemove) {
	    removeFirst(this.listeners, listenerToRemove);
	    return this;
	  };

	  Spring.prototype.removeAllListeners = function removeAllListeners() {
	    this.listeners = [];
	    return this;
	  };

	  Spring.prototype.currentValueIsApproximately = function currentValueIsApproximately(value) {
	    return Math.abs(this.getCurrentValue() - value) <= this.getRestDisplacementThreshold();
	  };

	  return Spring;
	}();

	Spring._ID = 0;
	Spring.MAX_DELTA_TIME_SEC = 0.064;
	Spring.SOLVER_TIMESTEP_SEC = 0.001;

	/**
	 * A set of Springs that all run on the same physics
	 * timing loop. To get started with a Rebound animation, first
	 * create a new SpringSystem and then add springs to it.
	 * @public
	 */

	var SpringSystem = function () {
	  function SpringSystem(looper) {
	    classCallCheck(this, SpringSystem);
	    this.listeners = [];
	    this._activeSprings = [];
	    this._idleSpringIndices = [];
	    this._isIdle = true;
	    this._lastTimeMillis = -1;
	    this._springRegistry = {};

	    this.looper = looper || new AnimationLooper();
	    this.looper.springSystem = this;
	  }

	  /**
	   * A SpringSystem is iterated by a looper. The looper is responsible
	   * for executing each frame as the SpringSystem is resolved to idle.
	   * There are three types of Loopers described below AnimationLooper,
	   * SimulationLooper, and SteppingSimulationLooper. AnimationLooper is
	   * the default as it is the most useful for common UI animations.
	   * @public
	   */


	  SpringSystem.prototype.setLooper = function setLooper(looper) {
	    this.looper = looper;
	    looper.springSystem = this;
	  };

	  /**
	   * Add a new spring to this SpringSystem. This Spring will now be solved for
	   * during the physics iteration loop. By default the spring will use the
	   * default Origami spring config with 40 tension and 7 friction, but you can
	   * also provide your own values here.
	   * @public
	   */


	  SpringSystem.prototype.createSpring = function createSpring(tension, friction) {
	    var springConfig = void 0;
	    if (tension === undefined || friction === undefined) {
	      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
	    } else {
	      springConfig = SpringConfig.fromOrigamiTensionAndFriction(tension, friction);
	    }
	    return this.createSpringWithConfig(springConfig);
	  };

	  /**
	   * Add a spring with a specified bounciness and speed. To replicate Origami
	   * compositions based on PopAnimation patches, use this factory method to
	   * create matching springs.
	   * @public
	   */


	  SpringSystem.prototype.createSpringWithBouncinessAndSpeed = function createSpringWithBouncinessAndSpeed(bounciness, speed) {
	    var springConfig = void 0;
	    if (bounciness === undefined || speed === undefined) {
	      springConfig = SpringConfig.DEFAULT_ORIGAMI_SPRING_CONFIG;
	    } else {
	      springConfig = SpringConfig.fromBouncinessAndSpeed(bounciness, speed);
	    }
	    return this.createSpringWithConfig(springConfig);
	  };

	  /**
	   * Add a spring with the provided SpringConfig.
	   * @public
	   */


	  SpringSystem.prototype.createSpringWithConfig = function createSpringWithConfig(springConfig) {
	    var spring = new Spring(this);
	    this.registerSpring(spring);
	    spring.setSpringConfig(springConfig);
	    return spring;
	  };

	  /**
	   * Check if a SpringSystem is idle or active. If all of the Springs in the
	   * SpringSystem are at rest, i.e. the physics forces have reached equilibrium,
	   * then this method will return true.
	   * @public
	   */


	  SpringSystem.prototype.getIsIdle = function getIsIdle() {
	    return this._isIdle;
	  };

	  /**
	   * Retrieve a specific Spring from the SpringSystem by id. This
	   * can be useful for inspecting the state of a spring before
	   * or after an integration loop in the SpringSystem executes.
	   * @public
	   */


	  SpringSystem.prototype.getSpringById = function getSpringById(id) {
	    return this._springRegistry[id];
	  };

	  /**
	   * Get a listing of all the springs registered with this
	   * SpringSystem.
	   * @public
	   */


	  SpringSystem.prototype.getAllSprings = function getAllSprings() {
	    var vals = [];
	    for (var _id in this._springRegistry) {
	      if (this._springRegistry.hasOwnProperty(_id)) {
	        vals.push(this._springRegistry[_id]);
	      }
	    }
	    return vals;
	  };

	  /**
	   * Manually add a spring to this system. This is called automatically
	   * if a Spring is created with SpringSystem#createSpring.
	   *
	   * This method sets the spring up in the registry so that it can be solved
	   * in the solver loop.
	   * @public
	   */


	  SpringSystem.prototype.registerSpring = function registerSpring(spring) {
	    this._springRegistry[spring.getId()] = spring;
	  };

	  /**
	   * Deregister a spring with this SpringSystem. The SpringSystem will
	   * no longer consider this Spring during its integration loop once
	   * this is called. This is normally done automatically for you when
	   * you call Spring#destroy.
	   * @public
	   */


	  SpringSystem.prototype.deregisterSpring = function deregisterSpring(spring) {
	    removeFirst(this._activeSprings, spring);
	    delete this._springRegistry[spring.getId()];
	  };

	  SpringSystem.prototype.advance = function advance(time, deltaTime) {
	    while (this._idleSpringIndices.length > 0) {
	      this._idleSpringIndices.pop();
	    }
	    for (var i = 0, len = this._activeSprings.length; i < len; i++) {
	      var spring = this._activeSprings[i];
	      if (spring.systemShouldAdvance()) {
	        spring.advance(time / 1000.0, deltaTime / 1000.0);
	      } else {
	        this._idleSpringIndices.push(this._activeSprings.indexOf(spring));
	      }
	    }
	    while (this._idleSpringIndices.length > 0) {
	      var idx = this._idleSpringIndices.pop();
	      idx >= 0 && this._activeSprings.splice(idx, 1);
	    }
	  };

	  /**
	   * This is the main solver loop called to move the simulation
	   * forward through time. Before each pass in the solver loop
	   * onBeforeIntegrate is called on an any listeners that have
	   * registered themeselves with the SpringSystem. This gives you
	   * an opportunity to apply any constraints or adjustments to
	   * the springs that should be enforced before each iteration
	   * loop. Next the advance method is called to move each Spring in
	   * the systemShouldAdvance forward to the current time. After the
	   * integration step runs in advance, onAfterIntegrate is called
	   * on any listeners that have registered themselves with the
	   * SpringSystem. This gives you an opportunity to run any post
	   * integration constraints or adjustments on the Springs in the
	   * SpringSystem.
	   * @public
	   */


	  SpringSystem.prototype.loop = function loop(currentTimeMillis) {
	    var listener = void 0;
	    if (this._lastTimeMillis === -1) {
	      this._lastTimeMillis = currentTimeMillis - 1;
	    }
	    var ellapsedMillis = currentTimeMillis - this._lastTimeMillis;
	    this._lastTimeMillis = currentTimeMillis;

	    var i = 0;
	    var len = this.listeners.length;
	    for (i = 0; i < len; i++) {
	      listener = this.listeners[i];
	      listener.onBeforeIntegrate && listener.onBeforeIntegrate(this);
	    }

	    this.advance(currentTimeMillis, ellapsedMillis);
	    if (this._activeSprings.length === 0) {
	      this._isIdle = true;
	      this._lastTimeMillis = -1;
	    }

	    for (i = 0; i < len; i++) {
	      listener = this.listeners[i];
	      listener.onAfterIntegrate && listener.onAfterIntegrate(this);
	    }

	    if (!this._isIdle) {
	      this.looper.run();
	    }
	  };

	  /**
	   * Used to notify the SpringSystem that a Spring has become displaced.
	   * The system responds by starting its solver loop up if it is currently idle.
	   */


	  SpringSystem.prototype.activateSpring = function activateSpring(springId) {
	    var spring = this._springRegistry[springId];
	    if (this._activeSprings.indexOf(spring) === -1) {
	      this._activeSprings.push(spring);
	    }
	    if (this.getIsIdle()) {
	      this._isIdle = false;
	      this.looper.run();
	    }
	  };

	  /**
	   * Add a listener to the SpringSystem to receive before/after integration
	   * notifications allowing Springs to be constrained or adjusted.
	   * @public
	   */


	  SpringSystem.prototype.addListener = function addListener(listener) {
	    this.listeners.push(listener);
	  };

	  /**
	   * Remove a previously added listener on the SpringSystem.
	   * @public
	   */


	  SpringSystem.prototype.removeListener = function removeListener(listener) {
	    removeFirst(this.listeners, listener);
	  };

	  /**
	   * Remove all previously added listeners on the SpringSystem.
	   * @public
	   */


	  SpringSystem.prototype.removeAllListeners = function removeAllListeners() {
	    this.listeners = [];
	  };

	  return SpringSystem;
	}();

	var index = _extends({}, Loopers, {
	  OrigamiValueConverter: OrigamiValueConverter,
	  MathUtil: MathUtil,
	  Spring: Spring,
	  SpringConfig: SpringConfig,
	  SpringSystem: SpringSystem,
	  util: _extends({}, util, MathUtil)
	});

	return index;

	})));
	});

	var horizontal = createCommonjsModule(function (module, exports) {
	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	var __read = (commonjsGlobal && commonjsGlobal.__read) || function (o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	};
	Object.defineProperty(exports, "__esModule", { value: true });


	var SCROLL_AMOUNT = 100;
	var SCROLL_AMOUNT_STEP = SCROLL_AMOUNT * 10;
	var HorizontalScroll = /** @class */ (function (_super) {
	    __extends(HorizontalScroll, _super);
	    /**
	     * Initialize a new horizontal scroll instance.
	     * Will immediately bind to container.
	     *
	     */
	    function HorizontalScroll(_a) {
	        var _b = _a === void 0 ? {} : _a, _c = _b.scrollAmount, _d = _b.scrollAmountStep, _e = _b.container, container = _e === void 0 ? document.documentElement : _e, _f = _b.showScrollbars, showScrollbars = _f === void 0 ? false : _f, _g = _b.preventVerticalScroll, preventVerticalScroll = _g === void 0 ? false : _g;
	        var _this = _super.call(this) || this;
	        _this.observer = null;
	        _this.containerIsIntersecting = false;
	        _this.style = null;
	        _this.cssClass = "__horizontal-container-" + Math.round(Math.random() * 100000);
	        _this.preventVerticalScroll = false;
	        // ignore keydown events when any of these elements are focused
	        _this.blacklist = ['input', 'select', 'textarea'];
	        _this.wheel = function (e) {
	            e.preventDefault();
	            var angle = Math.atan2(e.deltaY, e.deltaX) / Math.PI;
	            var forward = !(angle < 0.675 && angle > -0.375);
	            var offset = Math.sqrt(Math.pow(e.deltaX, 2) + Math.pow(e.deltaY, 2));
	            if (_this.preventVerticalScroll) {
	                return;
	            }
	            switch (e.deltaMode) {
	                case WheelEvent.DOM_DELTA_LINE:
	                    offset *= SCROLL_AMOUNT;
	                    break;
	                case WheelEvent.DOM_DELTA_PAGE:
	                    offset *= SCROLL_AMOUNT_STEP;
	                    break;
	            }
	            if (forward) {
	                offset *= -1;
	            }
	            var distance = Math.max(_this.container.scrollLeft + offset, 0);
	            if (distance - SCROLL_AMOUNT < _this.container.scrollWidth - _this.container.clientWidth) {
	                if (e.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
	                    // force spring to new value & don't animate
	                    _this.spring.setCurrentValue(distance);
	                }
	                else {
	                    _this.spring.setEndValue(distance);
	                }
	            }
	        };
	        _this.keydown = function (e) {
	            // only listen to key events if the container actually is in view
	            if (_this.observer && !_this.containerIsIntersecting) {
	                return;
	            }
	            var target = e.target;
	            // if any blacklisted elements are focused, we'll won't handle this keydown.
	            if (target &&
	                target !== document.body &&
	                _this.blacklist.includes(target.nodeName.toLowerCase())) {
	                return;
	            }
	            var scrollValue = _this.container.scrollLeft;
	            var max = _this.container.scrollWidth - _this.container.clientWidth;
	            var prevent = true;
	            switch (e.code) {
	                case 'Home':
	                    scrollValue = 0;
	                    break;
	                case 'End':
	                    scrollValue = max;
	                    break;
	                case 'ArrowUp':
	                    if (_this.preventVerticalScroll) {
	                        prevent = true;
	                        break;
	                    }
	                    else {
	                        scrollValue -= SCROLL_AMOUNT;
	                        break;
	                    }
	                case 'ArrowDown':
	                    if (_this.preventVerticalScroll) {
	                        prevent = true;
	                        break;
	                    }
	                    else {
	                        scrollValue += SCROLL_AMOUNT;
	                        break;
	                    }
	                case 'ArrowLeft':
	                    scrollValue -= SCROLL_AMOUNT;
	                    break;
	                case 'ArrowRight':
	                    scrollValue += SCROLL_AMOUNT;
	                    break;
	                case 'PageUp':
	                    scrollValue -= SCROLL_AMOUNT_STEP;
	                    break;
	                case 'PageDown':
	                case 'Space':
	                    scrollValue += SCROLL_AMOUNT_STEP;
	                    break;
	                default:
	                    prevent = false;
	                    break;
	            }
	            // correct scroll value if it's out of bounds
	            scrollValue = Math.max(scrollValue, 0);
	            scrollValue = Math.min(scrollValue, max);
	            // if nothing changed, do nothing
	            if (scrollValue === _this.spring.getEndValue()) {
	                return;
	            }
	            if (prevent) {
	                e.preventDefault();
	            }
	            if (_this.spring) {
	                if (_this.spring.isAtRest()) {
	                    _this.spring.setCurrentValue(_this.container.scrollLeft);
	                }
	                _this.spring.setEndValue(scrollValue);
	            }
	        };
	        if (typeof container === 'undefined') {
	            return _this;
	        }
	        _this.preventVerticalScroll = preventVerticalScroll;
	        // bind events
	        _this.container = container;
	        _this.container.addEventListener('wheel', _this.wheel);
	        document.addEventListener('keydown', _this.keydown);
	        // set up interaction observer
	        if (_this.container !== document.documentElement) {
	            if ('IntersectionObserver' in window) {
	                _this.observer = new IntersectionObserver(function (_a) {
	                    var _b = __read(_a, 1), entry = _b[0];
	                    _this.containerIsIntersecting = entry.isIntersecting;
	                });
	                _this.observer.observe(_this.container);
	            }
	            else {
	                // tslint:disable-next-line:no-console
	                console.warn('[horizontal-scroll] WARN: IntersectionObserver not available, assuming key navigation is always applicable to your container.');
	            }
	        }
	        // add CSS to hide scrollbars
	        if (!showScrollbars) {
	            _this.container.classList.add(_this.cssClass);
	            _this.style = document.createElement('style');
	            document.head.appendChild(_this.style);
	            var sheet = _this.style.sheet;
	            if (sheet) {
	                sheet.insertRule("\n                        ." + _this.cssClass + " {\n                            overflow-y: hidden;\n                            overflow-x: auto;\n\n                            /* prevents unwanted gestures and bounce effects */\n                            overscroll-behavior: auto;\n\n                            /* vendor specific hacks to hide scrollbars */\n                            scrollbar-width: none;\n                            -ms-overflow-style: none;\n                        }\n                    ");
	                var webkitCss = "::-webkit-scrollbar { display: none; }";
	                if (_this.container !== document.documentElement) {
	                    webkitCss = "." + _this.cssClass + webkitCss;
	                }
	                sheet.insertRule(webkitCss);
	            }
	        }
	        // init spring
	        _this.springSystem = new rebound.SpringSystem();
	        _this.spring = _this.springSystem.createSpring();
	        _this.spring.setCurrentValue(_this.container.scrollLeft);
	        _this.spring.setOvershootClampingEnabled(true);
	        _this.spring.addListener({
	            onSpringUpdate: function (currSpring) {
	                var value = currSpring.getCurrentValue();
	                _this.emit('scroll', value);
	                // disallow gestures on the vertical axis. also disallow on horizontal when we've scrolled
	                _this.container.style.overscrollBehaviorY = 'none';
	                _this.container.style.overscrollBehaviorX = value > 0 ? 'none' : 'auto';
	                _this.container.scrollLeft = value;
	            },
	        });
	        _this.spring.notifyPositionUpdated();
	        return _this;
	    }
	    HorizontalScroll.prototype.destroy = function () {
	        if (typeof this.container === 'undefined') {
	            return;
	        }
	        this.container.removeEventListener('wheel', this.wheel);
	        document.removeEventListener('keydown', this.keydown);
	        if (this.style) {
	            this.style.remove();
	        }
	        this.container.classList.remove(this.cssClass);
	        this.spring.destroy();
	        this.springSystem.removeAllListeners();
	        if (this.observer) {
	            this.observer.disconnect();
	        }
	    };
	    return HorizontalScroll;
	}(EventEmitter.EventEmitter));
	exports.default = HorizontalScroll;

	});

	var HorizontalScroll = unwrapExports(horizontal);

	class Main {
		constructor() {
			this.setupUI();
		}

		setupUI() {
			if (matchMedia) {
				const mq = window.matchMedia("(max-width: 600px)");
				mq.addListener(this.widthChange.bind(this));
				this.widthChange(mq);
			} else {
				this.largeWindow();
			}
		}

		widthChange(mq) {
			if (mq.matches) {
				this.smallWindow();
			} else {
				this.largeWindow();
			}
		}
		smallWindow() {
			if (typeof this.horizontal != "undefined") {
				this.horizontal.destroy();
			}
		}

		largeWindow() {
			this.horizontal = new HorizontalScroll({
				showScrollbars: true,
			});
		}
	}

	const m = new Main();

	return m;

}());
//# sourceMappingURL=main.js.map
