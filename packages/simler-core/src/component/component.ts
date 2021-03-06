import Logger from '../logger'
import * as Slot from '../slot/slot'

export type InstanceComponentConstructor = {
    new(prop?: any): Component
}

export function isComponentConstructor(v: Function): v is InstanceComponentConstructor {
    return v.prototype instanceof Component
}

export class Component {

    constructor() {
        Logger.debug('Component base constructor', this)
        let slot = Slot.create({
            component: this
        })
    }
    $render() {
        console.log('lg render')
        const slot = Slot.getNotNull(this)

        const vnode = slot.render()
        slot.vnode.updateVNodeElement(vnode)

    }
}

