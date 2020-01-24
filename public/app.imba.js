
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (function(blk) { return setTimeout(blk,1000 / 60); });

// Scheduler
class Scheduler {
	constructor(){
		var self = this;
		this.queue = [];
		this.stage = -1;
		this.batch = 0;
		this.scheduled = false;
		this.listeners = {};
		
		this.__ticker = function(e) {
			self.scheduled = false;
			return self.tick(e);
		};
	}
	
	add(item,force){
		if (force || this.queue.indexOf(item) == -1) {
			this.queue.push(item);
		}		
		if (!this.scheduled) { return this.schedule() }	}
	
	listen(ns,item){
		this.listeners[ns] || (this.listeners[ns] = new Set());
		return this.listeners[ns].add(item);
	}
	
	unlisten(ns,item){
		return this.listeners[ns] && this.listeners[ns].delete(item);
	}
	
	get promise(){
		var self = this;
		return new Promise(function(resolve) { return self.add(resolve); });
	}
	
	tick(timestamp){
		var self = this;
		var items = this.queue;
		if (!this.ts) { this.ts = timestamp; }		this.dt = timestamp - this.ts;
		this.ts = timestamp;
		this.queue = [];
		this.stage = 1;
		this.batch++;
		
		if (items.length) {
			for (let i = 0, ary = iter$(items), len = ary.length, item; i < len; i++) {
				item = ary[i];
				if (typeof item === 'string' && this.listeners[item]) {
					this.listeners[item].forEach(function(item) {
						if (item.tick instanceof Function) {
							return item.tick(self);
						} else if (item instanceof Function) {
							return item(self);
						}					});
				} else if (item instanceof Function) {
					item(this.dt,this);
				} else if (item.tick) {
					item.tick(this.dt,this);
				}			}		}		this.stage = 2;
		this.stage = this.scheduled ? 0 : -1;
		return this;
	}
	
	schedule(){
		if (!this.scheduled) {
			this.scheduled = true;
			if (this.stage == -1) {
				this.stage = 0;
			}			raf(this.__ticker);
		}		return this;
	}
}

function iter$$1(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	return target;
}const keyCodes = {
	esc: [27],
	tab: [9],
	enter: [13],
	space: [32],
	up: [38],
	down: [40],
	del: [8,46]
};


// only for web?
extend$(Event,{
	
	wait$mod(state,params){
		return new Promise(function(resolve) {
			return setTimeout(resolve,((params[0] instanceof Number) ? params[0] : 1000));
		});
	},
	
	sel$mod(state,params){
		return state.event.target.closest(params[0]) || false;
	},
	
	throttle$mod({handler,element,event},params){
		if (handler.throttled) { return false }		handler.throttled = true;
		let name = params[0];
		if (!((name instanceof String))) {
			name = ("in-" + (event.type || 'event'));
		}		let cl = element.classList;
		cl.add(name);
		handler.once('idle',function() {
			cl.remove(name);
			return handler.throttled = false;
		});
		return true;
	},
});


// could cache similar event handlers with the same parts
class EventHandler {
	constructor(params,closure){
		this.params = params;
		this.closure = closure;
	}
	
	getHandlerForMethod(el,name){
		if (!(el)) { return null }		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
	}
	
	emit(name,...params){
		return imba.emit(this,name,params);
	}
	on(name,...params){
		return imba.listen(this,name,...params);
	}
	once(name,...params){
		return imba.once(this,name,...params);
	}
	un(name,...params){
		return imba.unlisten(this,name,...params);
	}
	
