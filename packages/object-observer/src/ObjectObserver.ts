import { Record, Watcher } from './Record'
import { ObservableTypes, create as createSlot, get as getSlot } from './Slot'
import { travel } from './travel'
import {makeObserve} from './observe'


type AgentConstructorOpt = { record?: Record }
class ObjectObserverRefrenceAgent<T extends ObservableTypes> {
    private rawObject: T
    public object: T
    constructor(obj: T, opt: AgentConstructorOpt) {
        this.rawObject = obj
        this.object = obj
        this.#makeObservable(opt)

    }
    #makeObservable(opt: AgentConstructorOpt) {
        let obj = this.rawObject
        let slot = getSlot(obj)

        if (slot) {
            this.object=obj
        }else{
            this.object = makeObserve(obj)
        }
        if(opt.record){
            this.addRecord(opt.record)
        }
        
    }
    addRecord(record: Record) {
        let self = this
        let obj = this.rawObject
        travel(obj, function (obj) {
            let slot = getSlot(obj)
            if (!slot) {
                console.error(self)
                throw 'Add record to unobserved object'
            }
            let recRef = slot.recordReferences.get(record)
            if (!recRef) {
                recRef = {
                    refCount: 1,
                    record
                }
                slot.recordReferences.set(record, recRef)
            } else {
                recRef.refCount++
            }
            return true
        })
    }
    removeRecord(record: Record) {
        let self = this
        let obj = this.rawObject
        travel(obj, function (obj) {
            let slot = getSlot(obj)
            if (!slot) {
                console.error(self)
                throw 'Remove record from unobserved object'
            }
            let recRef = slot.recordReferences.get(record)
            if (!recRef) {
                console.error(self)
                throw 'Remove record from not found recRef'
            }
            recRef.refCount--
            if (recRef.refCount < 0) {
                console.error(self)
                throw 'Remove record ref cound === 0'
            }
            if (recRef.refCount === 0) {
                slot.recordReferences.delete(record)
            }
            return true

        })
    }
}

export class ObjectObserver {

    makeObjectObservable(obj: ObservableTypes, opt: AgentConstructorOpt) {
        return new ObjectObserverRefrenceAgent(obj, opt)
    }
}
export function createRecord(config?:(record:Record)=>void) {
    let record = new Record()
    if(config){
        config(record)
    }
    return record
}