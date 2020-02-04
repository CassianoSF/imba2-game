
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

function iter$$4(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var global$ = (typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null));

class Game {
	constructor(renderer){
		this.renderer = renderer;
		state.first_date = new Date();
		state.last_date = new Date();
		window.addEventListener('keydown',this.keydownEvent);
		window.addEventListener('keyup',this.keyupEvent);
		window.addEventListener('mousemove',this.mousemoveEvent);
		window.addEventListener('mousedown',this.mousedownEvent);
		window.addEventListener('mouseup',this.mouseupEvent);
		setInterval(this.update.bind(this),16);
	}
	
	update(){
		let current_date = new Date();
		state.delta = (current_date - state.last_date) / 5;
		state.time = current_date - state.first_date;
		state.last_date = current_date;
		state.player.update();
		
		for (let bullet of iter$$4(state.bullets)){
			if (bullet) { bullet.update(); }		}		
		for (let zombie of iter$$4(state.player.nearZombies)){
			if (zombie) { zombie.update(); }		}		
		for (let zombie of iter$$4(state.killed)){
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
} global$.Game = Game;

class GameObject {
	constructor(){
		this.position;
		this.rotation;
		this.size;
	}
	
	static randomPosition(player){
		let posx = Math.random() * window.innerWidth * 30 - (window.innerWidth * 15);
		let posy = Math.random() * window.innerHeight * 30 - (window.innerHeight * 15);
		let diffx = Math.abs(posx - player.position.x);
		let diffy = Math.abs(posy - player.position.y);
		if (diffx < 400 && diffy < 400) {
			return this.randomPosition(player);
		}		
		return {
			x: posx,
			y: posy
		};
	}
	
	currentSector(){
		return ("" + (~~(this.position.x / 1000)) + "|" + (~~(this.position.y / 800)));
	}
	
	colideCircle(obj){
		return Math.sqrt(this.distanceToObjectX(obj) ** 2 + this.distanceToObjectY(obj) ** 2) < (this.size + obj.size);
	}
	
	colideQuad(obj){
		return this.distanceToObjectX() < (obj.size + this.size) && this.distanceToObjectY() < (obj.size + this.size);
	}
	
	distanceToObjectX(obj){
		return Math.abs(obj.position.x - this.position.x);
	}
	
	distanceToObjectY(obj){
		return Math.abs(obj.position.y - this.position.y);
	}
	
	moveForward(){
		this.position.x = this.position.x - Math.sin((this.rotation - 90) * 0.01745) * state.delta * this.speed;
		return this.position.y = this.position.y + Math.cos((this.rotation - 90) * 0.01745) * state.delta * this.speed;
	}
	
	angleToObject(obj){
		let dx = obj.position.x - this.position.x;
		let dy = obj.position.y - this.position.y;
		return -(Math.atan2(dx,dy) / 0.01745 - 90) % 360;
	}
}

function iter$$5(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class Bullet extends GameObject {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	constructor(spread,damage,power,speed,penetration){
		super(...arguments);
		this.spread = spread;
		this.damage = damage;
		this.power = power;
		this.speed = speed;
		this.penetration = penetration;
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
		if (this.distanceToObjectX(state.player) > window.innerWidth || this.distanceToObjectY(state.player) > window.innerHeight) {
			return state.bullets.delete(this);
		}	}
	
	checkColision(){
		let res = [];
		for (let zombie of iter$$5(state.zombies[this.currentSector()])){
			res.push((this.distanceToObjectX(zombie) < (zombie.size * 2) && this.distanceToObjectY(zombie) < (zombie.size * 2)) && (
				zombie.takeHit(this),
				this.penetration--,
				(this.penetration <= 0) && (
					state.bullets.delete(this)
				)
			));
		}		return res;
	}
} Bullet.init$();

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
		this.penetration = penetration;
		this.upgrades = {};
		this.upgrades.cap = 100 + price / 10;
		this.upgrades.rate = 100 + price / 10;
		this.upgrades.spread = 100 + price / 10;
		this.upgrades.damage = 100 + price / 10;
		this.upgrades.power = 100 + price / 10;
		this.upgrades.reload_time = 100 + price / 10;
	}
	
	fire(){
		if (this.reloading) { return }		if (this.ammo == 0) {
			return this.reload();
		} else if (state.time - this.last_shot > 60000 / this.rate && this.ammo > 0) {
			this.ammo--;
			this.last_shot = state.time;
			let res = [];
			for (let len = this.projectiles, i = 0, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
				res.push(state.bullets.add(new Bullet(this.spread,this.damage,this.power,this.speed,this.penetration)));
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

function iter$$6(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class Player extends GameObject {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	constructor(inventory){
		super(...arguments);
		this.position = {x: 0,y: 0};
		this.rotation = 0;
		this.size = 10;
		this.inventory = inventory;
		this.score = 100000;
		this.gun = this.inventory[0];
		this.holsters = [this.gun];
		this.speed = 0;
		this.maxSpeed = 1;
		this.nearZombies = new Set();
		this.nearObstacles = new Set();
		this.maxLife = 50;
		this.life = 5000;
		this.slots = 1;
		this.safe = true;
		this.stamina = 300;
		this.maxStamina = 500;
	}
	
	checkShop(){
		if (!this.inSafeZone()) { return state.shop.open = false }	}
	
	update(){
		if (this.dead) { return }		this.gun.update();
		this.move();
		this.rotate();
		this.shoot();
		this.updateNearObjects(state.obstacles,this.nearObstacles);
		this.updateNearObjects(state.zombies,this.nearZombies);
		this.checkColision(state.obstacles);
		this.checkColision(state.zombies);
		return this.checkShop();
	}
	
	updateNearObjects(objSectors,propSet){
		let x = ~~((this.position.x) / 1000);
		let y = ~~((this.position.y) / 800);
		propSet.clear();
		let res = [];
		for (let i = -1; i <= 1; i++) {
			let res1 = [];
			for (let j = -1; j <= 1; j++) {
				let res2 = [];
				for (let val of iter$$6((objSectors[("" + (x + i) + "|" + (y + j))]))){
					res2.push(propSet.add(val));
				}				res1.push(res2);
			}			res.push(res1);
		}		return res;
	}
	
	shoot(){
		if (this.inSafeZone()) { return }		if (state.mouse.press) { return this.gun.fire() }	}
	
	rotate(){
		let diffX = state.mouse.x - window.innerWidth / 2;
		let diffY = state.mouse.y - window.innerHeight / 2;
		return this.rotation = -Math.atan2(diffX,diffY) * 57.2974694;
	}
	
	move(){
		let slower;		let keyCount = (~~state.keys.KeyA + ~~state.keys.KeyD + ~~state.keys.KeyW + ~~state.keys.KeyS);
		
		// Aceleration
		if (keyCount && state.keys.ShiftLeft && this.stamina) {
			this.stamina--;
			if (this.speed < this.maxSpeed) { this.speed += 0.01; }		} else if (keyCount) {
			if (!(this.stamina >= this.maxStamina || state.keys.ShiftLeft)) { this.stamina++; }			if (this.speed < this.maxSpeed / 2) { this.speed += 0.01; }			if (this.speed >= this.maxSpeed / 2) { this.speed -= 0.01; }		} else {
			if (!(this.stamina >= this.maxStamina || state.keys.ShiftLeft)) { this.stamina++; }			this.speed = 0;
		}		
		// Diagonal correction
		if (((state.keys.KeyA || 0) + (state.keys.KeyD || 0) + (state.keys.KeyW || 0) + (state.keys.KeyS || 0)) > 1) {
			slower = 0.707;
		} else {
			slower = 1;
		}		
		if (state.keys.KeyA) this.position.x = this.position.x - this.speed * state.delta * slower;
		if (state.keys.KeyD) this.position.x = this.position.x + this.speed * state.delta * slower;
		if (state.keys.KeyW) this.position.y = this.position.y + this.speed * state.delta * slower;
		if (state.keys.KeyS) { return this.position.y = this.position.y - this.speed * state.delta * slower }	}
	
	checkColision(objSectors){
		var $1;
		objSectors[$1 = this.currentSector()] || (objSectors[$1] = new Set());
		let res = [];
		for (let obj of iter$$6(objSectors[this.currentSector()])){
			res.push(this.colideCircle(obj) && (
				this.position.x = this.position.x - Math.sin((this.angleToObject(obj) + 90) * 0.01745) * ((obj.speed * 1.5) || this.speed) * state.delta * 1.8,
				this.position.y = this.position.y + Math.cos((this.angleToObject(obj) + 90) * 0.01745) * ((obj.speed * 1.5) || this.speed) * state.delta * 1.8
			));
		}		return res;
	}
	
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
	
	inSafeZone(){
		return Math.abs(this.position.x) < 50 && Math.abs(this.position.y) < 50;
	}
	
	usingGun(gun){
		return this.holsters.find(function(g) { return g == gun; });
	}
	
	equip(gun){
		if (this.holsters.find(function(g) { return g == gun; })) { return }		if (this.holsters[this.slots - 1]) {
			this.holsters.pop();
		}		this.holsters.unshift(gun);
		return this.gun = gun;
	}
} Player.init$();

function iter$$7(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
let DRIFT = 0;
let AGGRO = 1;
let ATTACK = 2;
let DEAD = 3;

class Zombie extends GameObject {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	constructor(player,day){
		super(...arguments);
		this.player = player;
		this.position = GameObject.randomPosition(this.player);
		this.rotation = Math.random() * 360;
		this.sector = ("" + (~~(this.position.x / 1000)) + "|" + (~~(this.position.y / 800)));
		this.state = 0;
		this.speed = .2;
		this.base_speed = .2;
		this.max_speed = .6 + (day / 20);
		this.size = 10;
		this.turn = 0;
		this.life = 50 + (day * 3);
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
		}		if (state.time - this.start_attack > 100 && this.playerIsClose(this.size * 2) && !this.player_beaten) {
			this.player_beaten = true;
			this.player.takeHit(10);
		}		if (state.time - this.start_attack > 500) {
			this.start_attack = false;
			this.player_beaten = false;
			this.speed = 0;
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
			}		}		return this.moveForward();
	}
	
	execAggro(){
		if (this.player.inSafeZone()) {
			this.state = DRIFT;
		}		if (this.playerIsClose(this.size * 2.1)) {
			this.state = ATTACK;
		}		if (this.speed < this.max_speed) { this.speed += 0.01; }		this.rotation = this.angleToPlayer();
		return this.moveForward();
	}
	
	findColision(objSectors){
		objSectors[this.sector] || (objSectors[this.sector] = new Set());
		for (let obj of iter$$7(objSectors[this.sector])){
			if (this.colideCircle(obj)) {
				if (!(obj === this)) { return obj }			}		}		return false;
	}
	
	angleToPlayer(){
		let dx = this.player.position.x - this.position.x;
		let dy = this.player.position.y - this.position.y;
		return -(Math.atan2(dx,dy) / 0.01745 - 90) % 360;
	}
	
	playerOnSight(){
		return Math.abs((this.angleToPlayer() - this.rotation) % 360) < 30;
	}
	
	playerIsClose(distance){
		return this.distanceToObjectX(this.player) < distance && this.distanceToObjectY(this.player) < distance;
	}
	
	playerDetected(){
		return (this.playerOnSight() && this.playerIsClose(750) || this.playerIsClose(40)) && !this.player.inSafeZone();
	}
	
	updateSector(){
		var zombies_, $1;
		let temp_sector = this.currentSector();
		if (temp_sector != this.sector) {
			(zombies_ = state.zombies)[this.sector] || (zombies_[this.sector] = new Set());
			state.zombies[this.sector].delete(this);
			this.sector = temp_sector;
			($1 = state.zombies)[this.sector] || ($1[this.sector] = new Set());
			return state.zombies[this.sector].add(this);
		}	}
	
	checkColisions(){
		var position_, $1;
		let obj = this.findColision(state.obstacles);
		if (obj) {
			let dx = Math.sin((this.angleToObject(obj) + 90) * 0.01745) * this.speed * state.delta;
			let dy = Math.cos((this.angleToObject(obj) + 90) * 0.01745) * this.speed * state.delta;
			this.position.x = this.position.x - dx * 1.5;
			this.position.y = this.position.y + dy * 1.5;
			return;
		}		let zom_col = this.findColision(state.zombies);
		if (zom_col) {
			let dx = Math.sin((this.angleToObject(zom_col) + 90) * 0.01745) * this.speed * state.delta;
			let dy = Math.cos((this.angleToObject(zom_col) + 90) * 0.01745) * this.speed * state.delta;
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
		if (this.speed >= 0) { this.speed -= bullet.power / 30; }		if (this.life <= 0) {
			state.zombies[this.sector].delete(this);
			state.killed.add(this);
			this.state = DEAD;
			this.player.score = this.player.score + 90 + 10 * state.day;
			return this.death = state.time;
		}	}
} Zombie.init$();

class Obstacle extends GameObject {
	static init$(){
		return super.inherited instanceof Function && super.inherited(this);
	}
	constructor(){
		super(...arguments);
		this.position = {
			x: 10000 - Math.random() * 20000,
			y: 10000 - Math.random() * 20000
		};
		this.rotation = Math.random() * 360;
		this.size = 10 + Math.random() * 40;
	}
} Obstacle.init$();

var $1, $2;

var guns = [ //       cap,   rate,  spread, damage, power, projectiles, speed, reload_time,  name,               price
	new Gun(6,150,6,30,15,1,8,2000,'revolver',0),
	new Gun(12,280,10,13,15,1,7,1000,'usp45',500),
	new Gun(7,100,20,50,30,1,8,1400,'desert eagle',5000),
	new Gun(30,1000,15,13,5,1,8,1000,'mp5',10000),
	new Gun(5,60,25,12,16,6,8,2200,'pump shotgun',20000),
	new Gun(15,600,20,40,20,1,12,1500,'ak47',30000),
	new Gun(25,800,15,30,15,1,13,1200,'m4a1',33000),
	new Gun(5,60,4,100,20,1,15,1600,'m95',18000)
];
var player = new Player([guns[0]]);
let zombies = {};
for (let i = 0; i <= 50000; i++) {
	let zombie = new Zombie(player,1);
	zombies[$1 = zombie.currentSector()] || (zombies[$1] = new Set());
	zombies[zombie.currentSector()].add(zombie);
}

let obstacles = {};
for (let i = 0; i <= 10000; i++) {
	let ob = new Obstacle();
	obstacles[$2 = ob.currentSector()] || (obstacles[$2] = new Set());
	obstacles[ob.currentSector()].add(ob);
}
var state = {
	game: Game,
	time: 0,
	keys: [],
	mouse: {x: 0,y: 0},
	player: player,
	bullets: new Set(),
	camera: {},
	zombies: zombies,
	killed: new Set(),
	delta: 1,
	day: 1,
	obstacles: obstacles,
	svg: {
		height: 1,
		width: 1
	},
	store: guns.slice(1,-1),
	shop: {
		guns: [],
		upgradeGun: null,
		health: 500,
		speed: 500,
		stamina: 500,
		slots: 5000
	}
};

imba.inlineStyles(".you-died[data-i1cf1fae0]{left:33%;top:20%;font-size:15vw;color:#900;position:fixed;z-index:1;font-family:MenofNihilist;}.hud[data-i1cf1fae0]{position:fixed;z-index:1;font-family:Typewriter;color:white;}.stamina[data-i1cf1fae0]{bottom:10%;right:2%;font-size:15px;}.score[data-i1cf1fae0]{top:2%;right:2%;font-size:30px;}.life[data-i1cf1fae0]{bottom:2%;right:2%;font-size:30px;}.slots[data-i1cf1fae0]{left:2%;bottom:10%;font-size:16px;}.select-slot[data-i1cf1fae0]{color:green;}.ammo[data-i1cf1fae0]{bottom:2%;left:2%;font-size:30px;}.onHand[data-i1cf1fae0]{color:yellow;}\n");

class PlayerHudComponent extends imba.tags.get('component','ImbaElement') {
	init$(){
		super.init$();return this.setAttribute('data-i1cf1fae0','');
	}
	render(){
		var t$0, c$0, b$0, d$0, t$1, b$1, d$1, v$1, t$2, b$2, d$2, v$2, t$3, v$3, b$3, d$3, k$3, c$3, t$4, b$4, d$4, c$4, v$4, ae$$1;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		t$1 = (b$1=d$1=1,c$0.b) || (b$1=d$1=0,c$0.b=t$1=imba.createElement('div',512,t$0,null,null,'i1cf1fae0'));
		(v$1=(state.player.dead||undefined),v$1===c$0.d||(d$1|=2,c$0.d=v$1));
		(v$1=(!state.player.dead||undefined),v$1===c$0.f||(d$1|=2,c$0.f=v$1));
		(d$1&2 && t$1.flag$((c$0.d ? `fadeOut` : '')+' '+(c$0.f ? `fadeIn` : '')));
		t$2 = (b$2=d$2=1,c$0.g) || (b$2=d$2=0,c$0.g=t$2=imba.createElement('div',0,t$1,'hud stamina',null,'i1cf1fae0'));
		b$2 || (t$2.css$('font-size',"20px"));
		(v$2="Stamina ",v$2===c$0.h || (c$0.h_ = t$2.insert$(c$0.h=v$2,0,c$0.h_)));
		t$3 = c$0.i || (c$0.i = t$3=imba.createElement('b',4096,t$2,null,null,'i1cf1fae0'));
		(v$3=("" + (~~(state.player.stamina / state.player.maxStamina * 100)) + "%"),v$3===c$0.j || (c$0.j_ = t$3.insert$(c$0.j=v$3,0,c$0.j_)));
		t$2 = c$0.k || (c$0.k = t$2=imba.createElement('div',0,t$1,'hud score',null,'i1cf1fae0'));
		(v$2="score ",v$2===c$0.l || (c$0.l_ = t$2.insert$(c$0.l=v$2,0,c$0.l_)));
		t$3 = (b$3=d$3=1,c$0.m) || (b$3=d$3=0,c$0.m=t$3=imba.createElement('b',4096,t$2,null,null,'i1cf1fae0'));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=state.player.score,v$3===c$0.n || (c$0.n_ = t$3.insert$(c$0.n=v$3,0,c$0.n_)));
		t$2 = c$0.o || (c$0.o = t$2=imba.createElement('div',0,t$1,'hud life',null,'i1cf1fae0'));
		(v$2="Life ",v$2===c$0.p || (c$0.p_ = t$2.insert$(c$0.p=v$2,0,c$0.p_)));
		t$3 = (b$3=d$3=1,c$0.q) || (b$3=d$3=0,c$0.q=t$3=imba.createElement('b',4096,t$2,null,null,'i1cf1fae0'));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=state.player.life,v$3===c$0.r || (c$0.r_ = t$3.insert$(c$0.r=v$3,0,c$0.r_)));
		t$2 = (b$2=d$2=1,c$0.s) || (b$2=d$2=0,c$0.s=t$2=imba.createElement('div',2560,t$1,'hud slots',null,'i1cf1fae0'));
		(v$2=(this.selected_gun||undefined),v$2===c$0.u||(d$2|=2,c$0.u=v$2));
		(d$2&2 && t$2.flag$('hud slots'+' '+(c$0.u ? `select-slot` : '')));
		t$3 = c$0.v || (c$0.v = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let len = state.player.slots, i = 0, rd = len - i; (rd > 0) ? (i < len) : (i > len); (rd > 0) ? (i++) : (i--)) {
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createElement('div',4608,t$3,null,null,'i1cf1fae0'));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$w || (t$4.$w={});
			(v$4=(state.player.gun == state.player.holsters[i]||undefined),v$4===c$4.y||(d$4|=2,c$4.y=v$4));
			(d$4&2 && t$4.flag$((c$4.y ? `onHand` : '')));
			(v$4=("" + (i + 1) + ". " + ((state.player.holsters[i] || {}).name || '')),v$4===c$4.z || (c$4.z_ = t$4.insert$(c$4.z=v$4,0,c$4.z_)));
			k$3++;
		}t$3.end$(k$3);
		t$2 = c$0.aa || (c$0.aa = t$2=imba.createElement('div',0,t$1,'hud ammo',null,'i1cf1fae0'));
		t$3 = (b$3=d$3=1,c$0.ab) || (b$3=d$3=0,c$0.ab=t$3=imba.createElement('b',4096,t$2,null,null,'i1cf1fae0'));
		b$3 || (t$3.css$('font-size',"50px"));
		(v$3=("" + (state.player.gun.ammo) + "/" + (state.player.gun.cap)),v$3===c$0.ac || (c$0.ac_ = t$3.insert$(c$0.ac=v$3,0,c$0.ac_)));
		(v$2=" Ammo",v$2===c$0.ad || (c$0.ad_ = t$2.insert$(c$0.ad=v$2,0,c$0.ad_)));
		if (state.player.dead) {
			ae$$1 = (b$2=d$2=1,c$0.ae) || (b$2=d$2=0,c$0.ae=ae$$1=imba.createElement('div',0,null,'you-died fadeIn',"you died",'i1cf1fae0'));
			b$2||(ae$$1.up$=t$0);
		}
		(c$0.ae$$1_ = t$0.insert$(ae$$1,1024,c$0.ae$$1_));		t$0.close$(d$0);
		return t$0;
	}
} imba.tags.define('player-hud',PlayerHudComponent,{});

/* css scoped
    .you-died {
        left: 33%
        top: 20%
        font-size: 15vw;
        color: #900;
        position: fixed;
        z-index: 1;
        font-family: MenofNihilist;
    }

    .hud {
        position: fixed;
        z-index: 1;
        font-family: Typewriter;
        color: white;
    }
    .stamina {
        bottom: 10%;
        right: 2%;
        font-size: 15px;
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

imba.inlineStyles(".hud[data-i73d2b83f]{position:fixed;z-index:1;font-family:Typewriter;color:white;background-color:rgba(0,0,0,0.55);border-color:white;border:1px;cursor:pointer;top:2%;left:50%;-webkit-transform:translate(-50%,0);-ms-transform:translate(-50%,0);transform:translate(-50%,0);}.row[data-i73d2b83f],.buy-row[data-i73d2b83f]{display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;}.item[data-i73d2b83f],.next-day[data-i73d2b83f]{width:300px;}.prices[data-i73d2b83f],.close[data-i73d2b83f]{text-align:right;-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1;}.action[data-i73d2b83f]{text-align:right;width:6vw;}.buy-row[data-i73d2b83f]:hover{color:#5F5;text-shadow:2px 2px #A00;}.buy-row:hover .prices[data-i73d2b83f]{-webkit-transform:translate(-1vw,0) scale(1.3,1.3);-ms-transform:translate(-1vw,0) scale(1.3,1.3);transform:translate(-1vw,0) scale(1.3,1.3);}.action[data-i73d2b83f]:hover{text-shadow:2px 2px #A00;color:#5F5;-webkit-transform:scale(1.3,1.3);-ms-transform:scale(1.3,1.3);transform:scale(1.3,1.3);}.next-day[data-i73d2b83f]:hover{text-shadow:2px 2px #A00;color:#5F5;-webkit-transform:scale(1.3,1.3) translate(1vw,0);-ms-transform:scale(1.3,1.3) translate(1vw,0);transform:scale(1.3,1.3) translate(1vw,0);}.close[data-i73d2b83f]:hover{text-shadow:2px 2px #A00;color:#5F5;-webkit-transform:scale(1.3,1.3) translate(-1vw,0);-ms-transform:scale(1.3,1.3) translate(-1vw,0);transform:scale(1.3,1.3) translate(-1vw,0);}.back[data-i73d2b83f]:hover{text-shadow:2px 2px #A00;color:#5F5;-webkit-transform:scale(1.3,1.3);-ms-transform:scale(1.3,1.3);transform:scale(1.3,1.3);}.store[data-i73d2b83f]{font-size:calc(10px + .6vw);}.open-store[data-i73d2b83f]{cursor:none;font-size:calc(15px + .8vw);}.open-store[data-i73d2b83f]{text-align:center;}\n");
function iter$$8(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }
class PlayerStoreComponent extends imba.tags.get('component','ImbaElement') {
	
	init$(){
		super.init$();return this.setAttribute('data-i73d2b83f','');
	}
	buyGun(gun){
		var player_;
		if (gun.price <= state.player.score) {
			(player_ = state.player).score = player_.score - gun.price;
			var index = state.store.indexOf(gun);
			if ((index != -1)) { state.store.splice(index,1); }			return state.player.inventory.push(gun);
		}	}
	
	upgradeGun(gun){
		return state.shop.upgradeGun = gun;
	}
	
	equipGun(gun){
		return state.player.equip(gun);
	}
	
	toggleShop(){
		if (state.player.inSafeZone()) {
			return state.shop.open = !state.shop.open;
		}	}
	
	nextDay(){
		var zombies_, $1;
		state.day++;
		for (let o = state.zombies, sector, i = 0, keys = Object.keys(o), l = keys.length, key; i < l; i++){
			key = keys[i];sector = o[key];sector.clear();
		}		
		for (let len = (5000 + 1000 * (state.day ** 1.4)), i = 0, rd = len - i; (rd > 0) ? (i <= len) : (i >= len); (rd > 0) ? (i++) : (i--)) {
			let zombie = new Zombie(state.player,state.day);
			(zombies_ = state.zombies)[$1 = zombie.currentSector()] || (zombies_[$1] = new Set());
			state.zombies[zombie.currentSector()].add(zombie);
		}		
		return state.shop.open = false;
	}
	
	
	healPlayer(){
		var player_;
		(player_ = state.player).score = player_.score - state.day * 40;
		return state.player.life = state.player.maxLife;
	}
	
	buyAmmo(){
		var player_;
		(player_ = state.player).score = player_.score - state.day * 200;
		return state.player.life = state.player.maxLife;
	}
	
	upgradeHealth(){
		var player_, $1, shop_;
		(player_ = state.player).score = player_.score - state.shop.health;
		($1 = state.player).maxLife = $1.maxLife + 10;
		return (shop_ = state.shop).health = shop_.health * 2;
	}
	
	upgradeSpeed(){
		var player_, $1, shop_;
		(player_ = state.player).score = player_.score - state.shop.speed;
		($1 = state.player).maxSpeed = $1.maxSpeed + 0.05;
		return (shop_ = state.shop).speed = shop_.speed * 2;
	}
	
	upgradeStamina(){
		var player_, $1, shop_;
		(player_ = state.player).score = player_.score - state.shop.stamina;
		($1 = state.player).maxStamina = $1.maxStamina + 300;
		return (shop_ = state.shop).maxStamina = shop_.maxStamina * 10;
	}
	
	upgradeHolster(){
		var player_, $1, shop_;
		(player_ = state.player).score = player_.score - state.shop.slots;
		($1 = state.player).slots = $1.slots + 1;
		return (shop_ = state.shop).slots = shop_.slots * 2;
	}
	
	back(){
		return state.shop.upgradeGun = null;
	}
	
	buyUpgrade(stat){
		var player_;
		if (state.player.score < state.shop.upgradeGun.upgrades[stat]) { return }		(player_ = state.player).score = player_.score - state.shop.upgradeGun.upgrades[stat];
		state.shop.upgradeGun.upgrades[stat] *= 2;
		let upgrade = {
			cap: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).cap = upgradeGun_.cap + ~~(1 + state.shop.upgradeGun.cap * 0.1); },
			rate: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).rate = upgradeGun_.rate + ~~(state.shop.upgradeGun.rate * 0.1); },
			spread: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).spread = upgradeGun_.spread - ~~(state.shop.upgradeGun.spread * 0.1); },
			damage: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).damage = upgradeGun_.damage + ~~(state.shop.upgradeGun.damage * 0.1); },
			power: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).power = upgradeGun_.power + ~~(state.shop.upgradeGun.power * 0.1); },
			reload_time: function() { var upgradeGun_;
			return (upgradeGun_ = state.shop.upgradeGun).reload_time = upgradeGun_.reload_time - ~~(state.shop.upgradeGun.reload_time * 0.1); }
		};
		return upgrade[stat]();
	}
	
	render(){
		var t$0, c$0, b$0, d$0, v$0, t$1, b$1, d$1, e$$1, b$2, d$2, v$2, t$3, t$4, h$$1, v$3, v$4, w$$1, aj$$3, b$4, d$4, t$5, v$5, k$3, c$3, c$4, b$5, d$5;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		(v$0=state.player.inSafeZone() ? "fadeIn" : "fadeOut",v$0===c$0.c||(d$0|=2,c$0.c=v$0));
		((!b$0||d$0&2) && t$0.flagSelf$('hud'+' '+(c$0.c||'')));
		t$1 = (b$1=d$1=1,c$0.d) || (b$1=d$1=0,c$0.d=t$1=imba.createComponent('upgrade-gun',0,t$0,null,null,'i73d2b83f'));
		b$1 || !t$1.setup || t$1.setup(d$1);
		t$1.end$(d$1);
		b$1 || t$1.insertInto$(t$0);
		if (!state.shop.open) {
			e$$1 = (b$2=d$2=1,c$0.e) || (b$2=d$2=0,c$0.e=e$$1=imba.createElement('div',512,null,'open-store',null,'i73d2b83f'));
			b$2||(e$$1.up$=t$0);
			(v$2=(state.player.dead||undefined),v$2===c$0.g||(d$2|=2,c$0.g=v$2));
			(d$2&2 && e$$1.flag$('open-store'+' '+(c$0.g ? `fadeOut` : '')));
			b$2 || (t$3=imba.createElement('div',0,e$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{toggleShop: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Open shop",'i73d2b83f'));
		}
		(c$0.e$$1_ = t$0.insert$(e$$1,1024,c$0.e$$1_));		if (state.shop.open && state.shop.upgradeGun) {
			h$$1 = (b$2=d$2=1,c$0.h) || (b$2=d$2=0,c$0.h=h$$1=imba.createElement('div',0,null,'store',null,'i73d2b83f'));
			b$2||(h$$1.up$=t$0);
			b$2 || (t$3=imba.createElement('h1',0,h$$1,null,"UPGRADES",'i73d2b83f'));
			t$3 = c$0.i || (c$0.i = t$3=imba.createElement('h3',4096,h$$1,null,null,'i73d2b83f'));
			(v$3=state.shop.upgradeGun.name,v$3===c$0.j || (c$0.j_ = t$3.insert$(c$0.j=v$3,0,c$0.j_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['cap']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Capacity",'i73d2b83f'));
			t$4 = c$0.k || (c$0.k = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.cap,v$4===c$0.l || (c$0.l_ = t$4.insert$(c$0.l=v$4,0,c$0.l_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['rate']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Rate of fire",'i73d2b83f'));
			t$4 = c$0.m || (c$0.m = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.rate,v$4===c$0.n || (c$0.n_ = t$4.insert$(c$0.n=v$4,0,c$0.n_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['spread']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Accuracy",'i73d2b83f'));
			t$4 = c$0.o || (c$0.o = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.spread,v$4===c$0.p || (c$0.p_ = t$4.insert$(c$0.p=v$4,0,c$0.p_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['damage']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Damage",'i73d2b83f'));
			t$4 = c$0.q || (c$0.q = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.damage,v$4===c$0.r || (c$0.r_ = t$4.insert$(c$0.r=v$4,0,c$0.r_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['power']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Power",'i73d2b83f'));
			t$4 = c$0.s || (c$0.s = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.power,v$4===c$0.t || (c$0.t_ = t$4.insert$(c$0.t=v$4,0,c$0.t_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyUpgrade: ['reload_time']},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Reload Speed",'i73d2b83f'));
			t$4 = c$0.u || (c$0.u = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.upgradeGun.upgrades.reload_time,v$4===c$0.v || (c$0.v_ = t$4.insert$(c$0.v=v$4,0,c$0.v_)));
			b$2 || (t$3=imba.createElement('div',0,h$$1,'row',null,'i73d2b83f'));
			b$2 || (t$4=imba.createElement('div',0,t$3,'next-day',"",'i73d2b83f'));
			b$2 || (t$4=imba.createElement('div',0,t$3,'back',"Back",'i73d2b83f'));
			b$2 || (t$4.on$(`click`,{back: true},this));
		}
		(c$0.h$$1_ = t$0.insert$(h$$1,1024,c$0.h$$1_));		if (state.shop.open && !state.shop.upgradeGun) {
			w$$1 = (b$2=d$2=1,c$0.w) || (b$2=d$2=0,c$0.w=w$$1=imba.createElement('div',3584,null,'store',null,'i73d2b83f'));
			b$2||(w$$1.up$=t$0);
			(v$2=(state.player.dead||undefined),v$2===c$0.y||(d$2|=2,c$0.y=v$2));
			(d$2&2 && w$$1.flag$('store'+' '+(c$0.y ? `fadeOut` : '')));
			b$2 || (t$3=imba.createElement('h1',0,w$$1,null,"SHOP",'i73d2b83f'));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Item",'i73d2b83f'));
			b$2 || (t$4=imba.createElement('div',0,t$3,'prices',"price",'i73d2b83f'));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$3.css$('margin-top',"5%"));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{healPlayer: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Heal",'i73d2b83f'));
			t$4 = c$0.z || (c$0.z = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.day * 40,v$4===c$0.aa || (c$0.aa_ = t$4.insert$(c$0.aa=v$4,0,c$0.aa_)));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{buyAmmo: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Buy Ammo",'i73d2b83f'));
			t$4 = c$0.ab || (c$0.ab = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.day * 200,v$4===c$0.ac || (c$0.ac_ = t$4.insert$(c$0.ac=v$4,0,c$0.ac_)));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$3.css$('margin-top',"5%"));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{upgradeHealth: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Upgrade health",'i73d2b83f'));
			t$4 = c$0.ad || (c$0.ad = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.health,v$4===c$0.ae || (c$0.ae_ = t$4.insert$(c$0.ae=v$4,0,c$0.ae_)));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{upgradeSpeed: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Upgrade speed",'i73d2b83f'));
			t$4 = c$0.af || (c$0.af = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.speed,v$4===c$0.ag || (c$0.ag_ = t$4.insert$(c$0.ag=v$4,0,c$0.ag_)));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'buy-row',null,'i73d2b83f'));
			b$2 || (t$3.on$(`click`,{upgradeStamina: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'item',"Upgrade stamina",'i73d2b83f'));
			t$4 = c$0.ah || (c$0.ah = t$4=imba.createElement('div',4096,t$3,'prices',null,'i73d2b83f'));
			(v$4=state.shop.stamina,v$4===c$0.ai || (c$0.ai_ = t$4.insert$(c$0.ai=v$4,0,c$0.ai_)));
			if (state.player.slots < 6) {
				aj$$3 = (b$4=d$4=1,c$0.aj) || (b$4=d$4=0,c$0.aj=aj$$3=imba.createElement('div',0,null,'buy-row',null,'i73d2b83f'));
				b$4||(aj$$3.up$=w$$1);
				b$4 || (aj$$3.on$(`click`,{upgradeHolster: true},this));
				b$4 || (t$5=imba.createElement('div',0,aj$$3,'item',"Upgrade holster",'i73d2b83f'));
				t$5 = c$0.ak || (c$0.ak = t$5=imba.createElement('div',4096,aj$$3,'prices',null,'i73d2b83f'));
				(v$5=("" + (state.shop.slots)),v$5===c$0.al || (c$0.al_ = t$5.insert$(c$0.al=v$5,0,c$0.al_)));
			}
			(c$0.aj$$3_ = w$$1.insert$(aj$$3,1024,c$0.aj$$3_));			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$3.css$('margin-top',"5%"));
			t$3 = c$0.am || (c$0.am = t$3 = imba.createIndexedFragment(0,w$$1));
			k$3 = 0;
			c$3=t$3.$;
			for (let i = 0, items = iter$$8(state.store), len = items.length, gun; i < len; i++) {
				gun = items[i];
				t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createElement('div',0,t$3,'buy-row',null,'i73d2b83f'));
				b$4||(t$4.up$=t$3);
				c$4=t$4.$an || (t$4.$an={});
				v$4 = c$4.ao || (c$4.ao={buyGun: [null]});
				v$4.buyGun[0]=gun;
				b$4 || t$4.on$(`click`,v$4,this);
				t$5 = c$4.ap || (c$4.ap = t$5=imba.createElement('div',4096,t$4,'item',null,'i73d2b83f'));
				(v$5=("buy " + (gun.name)),v$5===c$4.aq || (c$4.aq_ = t$5.insert$(c$4.aq=v$5,0,c$4.aq_)));
				t$5 = c$4.ar || (c$4.ar = t$5=imba.createElement('div',4096,t$4,'prices',null,'i73d2b83f'));
				(v$5=gun.price,v$5===c$4.as || (c$4.as_ = t$5.insert$(c$4.as=v$5,0,c$4.as_)));
				k$3++;
			}t$3.end$(k$3);
			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$3.css$('margin-top',"5%"));
			b$2 || (t$3=imba.createElement('h1',0,w$$1,null,"INVERTORY",'i73d2b83f'));
			t$3 = c$0.at || (c$0.at = t$3 = imba.createIndexedFragment(0,w$$1));
			k$3 = 0;
			c$3=t$3.$;
			for (let i = 0, items = iter$$8(state.player.inventory), len = items.length, gun; i < len; i++) {
				gun = items[i];
				t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createElement('div',0,t$3,'row',null,'i73d2b83f'));
				b$4||(t$4.up$=t$3);
				c$4=t$4.$au || (t$4.$au={});
				t$5 = c$4.av || (c$4.av = t$5=imba.createElement('div',4096,t$4,'item',null,'i73d2b83f'));
				(v$5=gun.name,v$5===c$4.aw || (c$4.aw_ = t$5.insert$(c$4.aw=v$5,0,c$4.aw_)));
				t$5 = (b$5=d$5=1,c$4.ax) || (b$5=d$5=0,c$4.ax=t$5=imba.createElement('div',0,t$4,'action',"Equip",'i73d2b83f'));
				v$5 = c$4.ay || (c$4.ay={equipGun: [null]});
				v$5.equipGun[0]=gun;
				b$5 || t$5.on$(`click`,v$5,this);
				t$5 = (b$5=d$5=1,c$4.az) || (b$5=d$5=0,c$4.az=t$5=imba.createElement('div',0,t$4,'action',"Upgrade",'i73d2b83f'));
				v$5 = c$4.ba || (c$4.ba={upgradeGun: [null]});
				v$5.upgradeGun[0]=gun;
				b$5 || t$5.on$(`click`,v$5,this);
				k$3++;
			}t$3.end$(k$3);
			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$3.css$('margin-top',"5%"));
			b$2 || (t$3=imba.createElement('div',0,w$$1,'row',null,'i73d2b83f'));
			b$2 || (t$4=imba.createElement('div',0,t$3,'next-day',"Go to next day",'i73d2b83f'));
			b$2 || (t$4.on$(`click`,{nextDay: true},this));
			b$2 || (t$4=imba.createElement('div',0,t$3,'close',"Close",'i73d2b83f'));
			b$2 || (t$4.on$(`click`,{toggleShop: true},this));
		}
		(c$0.w$$1_ = t$0.insert$(w$$1,1024,c$0.w$$1_));		t$0.close$(d$0);
		return t$0;
	}
} imba.tags.define('player-store',PlayerStoreComponent,{});
/* css scoped
    .hud {
        position: fixed;
        z-index: 1;
        font-family: Typewriter;
        color: white;
        background-color: rgba(0,0,0,0.55);
        border-color: white;
        border: 1px;
        cursor: pointer;
        top: 2%;
        left: 50%;
        transform: translate(-50%,0);
    }

    .row, .buy-row {
        display: flex;
    }

    .item, .next-day{
        width: 300px;
    }

    .prices, .close {
        text-align: right;
        flex-grow: 1;
    }

    .action{
        text-align: right;
        width: 6vw
    }

    .buy-row:hover{
        color: #5F5;
        text-shadow: 2px 2px #A00;
        .prices {
            transform: translate(-1vw,0) scale(1.3,1.3);
        }
    }
    .action:hover{
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3);
    }
    .next-day:hover {
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3) translate(1vw,0)
    }
    .close:hover {
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3) translate(-1vw,0)
    }

    .back:hover {
        text-shadow: 2px 2px #A00;
        color: #5F5;
        transform: scale(1.3,1.3)
    }

    .store {
        font-size: calc(10px + .6vw);
    }
    .open-store {
        cursor: none;
        font-size: calc(15px + .8vw);
    }

    .open-store {
        text-align: center
    }

*/

imba.inlineStyles("body{margin:0px;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:none;}app-root{display:block;position:relative;background-color:black;}@font-face{font-family:MenofNihilist;src:url(fonts/MenofNihilist.otf) format(\"opentype\");}@font-face{font-family:Typewriter;src:url(\"fonts/JMH Typewriter-Black.otf\") format(\"opentype\");}@-webkit-keyframes fadeOut{0%{opacity:1;}to{opacity:0;}}@keyframes fadeOut{0%{opacity:1;}to{opacity:0;}}@-webkit-keyframes fadeIn{0%{opacity:0;}to{opacity:1;}}@keyframes fadeIn{0%{opacity:0;}to{opacity:1;}}.fadeOut{-webkit-animation-duration:1.5s;-webkit-animation-duration:1.5s;animation-duration:1.5s;-webkit-animation-fill-mode:both;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-name:fadeOut;-webkit-animation-name:fadeOut;animation-name:fadeOut;}.fadeIn{-webkit-animation-duration:1.5s;-webkit-animation-duration:1.5s;animation-duration:1.5s;-webkit-animation-fill-mode:both;-webkit-animation-fill-mode:both;animation-fill-mode:both;-webkit-animation-name:fadeIn;-webkit-animation-name:fadeIn;animation-name:fadeIn;}.ui{position:fixed;z-index:10;}\n");
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
	
	transformObstacle(obs){
		return ("translate(" + (obs.position.x) + ", " + (obs.position.y) + ") rotate(" + (obs.rotation) + ")");
	}
	
	render(){
		var t$0, c$0, b$0, d$0, t$1, t$2, b$2, d$2, v$2, t$3, k$3, c$3, t$4, b$4, d$4, c$4, v$4, t$5, b$5, d$5, v$5, b$3, d$3, v$3;
		t$0=this;
		t$0.open$();
		c$0 = (b$0=d$0=1,t$0.$) || (b$0=d$0=0,t$0.$={});
		b$0 || (t$1=imba.createElement('div',0,t$0,'ui',null,null));
		t$2 = (b$2=d$2=1,c$0.b) || (b$2=d$2=0,c$0.b=t$2=imba.createComponent('player-hud',0,t$1,null,null,null));
		b$2 || !t$2.setup || t$2.setup(d$2);
		t$2.end$(d$2);
		b$2 || t$2.insertInto$(t$1);
		t$2 = (b$2=d$2=1,c$0.c) || (b$2=d$2=0,c$0.c=t$2=imba.createComponent('player-store',0,t$1,null,null,null));
		b$2 || !t$2.setup || t$2.setup(d$2);
		t$2.end$(d$2);
		b$2 || t$2.insertInto$(t$1);
		b$0 || (t$1=imba.createSVGElement('svg',0,t$0,null,null,null));
		b$0 || (t$1.set$('transform',"scale(1,-1)"));
		b$0 || (t$1.set$('height',"100%"));
		b$0 || (t$1.set$('width',"100%"));
		t$2 = (b$2=d$2=1,c$0.d) || (b$2=d$2=0,c$0.d=t$2=imba.createSVGElement('g',0,t$1,null,null,null));
		(v$2=("translate(" + (state.mouse.x) + ", " + (state.mouse.y) + ")"),v$2===c$0.e || (t$2.set$('transform',c$0.e=v$2)));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('y1',4));
		b$2 || (t$3.set$('y2',10));
		b$2 || (t$3.set$('stroke','#5F5'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('y1',-4));
		b$2 || (t$3.set$('y2',-10));
		b$2 || (t$3.set$('stroke','#5F5'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('x1',4));
		b$2 || (t$3.set$('x2',10));
		b$2 || (t$3.set$('stroke','#5F5'));
		b$2 || (t$3=imba.createSVGElement('line',0,t$2,null,null,null));
		b$2 || (t$3.set$('x1',-4));
		b$2 || (t$3.set$('x2',-10));
		b$2 || (t$3.set$('stroke','#5F5'));
		t$2 = (b$2=d$2=1,c$0.f) || (b$2=d$2=0,c$0.f=t$2=imba.createSVGElement('g',2560,t$1,null,null,null));
		(v$2=this.transformCamera(),v$2===c$0.g || (t$2.set$('transform',c$0.g=v$2)));
		(v$2=(state.player.dead||undefined),v$2===c$0.i||(d$2|=2,c$0.i=v$2));
		(d$2&2 && t$2.flag$((c$0.i ? `fadeOut` : '')));
		t$3 = c$0.j || (c$0.j = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let obs of iter$$9(state.player.nearObstacles)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$k || (t$4.$k={});
			(v$4=this.transformObstacle(obs),v$4===c$4.l || (t$4.set$('transform',c$4.l=v$4)));
			t$5 = (b$5=d$5=1,c$4.m) || (b$5=d$5=0,c$4.m=t$5=imba.createSVGElement('circle',0,t$4,null,null,null));
			(v$5=obs.size,v$5===c$4.n || (t$5.set$('r',c$4.n=v$5)));
			b$5 || (t$5.set$('fill',"grey"));
			k$3++;
		}t$3.end$(k$3);
		t$3 = (b$3=d$3=1,c$0.o) || (b$3=d$3=0,c$0.o=t$3=imba.createSVGElement('g',0,t$2,null,null,null));
		(v$3=this.transformPlayer(),v$3===c$0.p || (t$3.set$('transform',c$0.p=v$3)));
		b$3 || (t$4=imba.createSVGElement('circle',0,t$3,null,null,null));
		b$3 || (t$4.set$('r',"10"));
		b$3 || (t$4.set$('fill',"white"));
		b$3 || (t$4=imba.createSVGElement('g',0,t$3,null,null,null));
		b$3 || (t$4.set$('transform','translate(5, 5)'));
		b$3 || (t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
		b$3 || (t$5.set$('height',"13"));
		b$3 || (t$5.set$('width',"2"));
		b$3 || (t$5.set$('fill',"white"));
		t$3 = c$0.q || (c$0.q = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let bullet of iter$$9(state.bullets)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$r || (t$4.$r={});
			(v$4=this.transformBullet(bullet),v$4===c$4.s || (t$4.set$('transform',c$4.s=v$4)));
			b$4 || (t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			b$4 || (t$5.set$('width',"50"));
			b$4 || (t$5.set$('height',"1"));
			b$4 || (t$5.set$('fill',"yellow"));
			k$3++;
		}t$3.end$(k$3);
		t$3 = c$0.t || (c$0.t = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let zombie of iter$$9(state.player.nearZombies)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,null,null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$u || (t$4.$u={});
			(v$4=this.transformZombie(zombie),v$4===c$4.v || (t$4.set$('transform',c$4.v=v$4)));
			t$5 = (b$5=d$5=1,c$4.w) || (b$5=d$5=0,c$4.w=t$5=imba.createSVGElement('circle',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.x || (t$5.set$('r',c$4.x=v$5)));
			b$5 || (t$5.set$('fill',"red"));
			b$5 || (t$5.set$('stroke','black'));
			t$5 = (b$5=d$5=1,c$4.y) || (b$5=d$5=0,c$4.y=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size * 2,v$5===c$4.z || (t$5.set$('width',c$4.z=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"6"));
			b$5 || (t$5.set$('fill',"red"));
			t$5 = (b$5=d$5=1,c$4.aa) || (b$5=d$5=0,c$4.aa=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size * 2,v$5===c$4.ab || (t$5.set$('width',c$4.ab=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"-10"));
			b$5 || (t$5.set$('fill',"red"));
			k$3++;
		}t$3.end$(k$3);
		t$3 = c$0.ac || (c$0.ac = t$3 = imba.createIndexedFragment(0,t$2));
		k$3 = 0;
		c$3=t$3.$;
		for (let zombie of iter$$9(state.killed)){
			t$4 = (b$4=d$4=1,c$3[k$3]) || (b$4=d$4=0,c$3[k$3] = t$4=imba.createSVGElement('g',0,t$3,'fadeOut',null,null));
			b$4||(t$4.up$=t$3);
			c$4=t$4.$ad || (t$4.$ad={});
			(v$4=this.transformZombie(zombie),v$4===c$4.ae || (t$4.set$('transform',c$4.ae=v$4)));
			t$5 = (b$5=d$5=1,c$4.af) || (b$5=d$5=0,c$4.af=t$5=imba.createSVGElement('circle',0,t$4,null,null,null));
			(v$5=zombie.size,v$5===c$4.ag || (t$5.set$('r',c$4.ag=v$5)));
			b$5 || (t$5.set$('fill',"grey"));
			b$5 || (t$5.set$('stroke','black'));
			t$5 = (b$5=d$5=1,c$4.ah) || (b$5=d$5=0,c$4.ah=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size * 2,v$5===c$4.ai || (t$5.set$('width',c$4.ai=v$5)));
			b$5 || (t$5.set$('height',"4"));
			b$5 || (t$5.set$('y',"6"));
			b$5 || (t$5.set$('fill',"grey"));
			t$5 = (b$5=d$5=1,c$4.aj) || (b$5=d$5=0,c$4.aj=t$5=imba.createSVGElement('rect',0,t$4,null,null,null));
			(v$5=zombie.size * 2,v$5===c$4.ak || (t$5.set$('width',c$4.ak=v$5)));
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
        cursor: none;
    }

    app-root {
        display: block; 
        position: relative;
        background-color: black
    }

    @font-face {
        font-family: MenofNihilist;
        src: url(fonts/MenofNihilist.otf) format("opentype");
    }
    @font-face {
        font-family: Typewriter;
        src: url("fonts/JMH Typewriter-Black.otf") format("opentype");
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
        -webkit-animation-duration: 1.5s;
        animation-duration: 1.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeOut;
        animation-name: fadeOut
    }

    .fadeIn {
        -webkit-animation-duration: 1.5s;
        animation-duration: 1.5s;
        -webkit-animation-fill-mode: both;
        animation-fill-mode: both
        -webkit-animation-name: fadeIn;
        animation-name: fadeIn
    }

    .ui {
        position: fixed;
        z-index: 10;
    }
*/
//# sourceMappingURL=app.imba.js.map
