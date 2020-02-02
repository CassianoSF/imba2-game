
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

function iter$$4(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class Bullet {
	constructor(spread,damage,power,speed){
		this.spread = spread;
		this.damage = damage;
		this.power = power;
		this.speed = speed;
		this.position = {
			x: state.player.position.x + Math.cos((state.player.rotation) * 0.01745) * 5,
			y: state.player.position.y + Math.sin((state.player.rotation) * 0.01745) * 5
		};
		this.rotation = state.player.rotation + 90 + (Math.random() * spread - (spread / 2));
	}
	
	update(){
		this.checkColision();
		this.position.x = this.position.x + Math.cos((this.rotation) * 0.01745) * this.speed * state.delta;
		this.position.y = this.position.y + Math.sin((this.rotation) * 0.01745) * this.speed * state.delta;
		if (this.distanceToPlayerX() > window.innerWidth || this.distanceToPlayerY() > window.innerHeight) {
			return state.bullets.delete(this);
		}	}
	
	distanceToPlayerX(){
		return Math.abs(state.player.position.x - this.position.x);
	}
	
	distanceToPlayerY(){
		return Math.abs(state.player.position.y - this.position.y);
	}
	
	distanceToZombieX(zombie){
		return Math.abs(zombie.position.x - this.position.x);
	}
	
	distanceToZombieY(zombie){
		return Math.abs(zombie.position.y - this.position.y);
	}
	
	currentSector(){
		return ("" + (~~(this.position.x / 1800)) + "|" + (~~(this.position.y / 1800)));
	}
	
	checkColision(){
		let res = [];
		for (let zombie of iter$$4(state.sector[this.currentSector()])){
			res.push((this.distanceToZombieX(zombie) < zombie.size && this.distanceToZombieY(zombie) < zombie.size) && (
				state.bullets.delete(this),
				zombie.takeHit(this)
			));
		}		return res;
	}
}

class Gun {
	constructor(cap,rate,spread,damage,power,projectiles,speed,reload_time,name,price,penetration = 1){
		this.rate = rate;
		this.spread = spread;
		this.damage = damage;
		this.power = power;
		this.last_shot = 0;
		this.projectiles = projectiles;
		this.speed = speed;
		this.reload_time = reload_time;
		this.cap = cap;
		this.ammo = this.cap;
		this.reloading = false;
		this.name = name;
		this.price = price;
		// @penetration = penetration
	}
	
	fire(){
		if (this.reloading) { return }		if (this.ammo == 0) {
			return this.reload();
		} else if (state.time - this.last_shot > 60000 / this.rate && this.ammo > 0) {
			this.ammo--;
			this.last_shot = state.time;
			let res = [];
			for (let len = this.projectiles, i = 0, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
				res.push(state.bullets.add(new Bullet(this.spread,this.damage,this.power,this.speed)));
			}			return res;
		}	}
	
	reload(){
		if (this.ammo != this.cap) {
			return this.reloading = this.reload_time;
		}	}
	
	update(){
		if (this.reloading) {
			this.reloading -= state.delta * 5;
			if (this.reloading <= 0) {
				this.reloading = false;
				return this.ammo = this.cap;
			}		}	}
}

function iter$$5(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class Player {
	constructor(inventory){
		this.position = {x: 0,y: 0};
		this.rotation = 0;
		this.inventory = inventory;
		this.score = 100000;
		this.gun = this.inventory[0];
		this.holsters = [this.gun];
		this.speed = .3;
		this.nearZombies = new Set();
		this.life = 100;
		this.slots = 2;
	}
	
	update(){
		if (this.dead) { return }		this.gun.update();
		this.move();
		this.rotate();
		this.shoot();
		let x = ~~((this.position.x - 899) / 1800);
		let y = ~~((this.position.y - 899) / 1800);
		
		this.nearZombies.clear();
		for (let val of iter$$5((state.sector[("" + (x + 0) + "|" + (y + 0))]))){
			this.nearZombies.add(val);
		}		for (let val of iter$$5((state.sector[("" + (x + 0) + "|" + (y + 1))]))){
			this.nearZombies.add(val);
		}		for (let val of iter$$5((state.sector[("" + (x + 1) + "|" + (y + 1))]))){
			this.nearZombies.add(val);
		}		let res = [];
		for (let val of iter$$5((state.sector[("" + (x + 1) + "|" + (y + 0))]))){
			res.push(this.nearZombies.add(val));
		}		return res;
	}
	
	shoot(){
		if (this.isInSafeZone()) { return }		if (state.mouse.press) { return this.gun.fire() }	}
	
	rotate(){
		let diffX = state.mouse.x - window.innerWidth / 2;
		let diffY = state.mouse.y - window.innerHeight / 2;
		return this.rotation = -Math.atan2(diffX,diffY) * 57.2974694;
	}
	
	move(){
		let slower;		if (((state.keys.KeyA || 0) + (state.keys.KeyD || 0) + (state.keys.KeyW || 0) + (state.keys.KeyS || 0)) > 1) {
			slower = 0.707;
		} else {
			slower = 1;
		}		
		if (state.keys.KeyA) this.position.x = this.position.x - this.speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1);
		if (state.keys.KeyD) this.position.x = this.position.x + this.speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1);
		if (state.keys.KeyW) this.position.y = this.position.y + this.speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1);
		if (state.keys.KeyS) { return this.position.y = this.position.y - this.speed * state.delta * slower * (state.keys.ShiftLeft ? 2 : 1) }	}
	
	
	changeGun(slot){
		if (this.holsters[slot]) {
			this.gun.reloading = false;
			return this.gun = this.holsters[slot];
		}	}
	
	onKeyEvent(key){
		var self = this;
		let actions = {
			'Digit1': function() { return self.changeGun(0); },
			'Digit2': function() { return self.changeGun(1); },
			'Digit3': function() { return self.changeGun(2); },
			'Digit4': function() { return self.changeGun(3); },
			'Digit5': function() { return self.changeGun(4); },
			'KeyR': function() { return self.gun.reload(); }
		};
		return actions[key] && actions[key]();
	}
	
	takeHit(damage){
		if (this.dead) { return }		this.life -= damage;
		if (this.life <= 0) {
			return this.dead = true;
		}	}
	
	isInSafeZone(){
		return Math.abs(this.position.x) < 50 && Math.abs(this.position.y) < 50;
	}
}

