{
    /**
     * Will append every property of every sources if property don't exist in target
     * Ideal for extend prototype, without risk of erase sensible property
     * 
     * @param {any} target
     * @param {any} sources
     * @return {any} target
     */
    Object.safeAssign = function Object_safeAssign(target, ...sources) {
        sources.forEach(
            source => Object.getOwnPropertyNames(source)
                .filter(propName => !target.hasOwnProperty(propName))
                .forEach(propName => target[propName] = source[propName])
        )

        return target
    }

    /**
     * Get value of an object with possibility of get an default value
     * 
     * @param {any} object (without . in nested key names)
     * @param {string} path path value you want get
     * @param {any} onFailValue default value you want get if cannot acces value with path, null by default
     * 
     * @return {any} The value you wanted get or onFailValue
     * 
     * @example
     *  let myObject = {
     *      foo: {
     *          bar: 'baz'
     *      },
     *      bar: [
     *          {name: 'value'}
     *      ]
     *  }
     * 
     *  Object.get(myObject, 'foo.bar') // -> 'baz'
     *  Object.get(myObject, 'foo.baz', 'default') // -> 'default'
     *  Object.get(myObject, 'bar.0.name', 'default') // -> 'value'
     */
    Object.get = function Object_get(object, path, onFailValue = null) {
        try {
            const keys = path.split('.')

            keys.forEach(key => {
                if (Object.getOwnPropertyNames(object).include(key)) {
                    object = object[key]
                } else {
                    throw new TypeError(`Object ${Object} have not key ${key} property`)
                }
            });

            return object
        } catch (e) {
            return onFailValue
        }
    }

    /**
     * Set the value on path object, with tree creation if needed (not crash)
     * 
     * @param {any} object (without . in nested key names)
     * @param {string} path path value you want set
     * @param {any} value the value you want set
     * 
     * @return {any} the value you have set (why not)
     * 
     * @example
     *  let myObject = {
     *      foo: {
     *          bar: 'baz'
     *      },
     *      bar: [
     *          {name: 'value'}
     *      ]
     *  }
     *  Object.set(myObject, 'foo.bar', 'notbaz') // myObject.foo.bar == 'notbaz'
     *  Object.set(myObject, 'bar.0.bar', 'name') // myObject.bar[0].bar == 'name'
     *  Object.set(myObject, 'foo.foo.foo.bar', 'baz') // myObject.foo.foo.foo.bar == 'baz'
     * 
     *  >> myObject
     *  {
     *      foo: {
     *          bar: 'notbaz',
     *          foo: {
     *              foo: {
     *                  bar: 'baz'
     *              }
     *          }
     *      },
     *      bar: [
     *          {
     *              name: 'value',
     *              bar: 'name'
     *          }
     *      ]
     *  }
     */
    Object.set = function Object_set(object, path, value) {
        const keys = path.split('.')

        keys.forEach(key => {
            if (!Object.getOwnPropertyNames(object).include(key)) {
                object[key] = {}
            }
            object = object[key]
        });

        return object[keys.pop()] = value
    }

    /**
     * While your handler reject, retry.
     * with .then you get your result when resolve
     * 
     * Good for spam an API with request limit (with timeout)
     * 
     * @param {any} options
     * @param {Function} options.handlerPromise function for Promise constructor
     * @param {number} options.timeout (optional) time to wait before retry process
     * @param {number} options.retry (optional) number of retry. if not set, infinite retry
     * 
     * @param {Promise}
     * 
     * @example
     * retryPromise({
            handlerPromise: (resolve, reject) => {
                const rand = Math.random()
                if (rand > 0.75) {
                    resolve(rand)
                } else {
                    reject(rand)
                }
            },
            retry: 5
        }).then(rand => console.log(rand))
        // yeah it's a bad example :p
     */
    Promise.retryPromise = function Promise_retryPromise(options = {}) {
        return new Promise((resolve, reject) => {
            options.handlerPromise = options.handlerPromise || (resolve => resolve())
            options.timeout = options.timeout || 1000
            // options.retry = options.retry || 5

            const success = result => resolve(result)
            let current = 0
            const errors = []
            
            function resolvePromise () {
                const fail = err => {
                    errors.push(err)
                    if (!options.retry || options.retry && current < options.retry) {
                        setTimeout(resolvePromise, options.timeout || 1000);
                    } else {
                        reject({
                            retry: new Error(`amount of retry passed (${options.retry})`),
                            errors: errors
                        })
                    }
                }

                const promise = new Promise(options.handlerPromise)

                promise.then(success)
                promise.catch(fail)
            }

            resolvePromise()
        })
    }

    window.parseHTML = function window_parserHTML(str) {
        const frag = document.createDocumentFragment()
        const tmp = frag.appendChild(document.createElement('div'))
        tmp.innerHTML = str

        return tmp.childNodes
    }

    window.pf = function window_pf(selector, all = true) {
        if (typeof selector == 'string') {
            // check if is html
            if (/<.+>/.test(selector)) {
                return parseHTML(selector);
            }

            return all ? document.querySelectorAll(selector) : document.querySelector(selector)
        }

        if (typeof selector == 'function') {
            if (document.readyState != 'loading') selector();
            else document.addEventListener('DOMContentLoaded', selector)
            return
        }

        return selector
    }

    /**
     * @param {object} settings
     * @param {string} settings.url
     * @param {string} settings.method
     * 
     * @returns {XMLHttpRequest}
     */
    function xhrFactory(settings) {
        settings = settings || {}
        settings.url = settings.url || ''
        settings.method = settings.method || 'get'

        const xhr = new XMLHttpRequest()
        xhr.open(settings.method, settings.url, true)

        return xhr
    }

    window.xhr = {
        /**
         * @param {object} settings
         * @param {string} settings.url
         * @param {string} settings.method
         * @param {any} settings.data
         * 
         * @param {function} settings.onComplete
         * 
         * @returns {Promise}
         * then() // onSuccess - parsed response, request
         * catch() // onFail - request
         */
        getJSON(settings = {}) {
            return new Promise((resolve, reject) => {
                const xhr = xhrFactory(settings)

                xhr.onreadystatechange = function (aEvt) {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(JSON.parse(xhr.responseText), xhr)
                        }
                        else {
                            reject(xhr)
                        }
                        settings.onComplete.call(xhr);
                    }
                }

                xhr.send(settings.data);
            })
        },
        /**
         * @param {object} settings
         * @param {string} settings.url
         * @param {string} settings.method
         * @param {any} settings.data
         * 
         * @param {function} settings.onComplete
         * 
         * @returns {Promise}
         * then() // onSuccess - parsed response, request
         * catch() // onFail - request
         */
        getXML(settings = {}) {
            return new Promise((resolve, reject) => {
                const xhr = xhrFactory(settings)
                xhr.overrideMimeType('text/xml')

                xhr.onreadystatechange = function (aEvt) {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseXML, xhr)
                        }
                        else {
                            reject(xhr)
                        }
                        settings.onComplete.call(xhr);
                    }
                }

                xhr.send(settings.data);
            })
        },
        /**
         * @param {object} settings
         * @param {string} settings.url
         * @param {string} settings.method
         * @param {any} settings.data
         * 
         * @param {function} settings.onComplete
         * 
         * @returns {Promise}
         * then() // onSuccess - parsed response, request
         * catch() // onFail - request
         */
        getRAW(settings = {}) {
            return new Promise((resolve, reject) => {
                const xhr = xhrFactory(settings)

                xhr.onreadystatechange = function (aEvt) {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resolve(xhr.responseText, xhr)
                        }
                        else {
                            reject(xhr)
                        }
                        settings.onComplete.call(xhr);
                    }
                }

                xhr.send(settings.data);
            })
        },
    }

    // --- Element --- //
    let newElementPrototypes = {
        // class
        addClass(...classes) {
            classes.forEach(classe => this.classList.add(classe))
        },
        hasClass(classe) {
            return this.classList.contains(classe)
        },
        hasSomeClass(...classes) {
            return classes.some(classe => this.classList.contains(classe))
        },
        hasEveryClass(...classes) {
            return classes.every(classe => this.classList.contains(classe))
        },
        removeClass(...classes) {
            classes.forEach(classe => this.classList.remove(classe))
        },
        toggleClass(...classes) {
            classes.forEach(classe => this.classList.toggle(classe))
        },

        // attr
        attr(attribute, value) {
            if (typeof attribute == 'string') {
                if (value) {
                    this.setAttribute(attribute, value)
                }
                return this.getAttribute(attribute)
            }

            let result = []
            for (let key in attribute) {
                if (attribute[key]) {
                    this.setAttribute(key, attribute[key])
                }
                result.push(this.getAttribute(key))
            }
            return result
        },
        removeAttr(...attributes) {
            attributes.forEach(attr => this.removeAttribute(attr))
        },
        hasAttr(attribute) {
            return this.hasAttribute(attribute)
        },
        hasSomeAttr(...attributes) {
            return attributes.some(attr => this.hasAttribute(attr))
        },
        hasEveryAttr(...attributes) {
            return attributes.every(attr => this.hasAttribute(attr))
        },

        // prop
        prop(propertie, value) {
            if (!Array.isArray(propertie)) {
                if (value) {
                    this[propertie] = value
                }
                return this[propertie]
            }

            let result = []
            for (let key in propertie) {
                if (propertie[key]) {
                    this[key] = propertie[key]
                }
                result.push(this[key])
            }
            return result
        },
        removeProp(...properties) {
            properties.forEach(prop => delete this[attr])
        },
        hasProp(propertie) {
            return this.hasOwnProperty(attr)
        },
        hasSomeProp(...properties) {
            return properties.some(prop => this.hasOwnProperty(attr))
        },
        hasEveryProp(...properties) {
            return properties.every(prop => this.hasOwnProperty(attr))
        },

        // CSS
        css(property, value) {
            if (!Array.isArray(property)) {
                if (value) {
                    this.style[property] = value
                }
                return this[propertie]
            }

            let result = []
            for (let key in propertie) {
                if (propertie[key]) {
                    this.style[key] = propertie[key]
                }
                result.push(this.style[key])
            }
            return result
        },

        // Dimensions
        height() {
            return this.clientHeight
        },
        width() {
            return this.clientWidth
        },
        fullHeight() {
            return this.scrollHeight
        },
        fullWidth() {
            return this.scrollWidth
        },

        // Events
        on(event, callback) {
            this.addEventListener(event, callback)
            return [this, callback]
        },
        off(event, callback) {
            this.removeEventListener(event, callback)
            return this
        },
        Click(callback) {
            if (callback) {
                return this.on('click', callback)
            }

            return this.click();
        },

        // Manipulation
        /**
         * insert after itself
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        after(...elements) {
            elements.map(element => pf(element))
                .forEach(element => {
                    try {
                        return element instanceof NodeList ?
                            element.forEach(element => this.insertAdjacentElement('afterend', element)) :
                            this.insertAdjacentElement('afterend', element)
                    } catch(e) {}
                })
            
            return this
        },

        /**
         * Append to itself
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        append(...elements) {
            elements.map(element => pf(element))
                .forEach(element => {
                    try {
                        return element instanceof NodeList ?
                            element.forEach(element => this.appendChild(element)) :
                            this.appendChild(element)
                    } catch(e) {}
                })
            
            return this
        }, 

        /**
         * Append to elements (clone if many)
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        appendTo(...elements) {
            elements = elements.map(element => pf(element))
            this.shouldClone = elements.length > 1

            elements.forEach(element => {
                try {
                    if (element instanceof NodeList) {
                        this.shouldClone = this.shouldClone || element.length > 1
                        return element.forEach(element => element.appendChild(this.shouldClone ? this.clone() : this))
                    }
                    return element.appendChild(this.shouldClone ? this.clone() : this)
                } catch(e) {}
            })

            return this
        },

        /**
         * insert before itself
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        before(...elements) {
            elements.map(element => pf(element))
                .forEach(element => {
                    try {
                        return element instanceof NodeList ?
                            element.forEach(element => this.insertAdjacentElement('beforebegin', element)) :
                            this.insertAdjacentElement('beforebegin', element)
                    } catch(e) {}
                })
            
            return this
        },

        clone() {
            return this.cloneNode()
        },

        empty() {
            while (this.hasChildNodes()) {
                this.removeChild(this.firstChild)
            }

            return this
        },

        html(value) {
            if (value || value == '') {
                this.innerHTML = value
            }

            return this.innerHTML
        },

        /**
         * insert this after elements self 
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        insertAfter(...elements) {
            elements = elements.map(element => pf(element))
            this.shouldClone = elements.length > 1

            elements.forEach(element => {
                try {
                    if (element instanceof NodeList) {
                        this.shouldClone = this.shouldClone || element.length > 1
                        return element.forEach(element => element.insertAdjacentElement('afterend', this.shouldClone ? this.clone() : this))
                    }
                    return element.insertAdjacentElement('afterend', this.shouldClone ? this.clone() : this)
                } catch(e) {}
            })

            return this
        },

        /**
         * insert this before elements self 
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        insertBefore(...elements) {
            elements = elements.map(element => pf(element))
            this.shouldClone = elements.length > 1

            elements.forEach(element => {
                try {
                    if (element instanceof NodeList) {
                        this.shouldClone = this.shouldClone || element.length > 1
                        return element.forEach(element => element.insertAdjacentElement('beforebegin', this.shouldClone ? this.clone() : this))
                    }
                    return element.insertAdjacentElement('beforebegin', this.shouldClone ? this.clone() : this)
                } catch(e) {}
            })

            return this
        },

        /**
         * Prepend to itself
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        prepend(...elements) {
            elements.map(element => pf(element))
                .forEach(element => {
                    try {
                        return element instanceof NodeList ?
                            element.forEach(element => this.insertAdjacentElement('afterbegin', element)) :
                            this.insertAdjacentElement('afterbegin', element)
                    } catch(e) {}
                })
            
            return this
        }, 

        /**
         * Prepend to elements (clone if many)
         * @param {Array<string | Element | NodeList>} elements
         * @returns {Element}
         */
        prependTo(...elements) {
            elements = elements.map(element => pf(element))
            this.shouldClone = elements.length > 1

            elements.forEach(element => {
                try {
                    if (element instanceof NodeList) {
                        this.shouldClone = this.shouldClone || element.length > 1
                        return element.forEach(element => element.insertAdjacentElement('afterbegin', this.shouldClone ? this.clone() : this))
                    }
                    return element.insertAdjacentElement('afterbegin', this.shouldClone ? this.clone() : this)
                } catch(e) {}
            })

            return this
        },

        remove() {
            return this.parentNode.removeChild(this)
        },

        text() {
            if (value || value == '') {
                this.textContent = value
            }

            return this.textContent
        }
    }
    newElementPrototypes.flush = newElementPrototypes.empty

    Object.safeAssign(Element.prototype, newElementPrototypes)
    Object.safeAssign(NodeList.prototype, Array.prototype)

    let newNodeListPrototypes = {
        // class
        addClass(...classes) {
            this.forEach(element => element.addClass(...classes))
        },
        hasClass(classe) {
            return this.every(element => element.hasClass(classe))
        },
        hasSomeClass(...classes) {
            return this.every(element => element.hasSomeClass(...classes))
        },
        hasEveryClass(...classes) {
            return this.every(element => element.hasEveryClass(...classes))
        },
        removeClass(...classes) {
            this.forEach(element => element.removeClass(...classes))
        },
        toggleClass(...classes) {
            this.forEach(element => element.toggleClass(...classes))
        },

        // attr
        attr(attribute, value) {
            return this.map(element => element.attr(attribute, value))
        },
        removeAttr(...attributes) {
            this.forEach(element => element.removeAttr(...attributes))
        },
        hasAttr(attribute) {
            return this.every(element => element.hasAttribute(attribute))
        },
        hasSomeAttr(...attributes) {
            return this.every(element => element.hasSomeAttr(...attributes))
        },
        hasEveryAttr(...attributes) {
            return this.every(element => element.hasEveryAttr(...attributes))
        },

        // prop
        prop(propertie, value) {
            return this.map(element => element.prop(propertie, value))
        },
        removeProp(...properties) {
            this.forEach(element => element.removeProp(...properties))
        },
        hasProp(propertie) {
            return this.every(element => element.hasProp(propertie))
        },
        hasSomeProp(...properties) {
            return this.every(element => element.hasSomeProp(...properties))
        },
        hasEveryProp(...properties) {
            return this.every(element => element.hasEveryProp(...properties))
        },

        // Collection
        add(...elements) {
            elements.forEach(element => this.push(element))
        },
        each: NodeList.prototype.forEach,
        eq(id = null) {
            return id ? this.item(id) : this.first()
        },
        first() {
            return this.item(0)
        },
        index: NodeList.prototype.indexOf,
        last() {
            return this.item(this.length - 1)
        },

        // CSS
        css(property, value) {
            return this.map(element => element.css(property, value))
        },

        // Dimensions
        height() {
            return this.map(element => element.height())
        },
        width() {
            return this.map(element => element.width())
        },
        fullHeight() {
            return this.map(element => element.fullHeight())
        },
        fullWidth() {
            return this.map(element => element.fullWidth())
        },

        // Events
        on(event, callback) {
            this.forEach(element, element.on(event, callback))
            return [this, callback]
        },
        off(event, callback) {
            this.forEach(element, element.off(event, callback))
            return this
        },
        Click(callback) {
            return this.map(element => element.Click(callback))
        }
    }
    newNodeListPrototypes.get = newNodeListPrototypes.eq

    Object.safeAssign(NodeList.prototype, newNodeListPrototypes)


    /* - Very tricky, but not the aimed target -
    NodeList.prototype.$ = new Proxy(newElementPrototypes, {
        get(obj, prop) {
            return function() {
                return obj.map(element => element[prop].call(element, ...arguments))
            }
        }
    })
    nodelist.$.addClass('class')
    // -> Array.prototype.map.call(nodelist, element => element['addClass'].call(element, 'class'))
    */
}