	async handleEvent(event){
		var target = event.target;
		var element = event.currentTarget;
		var mods = this.params;
		let commit = true; // @params.length == 0
		
		// console.log 'handle event',event.type,@params
		this.currentEvents || (this.currentEvents = new Set());
		this.currentEvents.add(event);
		
		let state = {
			element: element,
			event: event,
			modifiers: mods,
			handler: this
		};
		
		for (let val, j = 0, keys = Object.keys(mods), l = keys.length, handler; j < l; j++){
			// let handler = part
			handler = keys[j];val = mods[handler];if (handler.indexOf('~') > 0) {
				handler = handler.split('~')[0];
			}			
			let args = [event,this];
			let res = undefined;
			let context = null;
			
			// parse the arguments
			if (val instanceof Array) {
				args = val.slice();
				
				for (let i = 0, items = iter$$1(args), len = items.length, par; i < len; i++) {
					// what about fully nested arrays and objects?
					// ought to redirect this
					par = items[i];
					if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
						let name = par.slice(2);
						let chain = name.split('.');
						let value = state[chain.shift()] || event;
						
						for (let i = 0, ary = iter$$1(chain), len = ary.length, part; i < len; i++) {
							part = ary[i];
							value = value ? value[part] : undefined;
						}						
						args[i] = value;
					}				}			}			
			// console.log "handle part",i,handler,event.currentTarget
			// check if it is an array?
			if (handler == 'stop') {
				event.stopImmediatePropagation();
			} else if (handler == 'prevent') {
				event.preventDefault();
			} else if (handler == 'ctrl') {
				if (!event.ctrlKey) { break; }			} else if (handler == 'commit') {
				commit = true;
			} else if (handler == 'silence') {
				commit = false;
			} else if (handler == 'alt') {
				if (!event.altKey) { break; }			} else if (handler == 'shift') {
				if (!event.shiftKey) { break; }			} else if (handler == 'meta') {
				if (!event.metaKey) { break; }			} else if (handler == 'self') {
				if (target != element) { break; }			} else if (handler == 'once') {
				// clean up bound data as well
				element.removeEventListener(event.type,this);
			} else if (handler == 'options') {
				continue;
			} else if (keyCodes[handler]) {
				if (keyCodes[handler].indexOf(event.keyCode) < 0) {
					break;
				}			} else if (handler == 'trigger' || handler == 'emit') {
				let name = args[0];
				let detail = args[1]; // is custom event if not?
				let e = new CustomEvent(name,{bubbles: true,detail: detail}); // : Event.new(name)
				e.originalEvent = event;
				let customRes = element.dispatchEvent(e);
			} else if (typeof handler == 'string') {
				let mod = handler + '$mod';
				
				if (event[mod] instanceof Function) {
					// console.log "found modifier!",mod
					handler = mod;
					context = event;
					args = [state,args];
				} else if (handler[0] == '_') {
					handler = handler.slice(1);
					context = this.closure;
				} else {
					context = this.getHandlerForMethod(element,handler);
				}			}			
			
			if (context) {
				res = context[handler].apply(context,args);
			} else if (handler instanceof Function) {
				res = handler.apply(element,args);
			}			
			if (res && (res.then instanceof Function)) {
				if (commit) { imba.commit(); }				// TODO what if await fails?
				res = await res;
			}			
			if (res === false) {
				break;
			}			
			state.value = res;
		}		
		if (commit) { imba.commit(); }		this.currentEvents.delete(event);
		if (this.currentEvents.size == 0) {
			this.emit('idle');
		}		// what if the result is a promise
		return;
	}
}

var {Document,Node: Node$1,Text: Text$1,Comment: Comment$1,Element: Element$1,SVGElement,HTMLElement: HTMLElement$1,DocumentFragment,Event: Event$1,CustomEvent: CustomEvent$1,MouseEvent,document: document$1} = window;