function iter$$6(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
let DRIFT = 0;
let AGGRO = 1;
let ATTACK = 2;
let DEAD = 3;

function randomPosition(player){
	let posx = Math.random() * window.innerWidth * 30 - (window.innerWidth * 15);
	let posy = Math.random() * window.innerHeight * 30 - (window.innerHeight * 15);
	let diffx = Math.abs(posx - this.player.position.x);
	let diffy = Math.abs(posy - this.player.position.y);
	if (diffx < 400 && diffy < 400) {
		return randomPosition();
	}	
	return {
		x: posx,
		y: posy
	};
}
class Zombie {
	constructor(player){
		this.player = player;
		this.position = randomPosition(this.player);
		this.rotation = Math.random() * 360;
		this.sector = ("" + (~~(this.position.x / 1800)) + "|" + (~~(this.position.y / 1800)));
		this.state = 0;
		this.speed = .2;
		this.base_speed = .2;
		this.max_speed = .6;
		this.size = 20;
		this.turn = 0;
		this.life = 100;
		this.death = 0;
	}
	
	update(){
		this.updateSector();
		this.checkColisions();
		if (this.state === DEAD) { return this.execDead() }		if (this.state === DRIFT) { return this.execDrift() }		if (this.state === AGGRO) { return this.execAggro() }		if (this.state === ATTACK) { return this.execAttack() }	}
	
	execDead(){
		var v_;
		if (state.time - this.death > 5000) {
			state.killed.delete(this);
			return (((v_ = this),v_));
		}	}
	
	execAttack(){
		if (!this.start_attack) {
			this.start_attack = state.time;
		}		if (state.time - this.start_attack > 100 && this.playerIsClose(this.size * 1.5) && !this.player_beaten) {
			this.player_beaten = true;
			this.player.takeHit(10);
		}		if (state.time - this.start_attack > 500) {
			this.start_attack = false;
			this.player_beaten = false;
			return this.state = AGGRO;
		}	}
	
	execDrift(){
		if (this.playerDetected()) {
			this.state = AGGRO;
		}		if (state.time % 200 == 0) {
			this.turn = Math.floor(Math.random() * 2);
			this.speed = Math.random() * this.base_speed;
		}		if (state.time % 3 == 0) {
			if (this.turn == 0) {
				this.rotation += Math.random() * 3;
			} else if (this.turn == 1) {
				this.rotation -= Math.random() * 3;
			}		}		return this.move();
	}
	
	execAggro(){
		if (this.player.isInSafeZone()) {
			this.state = DRIFT;
		}		if (this.playerIsClose(this.size * 1.5)) {
			this.state = ATTACK;
		}		if (this.speed < this.max_speed) { this.speed += 0.01; }		this.rotation = this.angleToPlayer();
		return this.move();
	}
	
	zombieColide(){
		var sector_;
		(sector_ = state.sector)[this.sector] || (sector_[this.sector] = new Set());
		for (let zombie of iter$$6(state.sector[this.sector])){
			if (this.distanceToZombieX(zombie) < this.size && this.distanceToZombieY(zombie) < this.size) {
				if (!(zombie === this)) { return zombie }			}		}		return false;
	}
	
	angleToPlayer(){
		let dx = this.player.position.x - this.position.x;
		let dy = this.player.position.y - this.position.y;
		return -(Math.atan2(dx,dy) / 0.01745 - 90) % 360;
	}
	
	distanceToPlayerX(){
		return Math.abs(this.player.position.x - this.position.x);
	}
	
	distanceToPlayerY(){
		return Math.abs(this.player.position.y - this.position.y);
	}
	
	distanceToZombieX(zombie){
		return Math.abs(zombie.position.x - this.position.x);
	}
	
	distanceToZombieY(zombie){
		return Math.abs(zombie.position.y - this.position.y);
	}
	
	move(){
		this.position.x = this.position.x - Math.sin((this.rotation - 90) * 0.01745) * state.delta * this.speed;
		return this.position.y = this.position.y + Math.cos((this.rotation - 90) * 0.01745) * state.delta * this.speed;
	}
	
	playerOnSight(){
		return Math.abs((this.angleToPlayer() - this.rotation) % 360) < 30;
	}
	
	playerIsClose(distance){
		return this.distanceToPlayerX() < distance && this.distanceToPlayerY() < distance;
	}
	
	playerDetected(){
		return (this.playerOnSight() && this.playerIsClose(750) || this.playerIsClose(40)) && !this.player.isInSafeZone();
	}
	
	currentSector(){
		return ("" + (~~(this.position.x / 1800)) + "|" + (~~(this.position.y / 1800)));
	}
	
	updateSector(){
		var sector_, $1;
		let temp_sector = this.currentSector();
		if (temp_sector != this.sector) {
			(sector_ = state.sector)[this.sector] || (sector_[this.sector] = new Set());
			state.sector[this.sector].delete(this);
			this.sector = temp_sector;
			($1 = state.sector)[this.sector] || ($1[this.sector] = new Set());
			return state.sector[this.sector].add(this);
		}	}
	
	checkColisions(){
		var position_, $1;
		let zom_col = this.zombieColide();
		if (zom_col) {
			let dx = Math.sin((this.rotation + 90) * 0.01745) * this.speed * state.delta;
			let dy = Math.cos((this.rotation + 90) * 0.01745) * this.speed * state.delta;
			(position_ = zom_col.position).x = position_.x + dx * 0.5;
			($1 = zom_col.position).y = $1.y - dy * 0.5;
			this.position.x = this.position.x - dx;
			return this.position.y = this.position.y + dy;
		}	}
	
	takeHit(bullet){
		this.position.x = this.position.x - Math.sin((bullet.rotation - 90) * 0.01745) * bullet.power;
		this.position.y = this.position.y + Math.cos((bullet.rotation - 90) * 0.01745) * bullet.power;
		this.state = AGGRO;
		this.life -= bullet.damage;
		if (this.life <= 0) {
			state.sector[this.sector].delete(this);
			state.killed.add(this);
			this.state = DEAD;
			this.player.score = this.player.score + 10;
			return this.death = state.time;
		}	}
}

function iter$$7(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class Game {
	constructor(renderer){
		this.renderer = renderer;
		state.first_date = new Date();
		window.addEventListener('keydown',this.keydownEvent);
		window.addEventListener('keyup',this.keyupEvent);
		window.addEventListener('mousemove',this.mousemoveEvent);
		window.addEventListener('mousedown',this.mousedownEvent);
		window.addEventListener('mouseup',this.mouseupEvent);
		setInterval(this.update.bind(this),16);
	}
	
	update(){
		let current_date = new Date();
		state.delta = (current_date - (state.last_date || new Date())) / 5;
		state.time = current_date - state.first_date;
		state.last_date = current_date;
		if (state.delta > 4) { console.log(state.delta); }		state.player.update();
		
		for (let bullet of iter$$7(state.bullets)){
			if (bullet) { bullet.update(); }		}		
		for (let zombie of iter$$7(state.player.nearZombies)){
			if (zombie) { zombie.update(); }		}		
		for (let zombie of iter$$7(state.killed)){
			if (zombie) { zombie.update(); }		}		
		return this.renderer.render();
	}
	
	keydownEvent(e){
		state.player.onKeyEvent(e.code);
		return state.keys[e.code] = true;
	}
	
	keyupEvent(e){
		return state.keys[e.code] = false;
	}
	
	mousemoveEvent(e){
		state.mouse.x = e.clientX;
		return state.mouse.y = window.innerHeight - e.clientY;
	}
	
	mousedownEvent(e){
		return state.mouse.press = true;
	}
	
	mouseupEvent(e){
		return state.mouse.press = false;
	}
}

var $1;

var guns = [
	//       cap,   rate,  spread, damage, power, projectiles, speed, reload_time,  name,               price
	new Gun(6,150,15,30,15,1,8,2000,'revolver',0),
	new Gun(12,170,10,13,15,1,7,1000,'usp45',2000),
	new Gun(7,100,20,50,30,1,8,1400,'desert eagle',5000),
	new Gun(30,1000,15,13,5,1,8,1000,'mp5',10000),
	new Gun(25,800,17,17,8,1,7,1000,'ump',15000),
	new Gun(5,60,25,12,30,6,6,2200,'pump shotgun',20000),
	new Gun(2,300,25,20,40,6,7,1800,'double barrel',22000),
	new Gun(15,600,20,40,20,1,12,1500,'ak47',30000),
	new Gun(25,800,15,30,15,1,13,1200,'m4a1',33000),
	new Gun(10,220,6,50,15,1,14,1500,'dragunov',15000),
	new Gun(5,60,4,100,20,1,15,1600,'m95',18000)
];

var player = new Player(guns);

let sector = {};
for (let i = 0; i <= 10000; i++) {
	let zombie = new Zombie(player);
	sector[$1 = zombie.currentSector()] || (sector[$1] = new Set());
	sector[zombie.currentSector()].add(zombie);
}
var state = {
	game: Game,
	time: 0,
	keys: [],
	mouse: {x: 0,y: 0},
	player: player,
	bullets: new Set(),
	camera: {},
	sector: sector,
	killed: new Set(),
	delta: 1,
	svg: {
		height: 1,
		width: 1
	},
	store: guns.slice(1,-1)
};

imba.inlineStyles(".you-died{left:33%;top:20%;font-size:15vw;color:#900;position:fixed;z-index:1;font-family:MenofNihilist;}.ui{position:fixed;z-index:1;font-family:MenofNihilist;color:white;}.score{top:2%;right:2%;font-size:30px;}.life{bottom:2%;right:2%;font-size:30px;}.slots{left:2%;bottom:10%;font-size:16px;}.select-slot{color:green;}.ammo{bottom:2%;left:2%;font-size:30px;}.onHand{color:yellow;}\n");

class PlayerHudComponent extends imba.tags.get('component','ImbaElement') {
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, v$1, t$2, v$2, t$3, b$3, d$3, v$3, b$2, d$2, k$3, c$3, t$4, b$4, d$4, c$4, v$4, y$$1;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.b) || (b$1=d$1=0,c$0.b=t$1=imba.createElement('div',512,t$0,null,null,null));
		(v$1=(state.player.dead||undefined),v$1===c$0.d||(d$1|=2,c$0.d=v$1));
		(d$1&2 && t$1.flag$((c$0.d ? `fadeOut` : '')));
		t$2 = c$0.e || (c$0.e = t$2=imba.createElement('div',0,t$1,'ui score',null,null));
		(v$2="score ",v$2===c$0.f || (c$0.f_ = t$2.insert$(c$0.f=v$2,0,c$0.f_)));
		t$3 = (b$3=d$3=1,c$0.g) || (b$3=d$3=0,c$0.g=t$3=imba.createElement('b',4096,t$2,null,null,null));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=state.player.score,v$3===c$0.h || (c$0.h_ = t$3.insert$(c$0.h=v$3,0,c$0.h_)));
		t$2 = c$0.i || (c$0.i = t$2=imba.createElement('div',0,t$1,'ui life',null,null));
		(v$2="Life ",v$2===c$0.j || (c$0.j_ = t$2.insert$(c$0.j=v$2,0,c$0.j_)));
		t$3 = (b$3=d$3=1,c$0.k) || (b$3=d$3=0,c$0.k=t$3=imba.createElement('b',4096,t$2,null,null,null));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=state.player.life,v$3===c$0.l || (c$0.l_ = t$3.insert$(c$0.l=v$3,0,c$0.l_)));
		t$2 = (b$2=d$2=1,c$0.m) || (b$2=d$2=0,c$0.m=t$2=imba.createElement('div',2560,t$1,'ui slots',null,null));
		(v$2=(this.selected_gun||undefined),v$2===c$0.o||(d$2|=2,c$0.o=v$2));
		(d$2&2 && t$2.flag$('ui slots'+' '+(c$0.o ? `select-slot` : '')));
		t$3 = c$0.p || (c$0.p = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let len = state.player.slots, i = 0, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createElement('div',4608,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$q || (t$4.$q={});
			(v$4=(state.player.gun == state.player.holsters[i]||undefined),v$4===c$4.s||(d$4|=2,c$4.s=v$4));
			(d$4&2 && t$4.flag$((c$4.s ? `onHand` : '')));
			(v$4=("" + (i + 1) + ". " + ((state.player.holsters[i] || {}).name || '')),v$4===c$4.t || (c$4.t_ = t$4.insert$(c$4.t=v$4,0,c$4.t_)));
			k$3++;
		}t$3.end$(k$3);
		t$2 = c$0.u || (c$0.u = t$2=imba.createElement('div',0,t$1,'ui ammo',null,null));
		t$3 = (b$3=d$3=1,c$0.v) || (b$3=d$3=0,c$0.v=t$3=imba.createElement('b',4096,t$2,null,null,null));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=state.player.gun.ammo,v$3===c$0.w || (c$0.w_ = t$3.insert$(c$0.w=v$3,0,c$0.w_)));
		(v$2=" Ammo",v$2===c$0.x || (c$0.x_ = t$2.insert$(c$0.x=v$2,0,c$0.x_)));
		if (state.player.dead) {
			y$$1 = (b$2=d$2=1,c$0.y) || (b$2=d$2=0,c$0.y=y$$1=imba.createElement('div',0,null,'you-died fadeIn',"you died",null));
			b$2||(y$$1.up$=t$0);
		}
		(c$0.y$$1_ = t$0.insert$(y$$1,1024,c$0.y$$1_));		t$0.close$(d$0);
		return t$0;
	}
} imba.tags.define('player-hud',PlayerHudComponent,{});

