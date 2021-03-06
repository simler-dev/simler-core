import { ObservableTypes, get as getSlot, Slot, isObservableType } from '../slot'
export function eachOf(obj: ObservableTypes, ite: (obj: any) => void) {
    Object.values(obj).forEach(v => ite(v))
}

export function scheduleObserved(obj: ObservableTypes) {
    let slot = getSlot(obj)
    if (!slot) {
        console.error(obj)
        throw 'Can not schedule unobserved object'
    }
    if(slot.bundleCalledSymbol && slot.bundleCalledSymbol===slot.currentCalledSymbol){
        return
    }
    const calledSymbol = slot.bundleCalledSymbol ?? Symbol('Simler/Observer.Called')

    function step(slot: Slot) {
        if(calledSymbol === slot.currentCalledSymbol){
            return
        }
        slot.currentCalledSymbol = calledSymbol
        for (const agent of slot.objectObserverRefrenceAgentIterator) {
            agent.records.forEach((record) => {
                record.watchers.forEach(function (watcher) {
                    watcher(obj)
                })
            })
        }
        for (const sr of slot.slotReferenceIterator) {
            step(sr.slot)
        }
    }
    step(slot)
}