{
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
            if (!Array.isArray(propertie)){
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
            if (!Array.isArray(property)){
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
        }
    }

    Object.assign(Element.prototype, newElementPrototypes)

    let backupNodeListProto = {}
    Object.getOwnPropertyNames(NodeList.prototype)
        .filter(p => p != 'length') // NodeList.prototype['length'] Raise an Error
        .forEach(propertyName => backupNodeListProto[propertyName] = NodeList.prototype[propertyName])

    let futurNodeListProto = {}
    Object.getOwnPropertyNames(Array.prototype)
        .filter(p => p != 'length') // Array.prototype['length'] Raise an Error
        .forEach(propertyName => futurNodeListProto[propertyName] = Array.prototype[propertyName])
    Object.assign(NodeList.prototype, Object.assign(futurNodeListProto, backupNodeListProto))

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
        }
    }
    newNodeListPrototypes.get = newNodeListPrototypes.eq

    Object.assign(NodeList.prototype, futurNodeListProto, newNodeListPrototypes, backupNodeListProto)


    /* - Very tricky, but not the aimed target -
    NodeList.prototype.$ = new Proxy(newElementPrototypes, {
        get(obj, prop) {
            return function() {
                return [...obj].map(element => element[prop].call(element, ...arguments))
            }
        }
    })
    */
}