/* css
    .you-died {
        left: 33%
        top: 20%
        font-size: 15vw;
        color: #900;
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
    }

    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
    }

    .score {
        top: 2%;
        right: 2%;
        font-size: 30px;
    }

    .life {
        bottom: 2%;
        right: 2%;
        font-size: 30px;
    }
    .slots {
        left: 2%;
        bottom: 10%;
        font-size: 16px;
    }

    .select-slot {
        color: green
    }

    .ammo {
        bottom: 2%;
        left: 2%;
        font-size: 30px;
    }

    .onHand { 
        color: yellow
    }
*/

imba.inlineStyles(".ui{position:fixed;z-index:1;font-family:MenofNihilist;color:white;}.row{width:40%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}.buy-row{width:40%;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}.guns{width:50vw;}.prices{text-align:right;-webkit-box-flex:2;-webkit-flex-grow:2;-ms-flex-positive:2;flex-grow:2;}.action{text-align:right;-webkit-box-flex:3;-webkit-flex-grow:3;-ms-flex-positive:3;flex-grow:3;margin-left:10%;}.action:hover,.buy-row:hover{color:#5F5;font-size:20;}.store{left:2%;top:2%;font-size:15px;margin:3%;}.ui{position:fixed;z-index:1;font-family:MenofNihilist;color:white;}\n");
function iter$$8(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class PlayerStoreComponent extends imba.tags.get('component','ImbaElement') {
	buyGun(gun){
		var player_;
		if (gun.price <= state.player.score) {
			(player_ = state.player).score = player_.score - gun.price;
			var index = state.store.indexOf(gun);
			if ((index != -1)) { state.store.splice(index,1); }			return state.player.inventory.push(gun);
		}	}
	
	upgradeGun(gun){
		return;
	}
	
	useGun(gun){
		if (state.player.holsters.find(function(g) { return g == gun; })) { return }		if (state.player.holsters[state.player.slots - 1]) {
			state.player.holsters.pop();
		}		return state.player.holsters.unshift(gun);
	}
	
	render(){
		var t$0, c$0, b$0, d$0, t$1, t$2, k$2, c$2, t$3, b$3, d$3, c$3, v$3, t$4, v$4, b$4, d$4;
		if (state.player.isInSafeZone()) {
			t$0=this;
			t$0.open$();
			c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
			((!b$0||d$0&2) && t$0.flagSelf$('ui'));
			t$1 = c$0.b || (c$0.b = t$1=imba.createElement('div',2048,t$0,'store',null,null));
			t$2 = c$0.c || (c$0.c = t$2 = imba.createIndexedFragment(0,t$1));
			k$2 = 0;
			c$2=t$2.$;
			for (let i = 0, items = iter$$8(state.store), len = items.length, gun; i < len; i++) {
				gun = items[i];
				t$3 = (b$3=d$3=1,c$2[k$2]) || (b$3=d$3=0,c$2[k$2] = t$3=imba.createElement('div',0,t$2,'buy-row',null,null));
				b$3||(t$3.up$=t$2);
				c$3=t$3.$d || (t$3.$d={});
				v$3 = c$3.e || (c$3.e={buyGun: [null]});
				v$3.buyGun[0]=gun;
				b$3 || t$3.on$(`click`,v$3,this);
				t$4 = c$3.f || (c$3.f = t$4=imba.createElement('div',4096,t$3,'guns',null,null));
				(v$4=("buy " + (gun.name)),v$4===c$3.g || (c$3.g_ = t$4.insert$(c$3.g=v$4,0,c$3.g_)));
				t$4 = c$3.h || (c$3.h = t$4=imba.createElement('div',4096,t$3,'prices',null,null));
				(v$4=gun.price,v$4===c$3.i || (c$3.i_ = t$4.insert$(c$3.i=v$4,0,c$3.i_)));
				k$2++;
			}t$2.end$(k$2);
			b$0 || (t$2=imba.createElement('div',0,t$1,'row',null,null));
			b$0 || (t$2.css$('margin-top',"5%"));
			t$2 = c$0.j || (c$0.j = t$2 = imba.createIndexedFragment(0,t$1));
			k$2 = 0;
			c$2=t$2.$;
			for (let i = 0, items = iter$$8(state.player.inventory), len = items.length, gun; i < len; i++) {
				gun = items[i];
				t$3 = (b$3=d$3=1,c$2[k$2]) || (b$3=d$3=0,c$2[k$2] = t$3=imba.createElement('div',0,t$2,'row',null,null));
				b$3||(t$3.up$=t$2);
				c$3=t$3.$k || (t$3.$k={});
				t$4 = c$3.l || (c$3.l = t$4=imba.createElement('div',4096,t$3,'guns',null,null));
				(v$4=gun.name,v$4===c$3.m || (c$3.m_ = t$4.insert$(c$3.m=v$4,0,c$3.m_)));
				t$4 = (b$4=d$4=1,c$3.n) || (b$4=d$4=0,c$3.n=t$4=imba.createElement('div',0,t$3,'action',"Use",null));
				v$4 = c$3.o || (c$3.o={useGun: [null]});
				v$4.useGun[0]=gun;
				b$4 || t$4.on$(`click`,v$4,this);
				t$4 = (b$4=d$4=1,c$3.p) || (b$4=d$4=0,c$3.p=t$4=imba.createElement('div',0,t$3,'action',"Upgrade",null));
				v$4 = c$3.q || (c$3.q={upgradeGun: [null]});
				v$4.upgradeGun[0]=gun;
				b$4 || t$4.on$(`click`,v$4,this);
				k$2++;
			}t$2.end$(k$2);
			t$0.close$(d$0);
			return t$0;
		}	}
} imba.tags.define('player-store',PlayerStoreComponent,{});

/* css
    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
    }

    .row {
        width: 40%;
        display: flex;
    }

    .buy-row {
        width: 40%;
        display: flex;
    }

    .guns{
        width: 50vw;
    }

    .prices {
        text-align: right;
        flex-grow: 2;
    }

    .action{
        text-align: right;
        flex-grow: 3;
        margin-left: 10%
    }

    .action:hover, .buy-row:hover{
        color: #5F5;
        font-size: 20;
    }

    .store {
        left: 2%;
        top: 2%;
        font-size: 15px;
        margin: 3%;
    }

    .ui {
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
        color: white;
    }


*/

imba.inlineStyles("body{margin:0px;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}app-root{display:block;position:relative;background-color:black;cursor:none;}@font-face{font-family:MenofNihilist;src:url(./fonts/MenofNihilist-Regular.otf) format(\"opentype\");}@-webkit-keyframes fadeOut{0%{opacity:1;}to{opacity:0;}}@keyframes fadeOut{0%{opacity:1;}to{opacity:0;}}@-webkit-keyframes fadeIn{0%{opacity:0;}to{opacity:1;}}@keyframes fadeIn{0%{opacity:0;}to{opacity:1;}}.fadeOut{-webkit-animation-duration:2.5s;-webkit-animation-duration:2.5s;animation-duration:2.5s;-webkit-animation-fill-mode:both;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-name:fadeOut;-webkit-animation-name:fadeOut;animation-name:fadeOut;}.fadeIn{-webkit-animation-duration:2.5s;-webkit-animation-duration:2.5s;animation-duration:2.5s;-webkit-animation-fill-mode:both;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-name:fadeIn;-webkit-animation-name:fadeIn;animation-name:fadeIn;}\n");
function iter$$9(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class AppRootComponent extends imba.tags.get('component','ImbaElement') {
	
	mount(){
		return new (state.game)(this);
	}
	
	cameraPosX(){
		return window.innerWidth / 2 - state.player.position.x;
	}
	
	cameraPosY(){
		return window.innerHeight / 2 - state.player.position.y;
	}
	
	transformCamera(){
		if (state.time - state.player.gun.last_shot < 30) {
			let power = state.player.gun.power / 2;
			let x = this.cameraPosX() + Math.random() * power - power / 2;
			let y = this.cameraPosY() + Math.random() * power - power / 2;
			return ("translate(" + x + ", " + y + ")");
		} else {
			return ("translate(" + this.cameraPosX() + ", " + this.cameraPosY() + ")");
		}	}
	
	transformPlayer(){
		return ("translate(" + (state.player.position.x) + ", " + (state.player.position.y) + ") rotate(" + (state.player.rotation) + ")");
	}
	
	transformBullet(bullet){
		return ("translate(" + (bullet.position.x) + ", " + (bullet.position.y) + ") rotate(" + (bullet.rotation) + ")");
	}
	
	transformZombie(zombie){
		return ("translate(" + (zombie.position.x) + ", " + (zombie.position.y) + ") rotate(" + (zombie.rotation) + ")");
	}
	
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, t$2, b$2, d$2, v$2, t$3, b$3, d$3, v$3, t$4, t$5, k$3, c$3, b$4, d$4, c$4, v$4, b$5, d$5, v$5;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.b) || (b$1=d$1=0,c$0.b=t$1=imba.createComponent('player-hud',0,t$0,null,null,null));
		b$1 || !t$1.setup || t$1.setup(d$1);
		t$1.end$(d$1);
		b$1 || t$1.insertInto$(t$0);
		t$1 = (b$1=d$1=1,c$0.c) || (b$1=d$1=0,c$0.c=t$1=imba.createComponent('player-store',0,t$0,null,null,null));
		b$1 || !t$1.setup || t$1.setup(d$1);
		t$1.end$(d$1);
		b$1 || t$1.insertInto$(t$0);
		b$0 || (t$1=imba.createSVGElement('svg',0,t$0,null,null,null));
		b$0 || (t$1.set$('transform',"scale(1,-1)"));
		b$0 || (t$1.set$('height',"100%"));
		b$0 || (t$1.set$('width',"100%"));
		b$0 || (t$1.set$('style',"background-color: black"));
		t$2 = (b$2=d$2=1,c$0.d) || (b$2=d$2=0,c$0.d=t$2=imba.createSVGElement('g',0,t$1,null,null,null));
		(v$2=("translate(" + (state.mouse.x) + ", " + (state.mouse.y) + ")"),v$2===c$0.e || (t$2.set$('transform',c$0.e=v$2)));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('y1',4));
		b$2 || (t$3.set$('y2',10));
		b$2 || (t$3.set$('stroke','#AFA'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('y1',-4));
		b$2 || (t$3.set$('y2',-10));
		b$2 || (t$3.set$('stroke','#AFA'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('x1',4));
		b$2 || (t$3.set$('x2',10));
		b$2 || (t$3.set$('stroke','#AFA'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('x1',-4));
		b$2 || (t$3.set$('x2',-10));
		b$2 || (t$3.set$('stroke','#AFA'));
		t$2 = (b$2=d$2=1,c$0.f) || (b$2=d$2=0,c$0.f=t$2=imba.createSVGElement('g',2560,t$1,null,null,null));
		(v$2=this.transformCamera(),v$2===c$0.g || (t$2.set$('transform',c$0.g=v$2)));
		(v$2=(state.player.dead||undefined),v$2===c$0.i||(d$2|=2,c$0.i=v$2));
		(d$2&2 && t$2.flag$((c$0.i ? `fadeOut` : '')));
		t$3 = (b$3=d$3=1,c$0.j) || (b$3=d$3=0,c$0.j=t$3=imba.createSVGElement('g',0,t$2,null,null,null));
		(v$3=this.transformPlayer(),v$3===c$0.k || (t$3.set$('transform',c$0.k=v$3)));
		b$3 || (t$4=imba.createSVGElement('circle',0,t$3,null,null,null));
		b$3 || (t$4.set$('r',"10"));
		b$3 || (t$4.set$('fill',"white"));
		b$3 || (t$4=imba.createSVGElement('g',0,t$3,null,null,null));
		b$3 || (t$4.set$('transform','translate(5, 5)'));
		b$3 || (t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
		b$3 || (t$5.set$('height',"13"));
		b$3 || (t$5.set$('width',"2"));
		b$3 || (t$5.set$('fill',"white"));
		t$3 = c$0.l || (c$0.l = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let bullet of iter$$9(state.bullets)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$m || (t$4.$m={});
			(v$4=this.transformBullet(bullet),v$4===c$4.n || (t$4.set$('transform',c$4.n=v$4)));
			b$4 || (t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			b$4 || (t$5.set$('width',"50"));
			b$4 || (t$5.set$('height',"1"));
			b$4 || (t$5.set$('fill',"yellow"));
			k$3++;
		}t$3.end$(k$3);
		t$3 = c$0.o || (c$0.o = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let zombie of iter$$9(state.player.nearZombies)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$p || (t$4.$p={});
			(v$4=this.transformZombie(zombie),v$4===c$4.q || (t$4.set$('transform',c$4.q=v$4)));
			t$5 = (b$5=d$5=1,c$4.r) || (b$5=d$5=0,c$4.r=t$5=imba.createSVGElement('circle',0,t$4,null,null,null));
			(v$5=zombie.size / 2,v$5===c$4.s || (t$5.set$('r',c$4.s=v$5)));
			b$5 || (t$5.set$('fill',"red"));
			b$5 || (t$5.set$('stroke','black'));
			t$5 = (b$5=d$5=1,c$4.t) || (b$5=d$5=0,c$4.t=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.u || (t$5.set$('width',c$4.u=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"6"));
			b$5 || (t$5.set$('fill',"red"));
			t$5 = (b$5=d$5=1,c$4.v) || (b$5=d$5=0,c$4.v=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.w || (t$5.set$('width',c$4.w=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"-10"));
			b$5 || (t$5.set$('fill',"red"));
			k$3++;
		}t$3.end$(k$3);
		t$3 = c$0.x || (c$0.x = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let zombie of iter$$9(state.killed)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,'fadeOut',null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$y || (t$4.$y={});
			(v$4=this.transformZombie(zombie),v$4===c$4.z || (t$4.set$('transform',c$4.z=v$4)));
			t$5 = (b$5=d$5=1,c$4.aa) || (b$5=d$5=0,c$4.aa=t$5=imba.createSVGElement('circle',0,t$4,null,null,null));
			(v$5=zombie.size / 2,v$5===c$4.ab || (t$5.set$('r',c$4.ab=v$5)));
			b$5 || (t$5.set$('fill',"grey"));
			b$5 || (t$5.set$('stroke','black'));
			t$5 = (b$5=d$5=1,c$4.ac) || (b$5=d$5=0,c$4.ac=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.ad || (t$5.set$('width',c$4.ad=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"6"));
			b$5 || (t$5.set$('fill',"grey"));
			t$5 = (b$5=d$5=1,c$4.ae) || (b$5=d$5=0,c$4.ae=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.af || (t$5.set$('width',c$4.af=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"-10"));
			b$5 || (t$5.set$('fill',"grey"));
			k$3++;
		}t$3.end$(k$3);
		b$2 || (t$3=imba.createSVGElement('circle',0,t$2,null,null,null));
		b$2 || (t$3.set$('x',"0"));
		b$2 || (t$3.set$('y',"0"));
		b$2 || (t$3.set$('r',50));
		b$2 || (t$3.set$('stroke',"green"));
		b$2 || (t$3.set$('fill',"rgba(0,255,0,0.1)"));
		t$0.close$(d$0);
		return t$0;
	}
} imba.tags.define('app-root',AppRootComponent,{});

/* css

    body {
        margin: 0px;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    app-root {
        display: block; 
        position: relative;
        background-color: black
        cursor: none;
    }

    @font-face {
        font-family: MenofNihilist;
        src: url(./fonts/MenofNihilist-Regular.otf) format("opentype");
    }

    @keyframes fadeOut {
        0% {
            opacity: 1
        }
        to {
            opacity: 0
        }
    }

    @keyframes fadeIn {
        0% {
            opacity: 0
        }
        to {
            opacity: 1
        }
    }

    .fadeOut {
        -webkit-animation-duration: 2.5s;
        animation-duration: 2.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeOut;
        animation-name: fadeOut
    }

    .fadeIn {
        -webkit-animation-duration: 2.5s;
        animation-duration: 2.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeIn;
        animation-name: fadeIn
    }
*/
//# sourceMappingURL=app.imba.js.map
