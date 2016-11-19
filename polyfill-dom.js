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