function iter$$2(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$1(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	return target;
}
extend$$1(DocumentFragment,{
	
	// Called to make a documentFragment become a live fragment
	setup$(flags,options){
		this.__start = imba.document.createComment('start');
		this.__end = imba.document.createComment('end');
		
		this.__end.replaceWith$ = function(other) {
			this.parentNode.insertBefore(other,this);
			return other;
		};
		
		this.appendChild(this.__start);
		return this.appendChild(this.__end);
	},
	
	// when we for sure know that the only content should be
	// a single text node
	text$(item){
		if (!this.__text) {
			this.__text = this.insert$(item);
		} else {
			this.__text.textContent = item;
		}		return;
	},
	
	insert$(item,options,toReplace){
		if (this.__parent) {
			// if the fragment is attached to a parent
			// we can just proxy the call through
			return this.__parent.insert$(item,options,toReplace || this.__end);
		} else {
			return Element$1.prototype.insert$.call(this,item,options,toReplace || this.__end);
		}	},
	
	insertInto$(parent,before){
		if (!this.__parent) {
			this.__parent = parent;
			parent.appendChild$(this);
		}		return this;
	},
	
	replaceWith$(other,parent){
		this.__start.insertBeforeBegin$(other);
		var el = this.__start;
		while (el){
			let next = el.nextSibling;
			this.appendChild(el);
			if (el == this.__end) { break; }			el = next;
		}		
		return other;
	},
	
	appendChild$(child){
		this.__end.insertBeforeBegin$(child);
		return child;
	},
	
	removeChild$(child){
		child.parentNode && child.parentNode.removeChild(child);
		return this;
	},
	
	isEmpty$(){
		let el = this.__start;
		let end = this.__end;
		
		while (el = el.nextSibling){
			if (el == end) { break; }			if ((el instanceof Element$1) || (el instanceof Text$1)) { return false }		}		return true;
	},
});

class TagCollection {
	constructor(f,parent){
		this.__f = f;
		this.__parent = parent;
		
		if (!(f & 128) && (this instanceof KeyedTagFragment)) {
			this.__start = document$1.createComment('start');
			if (parent) { parent.appendChild$(this.__start); }		}		
		if (!(f & 256)) {
			this.__end = document$1.createComment('end');
			if (parent) { parent.appendChild$(this.__end); }		}		
		this.setup();
	}
	
	get parentContext(){
		return this.__parent;
	}
	
	appendChild$(item,index){
		// we know that these items are dom elements
		if (this.__end && this.__parent) {
			this.__end.insertBeforeBegin$(item);
		} else if (this.__parent) {
			this.__parent.appendChild(item);
		}		return;
	}
	
	replaceWith$(other){
		this.detachNodes();
		this.__end.insertBeforeBegin$(other);
		this.__parent.removeChild(this.__end);
		this.__parent = null;
		return;
	}
	
	joinBefore$(before){
		return this.insertInto$(before.parentNode,before);
	}
	
	insertInto$(parent,before){
		if (!this.__parent) {
			this.__parent = parent;
			before ? before.insertBeforeBegin$(this.__end) : parent.appendChild$(this.__end);
			this.attachNodes();
		}		return this;
	}
	
	setup(){
		return this;
	}
}
class KeyedTagFragment extends TagCollection {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	setup(){
		this.array = [];
		this.changes = new Map();
		this.dirty = false;
		return this.$ = {};
	}
	
	push(item,idx){
		// on first iteration we can merely run through
		if (!(this.__f & 1)) {
			this.array.push(item);
			this.appendChild$(item);
			return;
		}		
		let toReplace = this.array[idx];
		
		if (toReplace === item) ; else {
			this.dirty = true;
			// if this is a new item
			let prevIndex = this.array.indexOf(item);
			let changed = this.changes.get(item);
			
			if (prevIndex === -1) {
				// should we mark the one currently in slot as removed?
				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			} else if (prevIndex === idx + 1) {
				if (toReplace) {
					this.changes.set(toReplace,-1);
				}				this.array.splice(idx,1);
			} else {
				if (prevIndex >= 0) { this.array.splice(prevIndex,1); }				this.array.splice(idx,0,item);
				this.insertChild(item,idx);
			}			
			if (changed == -1) {
				this.changes.delete(item);
			}		}		return;
	}
	
	insertChild(item,index){
		if (index > 0) {
			let other = this.array[index - 1];
			// will fail with text nodes
			other.insertAfterEnd$(item);
		} else if (this.__start) {
			this.__start.insertAfterEnd$(item);
		} else {
			this.__parent.insertAdjacentElement('afterbegin',item);
		}		return;
	}
	
	removeChild(item,index){
		// @map.delete(item)
		// what if this is a fragment or virtual node?
		if (item.parentNode == this.__parent) {
			this.__parent.removeChild(item);
		}		return;
	}
	
	attachNodes(){
		for (let i = 0, items = iter$$2(this.array), len = items.length, item; i < len; i++) {
			item = items[i];
			this.__end.insertBeforeBegin$(item);
		}		return;
	}
	
	detachNodes(){
		for (let i = 0, items = iter$$2(this.array), len = items.length, item; i < len; i++) {
			item = items[i];
			this.__parent.removeChild(item);
		}		return;
	}
	
	end$(index){
		var self = this;
		if (!(this.__f & 1)) {
			this.__f |= 1;
			return;
		}		
		if (this.dirty) {
			this.changes.forEach(function(pos,item) {
				if (pos == -1) {
					return self.removeChild(item);
				}			});
			this.changes.clear();
			this.dirty = false;
		}		
		// there are some items we should remove now
		if (this.array.length > index) {
			
			// remove the children below
			while (this.array.length > index){
				let item = this.array.pop();
				this.removeChild(item);
			}			// @array.length = index
		}		return;
	}
} KeyedTagFragment.init$();
class IndexedTagFragment extends TagCollection {
	
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	setup(){
		this.$ = [];
		return this.length = 0;
	}
	
	end$(len){
		let from = this.length;
		if (from == len || !this.__parent) { return }		let array = this.$;
		let par = this.__parent;
		
		if (from > len) {
			while (from > len){
				par.removeChild$(array[--from]);
			}		} else if (len > from) {
			while (len > from){
				this.appendChild$(array[from++]);
			}		}		this.length = len;
		return;
	}
	
	attachNodes(){
		for (let i = 0, items = iter$$2(this.$), len = items.length, item; i < len; i++) {
			item = items[i];
			if (i == this.length) { break; }			this.__end.insertBeforeBegin$(item);
		}		return;
	}
	
	detachNodes(){
		let i = 0;
		while (i < this.length){
			let item = this.$[i++];
			this.__parent.removeChild$(item);
		}		return;
	}
} IndexedTagFragment.init$();
function createLiveFragment(bitflags,options){
	var el = document$1.createDocumentFragment();
	el.setup$(bitflags,options);
	return el;
}
function createIndexedFragment(bitflags,parent){
	return new IndexedTagFragment(bitflags,parent);
}
function createKeyedFragment(bitflags,parent){
	return new KeyedTagFragment(bitflags,parent);
}

function extend$$2(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	return target;
}

extend$$2(SVGElement,{
	
	flag$(str){
		this.className.baseVal = str;
		return;
	},
	
	flagSelf$(str){
		// if a tag receives flags from inside <self> we need to
		// redefine the flag-methods to later use both
		var self = this;
		this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
		this.className.baseVal = (this.className.baseVal || '') + ' ' + (this.__ownflags = str);
		return;
	},
	
	flagSync$(){
		return this.className.baseVal = ((this.__extflags || '') + ' ' + (this.__ownflags || ''));
	},
});

function iter$$3(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$3(target,ext){
	var descriptors = Object.getOwnPropertyDescriptors(ext);
	Object.defineProperties(target.prototype,descriptors);
	return target;
}var customElements_;

var root = ((typeof window !== 'undefined') ? window : (((typeof global !== 'undefined') ? global : null)));

var imba$1 = {
	version: '2.0.0',
	global: root,
	ctx: null,
	document: root.document
};

root.imba = imba$1;

(customElements_ = root.customElements) || (root.customElements = {
	define: function() { return console.log('no custom elements'); },
	get: function() { return console.log('no custom elements'); }
});

imba$1.setTimeout = function(fn,ms) {
	return setTimeout(function() {
		fn();
		return imba$1.commit();
	},ms);
};

imba$1.setInterval = function(fn,ms) {
	return setInterval(function() {
		fn();
		return imba$1.commit();
	},ms);
};

imba$1.clearInterval = root.clearInterval;
imba$1.clearTimeout = root.clearTimeout;

imba$1.q$ = function (query,ctx){
	return ((ctx instanceof Element) ? ctx : document).querySelector(query);
};

imba$1.q$$ = function (query,ctx){
	return ((ctx instanceof Element) ? ctx : document).querySelectorAll(query);
};

imba$1.inlineStyles = function (styles){
	var el = document.createElement('style');
	el.textContent = styles;
	document.head.appendChild(el);
	return;
};

var dashRegex = /-./g;

imba$1.toCamelCase = function (str){
	if (str.indexOf('-') >= 0) {
		return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
	} else {
		return str;
	}};

// Basic events - move to separate file?
var emit__ = function(event,args,node) {
	var prev;
	var cb;
	var ret;	
	while ((prev = node) && (node = node.next)){
		if (cb = node.listener) {
			if (node.path && cb[node.path]) {
				ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
			} else {
				// check if it is a method?
				ret = args ? cb.apply(node,args) : cb.call(node);
			}		}		
		if (node.times && --node.times <= 0) {
			prev.next = node.next;
			node.listener = null;
		}	}	return;
};

// method for registering a listener on object
imba$1.listen = function (obj,event,listener,path){
	var __listeners___;
	var cbs;
	var list;
	var tail;	cbs = (__listeners___ = obj.__listeners__) || (obj.__listeners__ = {});
	list = cbs[event] || (cbs[event] = {});
	tail = list.tail || (list.tail = (list.next = {}));
	tail.listener = listener;
	tail.path = path;
	list.tail = tail.next = {};
	return tail;
};

// register a listener once
imba$1.once = function (obj,event,listener){
	var tail = imba$1.listen(obj,event,listener);
	tail.times = 1;
	return tail;
};

// remove a listener
imba$1.unlisten = function (obj,event,cb,meth){
	var node;
	var prev;	var meta = obj.__listeners__;
	if (!(meta)) { return }	
	if (node = meta[event]) {
		while ((prev = node) && (node = node.next)){
			if (node == cb || node.listener == cb) {
				prev.next = node.next;
				// check for correct path as well?
				node.listener = null;
				break;
			}		}	}	return;
};

// emit event
imba$1.emit = function (obj,event,params){
	var cb;
	if (cb = obj.__listeners__) {
		if (cb[event]) { emit__(event,params,cb[event]); }		if (cb.all) { emit__(event,[event,params],cb.all); }	}	return;
};

imba$1.scheduler = new Scheduler();
imba$1.commit = function() { return imba$1.scheduler.add('render'); };
imba$1.tick = function() {
	imba$1.commit();
	return imba$1.scheduler.promise;
};

/*
DOM
*/


imba$1.mount = function (element,into){
	// automatic scheduling of element - even before
	element.__schedule = true;
	return (into || document.body).appendChild(element);
};


const CustomTagConstructors = {};

class ImbaElementRegistry {
	
	constructor(){
		this.__types = {};
	}
	
	lookup(name){
		return this.__types[name];
	}
	
	get(name,klass){
		if (!(name) || name == 'component') { return ImbaElement }		if (this.__types[name]) { return this.__types[name] }		if (klass && root[klass]) { return root[klass] }		return root.customElements.get(name) || ImbaElement;
	}
	
	create(name){
		if (this.__types[name]) {
			// TODO refactor
			return this.__types[name].create$();
		} else {
			return document.createElement(name);
		}	}
	
	define(name,klass,options){
		this.__types[name] = klass;
		if (options && options.extends) {
			CustomTagConstructors[name] = klass;
		}		
		let proto = klass.prototype;
		if (proto.render && proto.end$ == Element.prototype.end$) {
			proto.end$ = proto.render;
		}		
		root.customElements.define(name,klass);
		return klass;
	}
}
imba$1.tags = new ImbaElementRegistry();

var proxyHandler = {
	get(target,name){
		let ctx = target;
		let val = undefined;
		while (ctx && val == undefined){
			if (ctx = ctx.parentContext) {
				val = ctx[name];
			}		}		return val;
	}
};

extend$$3(Node,{
	
	get __context(){
		var context$_;
		return (context$_ = this.context$) || (this.context$ = new Proxy(this,proxyHandler));
	},
	
	get parentContext(){
		return this.up$ || this.parentNode;
	},
	
	init$(){
		return this;
	},
	
	// replace this with something else
	replaceWith$(other){
		this.parentNode.replaceChild(other,this);
		return other;
	},
	
	insertInto$(parent){
		parent.appendChild$(this);
		return this;
	},
	
	insertBefore$(el,prev){
		return this.insertBefore(el,prev);
	},
	
	insertBeforeBegin$(other){
		return this.parentNode.insertBefore(other,this);
	},
	
	insertAfterEnd$(other){
		if (this.nextSibling) {
			return this.nextSibling.insertBeforeBegin$(other);
		} else {
			return this.parentNode.appendChild(other);
		}	},
});

extend$$3(Comment,{
	// replace this with something else
	replaceWith$(other){
		if (other && other.joinBefore$) {
			other.joinBefore$(this);
		} else {
			this.parentNode.insertBefore$(other,this);
		}		// other.insertBeforeBegin$(this)
		this.parentNode.removeChild(this);
		// @parentNode.replaceChild(other,this)
		return other;
	},
});

// what if this is in a webworker?
extend$$3(Element,{
	
	emit(name,detail,o = {bubbles: true}){
		if (detail != undefined) { o.detail = detail; }		let event = new CustomEvent(name,o);
		let res = this.dispatchEvent(event);
		return event;
	},
	
	slot$(name,ctx){
		return this;
	},
	
	on$(type,mods,scope){
		
		var check = 'on$' + type;
		var handler;		
		// check if a custom handler exists for this type?
		if (this[check] instanceof Function) {
			handler = this[check](mods,scope);
		}		
		handler = new EventHandler(mods,scope);
		var capture = mods.capture;
		var passive = mods.passive;
		
		var o = capture;
		
		if (passive) {
			o = {passive: passive,capture: capture};
		}		
		this.addEventListener(type,handler,o);
		return handler;
	},
	
	// inline in files or remove all together?
	text$(item){
		this.textContent = item;
		return this;
	},
	
	insert$(item,f,prev){
		let type = typeof item;
		
		if (type === 'undefined' || item === null) {
			// what if the prev value was the same?
			if (prev && (prev instanceof Comment)) {
				return prev;
			}			
			let el = document.createComment('');
			prev ? prev.replaceWith$(el) : el.insertInto$(this);
			return el;
		}		
		// dont reinsert again
		if (item === prev) {
			return item;
		} else if (type !== 'object') {
			let res;			let txt = item;
			
			if ((f & 128) && (f & 256)) {
				// FIXME what if the previous one was not text? Possibly dangerous
				// when we set this on a fragment - it essentially replaces the whole
				// fragment?
				this.textContent = txt;
				return;
			}			
			if (prev) {
				if (prev instanceof Text) {
					prev.textContent = txt;
					return prev;
				} else {
					res = document.createTextNode(txt);
					prev.replaceWith$(res,this);
					return res;
				}			} else {
				this.appendChild$(res = document.createTextNode(txt));
				return res;
			}		} else {
			prev ? prev.replaceWith$(item,this) : item.insertInto$(this);
			return item;
		}	},
	
	flag$(str){
		this.className = str;
		return;
	},
	
	flagSelf$(str){
		// if a tag receives flags from inside <self> we need to
		// redefine the flag-methods to later use both
		var self = this;
		this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
		this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
		this.className = (this.className || '') + ' ' + (this.__ownflags = str);
		return;
	},
	
	flagSync$(){
		return this.className = ((this.__extflags || '') + ' ' + (this.__ownflags || ''));
	},
	
	open$(){
		return this;
	},
	
	close$(){
		return this;
	},
	
	end$(){
		if (this.render) { this.render(); }		return;
	},
	
	css$(key,value,mods){
		return this.style[key] = value;
	},
});

Element.prototype.appendChild$ = Element.prototype.appendChild;
Element.prototype.removeChild$ = Element.prototype.removeChild;
Element.prototype.insertBefore$ = Element.prototype.insertBefore;
Element.prototype.replaceChild$ = Element.prototype.replaceChild;
Element.prototype.set$ = Element.prototype.setAttribute;

imba$1.createLiveFragment = createLiveFragment;
imba$1.createIndexedFragment = createIndexedFragment;
imba$1.createKeyedFragment = createKeyedFragment;

// Create custom tag with support for scheduling and unscheduling etc

var mountedQueue;var mountedFlush = function() {
	let items = mountedQueue;
	mountedQueue = null;
	if (items) {
		for (let i = 0, ary = iter$$3(items), len = ary.length, item; i < len; i++) {
			item = ary[i];
			item.mounted$();
		}	}	return;
};


class ImbaElement extends HTMLElement {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	constructor(){
		super();
		this.setup$();
		if (this.build) { this.build(); }	}
	
	setup$(){
		this.__slots = {};
		return this.__f = 0;
	}
	
	init$(){
		this.__f |= 1;
		return this;
	}
	
	// returns the named slot - for context
	slot$(name,ctx){
		var slots_;
		if (name == '__' && !this.render) {
			return this;
		}		
		return (slots_ = this.__slots)[name] || (slots_[name] = imba$1.createLiveFragment());
	}
	
	schedule(){
		imba$1.scheduler.listen('render',this);
		this.__f |= 64;
		return this;
	}
	
	unschedule(){
		imba$1.scheduler.unlisten('render',this);
		this.__f &= ~64;
		return this;
	}
	
	
	connectedCallback(){
		let flags = this.__f;
		
		if (flags & 16) {
			return;
		}		
		if (this.mounted instanceof Function) {
			if (!(mountedQueue)) {
				mountedQueue = [];
				Promise.resolve().then(mountedFlush);
			}			mountedQueue.unshift(this);
		}		
		if (!(flags & 1)) {
			this.init$();
		}		
		if (!(flags & 8)) {
			this.__f |= 8;
			if (this.awaken) { this.awaken(); }		}		
		if (!(flags)) {
			if (this.render) { this.render(); }		}		
		this.mount$();
		return this;
	}
	
	mount$(){
		this.__f |= 16;
		
		if (this.__schedule) { this.schedule(); }		
		if (this.mount instanceof Function) {
			let res = this.mount();
			if (res && (res.then instanceof Function)) {
				res.then(imba$1.commit);
			}		}		return this;
	}
	
	mounted$(){
		if (this.mounted instanceof Function) { this.mounted(); }		return this;
	}
	
	disconnectedCallback(){
		this.__f &= ~16;
		if (this.__f & 64) { this.unschedule(); }		if (this.unmount instanceof Function) { return this.unmount() }	}
	
	tick(){
		return this.render && this.render();
	}
	
	awaken(){
		return this.__schedule = true;
	}
} ImbaElement.init$();

root.customElements.define('imba-element',ImbaElement);


imba$1.createElement = function (name,bitflags,parent,flags,text,sfc){
	var el = document.createElement(name);
	
	if (flags) { el.className = flags; }	
	if (sfc) {
		el.setAttribute('data-' + sfc,'');
	}	
	if (text !== null) {
		el.text$(text);
	}	
	if (parent && (parent instanceof Node)) {
		el.insertInto$(parent);
	}	
	return el;
};

imba$1.createComponent = function (name,bitflags,parent,flags,text,sfc){
	// the component could have a different web-components name?
	var el = document.createElement(name);
	
	if (CustomTagConstructors[name]) {
		el = CustomTagConstructors[name].create$(el);
		el.slot$ = ImbaElement.prototype.slot$;
		el.__slots = {};
	}	
	el.up$ = parent;
	el.__f = bitflags;
	el.init$();
	
	if (text !== null) {
		el.slot$('__').text$(text);
	}	
	if (flags) { el.className = flags; }	
	if (sfc) {
		el.setAttribute('data-' + sfc,'');
	}	
	return el;
};

imba$1.createSVGElement = function (name,bitflags,parent,flags,text,sfc){
	var el = document.createElementNS("http://www.w3.org/2000/svg",name);
	if (flags) {
		{
			el.className.baseVal = flags;
		}	}	if (parent && (parent instanceof Node)) {
		el.insertInto$(parent);
	}	return el;
};

// import './intersect'

function iter$$4(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var $1 = new WeakMap(), $2 = new WeakMap(), $3 = new WeakMap(), $4 = new WeakMap(), $5 = new WeakMap(), $6 = new WeakMap(), $7 = new WeakMap(), $8 = new WeakMap(), $9 = new WeakMap();
var state = {
	keys: [],
	mouse: {x: 0,y: 0},
	bullets: []
};

class Gun {
	static init$(){
		
		return this;
	}
	constructor(){
		
		
	}
	set rate(value) {
		return $1.set(this,value);
	}
	get rate() {
		return $1.has(this) ? $1.get(this) : 10000;
	}
	set busy(value) {
		return $2.set(this,value);
	}
	get busy() {
		return $2.get(this);
	}
	
	fire(){
		var self = this;
		if (this.busy) { return }		this.busy = true;
		state.bullets.push(new Bullet().fly());
		return setTimeout(function() {
			return self.busy = false;
		},60000 / this.rate);
	}
} Gun.init$();
class Player {
	static init$(){
		
		return this;
	}
	constructor(){
		
		
	}
	set position(value) {
		return $3.set(this,value);
	}
	get position() {
		if (!$3.has(this)) { $3.set(this,{x: 0,y: 0}); }		return $3.get(this);
	}
	set rotation(value) {
		return $4.set(this,value);
	}
	get rotation() {
		return $4.has(this) ? $4.get(this) : 0;
	}
	set gun(value) {
		return $5.set(this,value);
	}
	get gun() {
		if (!$5.has(this)) { $5.set(this,new Gun()); }		return $5.get(this);
	}
	
	init(){
		this.position.x = state.boundings.width / 2;
		return this.position.y = state.boundings.height / 2;
	}
	
	update(){
		this.move();
		this.rotate();
		return this.shoot();
	}
	
	shoot(){
		if (!state.mouse.press) { return }		return this.gun.fire();
	}
	
	rotate(){
		return this.rotation = -Math.atan2(state.mouse.x - this.position.x,state.mouse.y - this.position.y) / 3.1415 * 180.0;
	}
	
	move(){
		if (state.keys.a) this.position.x = this.position.x - 1;
		if (state.keys.d) this.position.x = this.position.x + 1;
		if (state.keys.w) this.position.y = this.position.y + 1;
		if (state.keys.s) { return this.position.y = this.position.y - 1 }	}
	
	render(){
		var t$0, b$0, d$0, c$$ = (imba.ctx||{}), c$0, v$0, t$1, b$1, d$1, v$1, t$2;
		this.update();
		t$0=(b$0=d$0=1,c$$.b) || (b$0=d$0=0,c$$.b=t$0=imba.createSVGElement('g',0,null,null,null,null));
		b$0||(t$0.up$=c$$._);
		c$0 = t$0.$b || (t$0.$b={});
		(v$0=("translate(" + (this.position.x) + ", " + (this.position.y) + ") rotate(" + (this.rotation) + ")"),v$0===c$0.c || (t$0.set$('transform',c$0.c=v$0)));
		t$1 = (b$1=d$1=1,c$0.d) || (b$1=d$1=0,c$0.d=t$1=imba.createSVGElement('circle',0,t$0,null,null,null));
		b$1 || (t$1.set$('r',8));
		(v$1=("" + (state.mouse.press ? "white" : "green")),v$1===c$0.e || (t$1.set$('fill',c$0.e=v$1)));
		b$0 || (t$1=imba.createSVGElement('g',0,t$0,null,null,null));
		b$0 || (t$1.set$('transform','translate(5, 5)'));
		b$0 || (t$2=imba.createSVGElement('rect',0,t$1,null,null,null));
		b$0 || (t$2.set$('height',10));
		b$0 || (t$2.set$('width',2));
		b$0 || (t$2.set$('fill',"white"));
		return t$0;
	}
} Player.init$();
class Bullet {
	static init$(){
		
		return this;
	}
	constructor(){
		
		
	}
	set position(value) {
		return $6.set(this,value);
	}
	get position() {
		if (!$6.has(this)) { $6.set(this,{
			x: state.player.position.x + Math.cos((state.player.rotation) * 3.1415 / 180) * 5,
			y: state.player.position.y + Math.sin((state.player.rotation) * 3.1415 / 180) * 5
		}); }		return $6.get(this);
	}
	set rotation(value) {
		return $7.set(this,value);
	}
	get rotation() {
		if (!$7.has(this)) { $7.set(this,state.player.rotation + 90); }		return $7.get(this);
	}
	
	fly(){
		var self = this;
		setTimeout(function() {
			self.position.x = self.position.x + Math.cos((self.rotation) * 3.1415 / 180) * 20;
			self.position.y = self.position.y + Math.sin((self.rotation) * 3.1415 / 180) * 20;
			if (self.distanceToPlayerX() > 1000 || self.distanceToPlayerY() > 1000) {
				return self.deleteBullet();
			}			return self.fly();
		},16);
		return this;
	}
	
	distanceToPlayerX(){
		return Math.abs(state.player.position.x - this.position.x);
	}
	
	distanceToPlayerY(){
		return Math.abs(state.player.position.y - this.position.y);
	}
	
	deleteBullet(){
		var index = state.bullets.indexOf(this);
		if ((index != -1)) { return state.bullets.splice(index,1) }	}
	
	render(){
		var t$0, b$0, d$0, c$$ = (imba.ctx||{}), c$0, v$0, t$1;
		t$0=(b$0=d$0=1,c$$.f) || (b$0=d$0=0,c$$.f=t$0=imba.createSVGElement('g',0,null,null,null,null));
		b$0||(t$0.up$=c$$._);
		c$0 = t$0.$f || (t$0.$f={});
		(v$0=("translate(" + (this.position.x) + ", " + (this.position.y) + ") rotate(" + (this.rotation) + ")"),v$0===c$0.g || (t$0.set$('transform',c$0.g=v$0)));
		b$0 || (t$1=imba.createSVGElement('rect',0,t$0,null,null,null));
		b$0 || (t$1.set$('height',10));
		b$0 || (t$1.set$('width',1));
		b$0 || (t$1.set$('fill',"yellow"));
		return t$0;
	}
} Bullet.init$();

class AppRootComponent extends imba.tags.get('component','ImbaElement') {
	static init$(){
		
		return this;
	}
	init$(){
		super.init$();return undefined;
	}
	set container(value) {
		return $8.set(this,value);
	}
	get container() {
		return $8.get(this);
	}
	set player(value) {
		return $9.set(this,value);
	}
	get player() {
		if (!$9.has(this)) { $9.set(this,new Player()); }		return $9.get(this);
	}
	
	mount(){
		var self = this;
		state.boundings = this.container.getBoundingClientRect();
		state.ready = true;
		state.player = this.player;
		this.player.init();
		setInterval(function() {
			return self.render();
		},1);
		
		window.addEventListener('keydown',function(e) {
			return state.keys[e.key] = true;
		});
		
		window.addEventListener('keyup',function(e) {
			return state.keys[e.key] = false;
		});
		
		window.addEventListener('mousemove',function(e) {
			state.mouse.y = state.boundings.height - e.clientY;
			return state.mouse.x = e.clientX;
		});
		
		window.addEventListener('resize',function(e) {
			return state.boundings = self.container.getBoundingClientRect();
		});
		
		window.addEventListener('mousedown',function(e) {
			return state.mouse.press = true;
		});
		
		return window.addEventListener('mouseup',function(e) {
			return state.mouse.press = false;
		});
	}
	
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, i$$2, j$$2, k$3, c$3, t$4, b$4, d$4, c$4, v$4, t$5;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.h) || (b$1=d$1=0,c$0.h=this.container = t$1=imba.createSVGElement('svg',1024,t$0,null,null,null));
		b$1 || (t$1.set$('transform',"scale(1,-1)"));
		b$1 || (t$1.set$('height',"100%"));
		b$1 || (t$1.set$('width',"100%"));
		b$1 || (t$1.set$('style',"background-color: black"));
		if (state.ready) {
			(imba.ctx=(c$0.i$ || (c$0.i$={_:t$1})),i$$2=this.player.render());
			j$$2 = c$0.j || (c$0.j = j$$2 = imba.createIndexedFragment(0,null));
			k$3 = 0;
			c$3=j$$2.$;
			for (let i = 0, items = iter$$4(state.bullets), len = items.length, bullet; i < len; i++) {
				bullet = items[i];
				t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,j$$2,null,null,null));
				b$4||(t$4.up$=j$$2);
				c$4=t$4.$k || (t$4.$k={});
				(v$4=("translate(" + (bullet.position.x) + ", " + (bullet.position.y) + ") rotate(" + (bullet.rotation) + ")"),v$4===c$4.l || (t$4.set$('transform',c$4.l=v$4)));
				b$4 || (t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
				b$4 || (t$5.set$('width',10));
				b$4 || (t$5.set$('height',1));
				b$4 || (t$5.set$('fill',"yellow"));
				k$3++;
			}j$$2.end$(k$3);
		}
		(c$0.i$$2_ = t$1.insert$(i$$2,7168,c$0.i$$2_));
		(c$0.j$$2_ = t$1.insert$(j$$2,7168,c$0.j$$2_));		t$0.close$(d$0);
		return t$0;
	}
} AppRootComponent.init$(); imba.tags.define('app-root',AppRootComponent,{});
//# sourceMappingURL=app.imba.js.map
